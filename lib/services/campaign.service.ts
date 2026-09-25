import { prisma } from "@/lib/prisma";
import { CampaignStatus, Prisma } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import { publicUserSelect, serializeCampaign } from "@/lib/serializers";
import type { ApiCampaign, CampaignStats } from "@/lib/types";

const SYNC_INTERVAL_MS = 30_000;
let lastSync = 0;

const campaignInclude = { creator: { select: publicUserSelect } } as const;

type CampaignWithCreator = Prisma.CampaignGetPayload<{ include: typeof campaignInclude }>;

export type CampaignFilter = "active" | "ended" | "all";

export class CampaignService {
  /**
   * Campaigns have no scheduler: statuses are reconciled lazily on read.
   * Scheduled drafts go live at `startsAt`, live ones close at `endsAt`.
   */
  static async syncStatuses(force = false) {
    const now = Date.now();
    if (!force && now - lastSync < SYNC_INTERVAL_MS) return;
    lastSync = now;
    const date = new Date(now);
    await prisma.$transaction([
      prisma.campaign.updateMany({
        where: { status: CampaignStatus.DRAFT, startsAt: { lte: date } },
        data: { status: CampaignStatus.ACTIVE },
      }),
      prisma.campaign.updateMany({
        where: { status: CampaignStatus.ACTIVE, endsAt: { lte: date } },
        data: { status: CampaignStatus.ENDED },
      }),
    ]);
  }

  /** Aggregated counts + top snap image for a set of campaigns. */
  static async statsFor(ids: string[]) {
    const stats = new Map<string, CampaignStats>();
    const topImages = new Map<string, string>();
    if (ids.length === 0) return { stats, topImages };

    const [totals, creators, tops] = await Promise.all([
      prisma.post.groupBy({
        by: ["campaignId"],
        where: { campaignId: { in: ids } },
        _count: { _all: true },
        _sum: { voteCount: true },
      }),
      prisma.post.groupBy({
        by: ["campaignId", "userId"],
        where: { campaignId: { in: ids } },
      }),
      prisma.post.findMany({
        where: { campaignId: { in: ids } },
        orderBy: [{ voteCount: "desc" }, { createdAt: "asc" }],
        distinct: ["campaignId"],
        select: { campaignId: true, imageUrl: true },
      }),
    ]);

    const creatorCounts = new Map<string, number>();
    for (const row of creators) {
      creatorCounts.set(row.campaignId, (creatorCounts.get(row.campaignId) ?? 0) + 1);
    }
    for (const row of totals) {
      stats.set(row.campaignId, {
        snaps: row._count._all,
        creators: creatorCounts.get(row.campaignId) ?? 0,
        votes: row._sum.voteCount ?? 0,
      });
    }
    for (const row of tops) topImages.set(row.campaignId, row.imageUrl);
    return { stats, topImages };
  }

  static async serializeMany(rows: CampaignWithCreator[]): Promise<ApiCampaign[]> {
    const { stats, topImages } = await this.statsFor(rows.map((r) => r.id));
    return rows.map((r) =>
      serializeCampaign(r, { stats: stats.get(r.id), topImageUrl: topImages.get(r.id) ?? null })
    );
  }

  static async findRaw(id: string) {
    await this.syncStatuses();
    return prisma.campaign.findUnique({ where: { id }, include: campaignInclude });
  }

  static async getById(id: string): Promise<ApiCampaign | null> {
    const row = await this.findRaw(id);
    if (!row) return null;
    const [campaign] = await this.serializeMany([row]);
    return campaign;
  }

  static async list(filter: CampaignFilter = "active", page = 1, limit = 20, category?: string) {
    await this.syncStatuses();
    const where: Prisma.CampaignWhereInput = {};
    if (filter === "active") where.status = CampaignStatus.ACTIVE;
    if (filter === "ended") where.status = CampaignStatus.ENDED;
    if (filter === "all") where.status = { in: [CampaignStatus.ACTIVE, CampaignStatus.ENDED] };
    if (category) where.category = category;

    const orderBy: Prisma.CampaignOrderByWithRelationInput[] =
      filter === "active" ? [{ endsAt: "asc" }, { createdAt: "desc" }] : [{ endsAt: "desc" }];

    const [rows, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: campaignInclude,
      }),
      prisma.campaign.count({ where }),
    ]);
    return { campaigns: await this.serializeMany(rows), total };
  }

  static async create(
    creatorId: string,
    data: {
      title: string;
      description?: string;
      category?: string;
      rules?: string[];
      coverImageUrl?: string;
      prizePool?: number;
      maxPostsPerUser?: number;
      durationDays: number;
    }
  ) {
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + data.durationDays * 86_400_000);
    const row = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        rules: data.rules ?? [],
        coverImageUrl: data.coverImageUrl,
        prizePool: data.prizePool ?? 0,
        maxPostsPerUser: data.maxPostsPerUser ?? 3,
        status: CampaignStatus.ACTIVE,
        startsAt,
        endsAt,
        creatorId,
      },
      include: campaignInclude,
    });
    const [campaign] = await this.serializeMany([row]);
    return campaign;
  }

  static async assertCreator(id: string, userId: string) {
    const campaign = await this.findRaw(id);
    if (!campaign) throw new HttpError(404, "Campaign not found");
    if (campaign.creatorId !== userId) throw new HttpError(403, "Only the host can manage this campaign");
    return campaign;
  }

  static async update(
    id: string,
    userId: string,
    data: { description?: string; rules?: string[]; coverImageUrl?: string | null }
  ) {
    const campaign = await this.assertCreator(id, userId);
    if (campaign.status === CampaignStatus.ENDED) throw new HttpError(400, "Campaign has ended");
    const row = await prisma.campaign.update({ where: { id }, data, include: campaignInclude });
    const [serialized] = await this.serializeMany([row]);
    return serialized;
  }

  /** Host closes the campaign now; results are final from this point. */
  static async end(id: string, userId: string) {
    const campaign = await this.assertCreator(id, userId);
    if (campaign.status === CampaignStatus.ENDED) throw new HttpError(400, "Campaign already ended");
    const row = await prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ENDED, endsAt: new Date() },
      include: campaignInclude,
    });
    const [serialized] = await this.serializeMany([row]);
    return serialized;
  }

  /** Campaigns a user has posted in, newest first. */
  static async joinedBy(userId: string, page = 1, limit = 20) {
    await this.syncStatuses();
    const where: Prisma.CampaignWhereInput = { posts: { some: { userId } } };
    const [rows, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: campaignInclude,
      }),
      prisma.campaign.count({ where }),
    ]);
    return { campaigns: await this.serializeMany(rows), total };
  }

  /** Campaigns a user hosts, newest first. */
  static async hostedBy(userId: string, page = 1, limit = 20) {
    await this.syncStatuses();
    const where: Prisma.CampaignWhereInput = { creatorId: userId };
    const [rows, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: campaignInclude,
      }),
      prisma.campaign.count({ where }),
    ]);
    return { campaigns: await this.serializeMany(rows), total };
  }
}
