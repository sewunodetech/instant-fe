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

  /** Campaign ids (from `ids`) the viewer has posted in. */
  static async joinedSet(viewerId: string | null | undefined, ids: string[]) {
    if (!viewerId || ids.length === 0) return new Set<string>();
    const rows = await prisma.post.findMany({
      where: { userId: viewerId, campaignId: { in: ids } },
      select: { campaignId: true },
      distinct: ["campaignId"],
    });
    return new Set(rows.map((r) => r.campaignId));
  }

  static async serializeMany(rows: CampaignWithCreator[], viewerId?: string | null): Promise<ApiCampaign[]> {
    const ids = rows.map((r) => r.id);
    const [{ stats, topImages }, joined] = await Promise.all([this.statsFor(ids), this.joinedSet(viewerId, ids)]);
    return rows.map((r) =>
      serializeCampaign(r, { stats: stats.get(r.id), topImageUrl: topImages.get(r.id) ?? null, joined: joined.has(r.id) })
    );
  }

  static async findRaw(id: string) {
    await this.syncStatuses();
    return prisma.campaign.findUnique({ where: { id }, include: campaignInclude });
  }

  static async getById(id: string, viewerId?: string | null): Promise<ApiCampaign | null> {
    const row = await this.findRaw(id);
    if (!row) return null;
    const [campaign] = await this.serializeMany([row], viewerId);
    return campaign;
  }

  static async list(
    filter: CampaignFilter = "active",
    page = 1,
    limit = 20,
    category?: string,
    viewerId?: string | null
  ) {
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
    return { campaigns: await this.serializeMany(rows, viewerId), total };
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

  /**
   * Host edits a live campaign. The brief can change freely; anything that
   * affects entrants can only move in their favour (more prize, more time,
   * more snaps) so nobody's entry is invalidated mid-campaign.
   */
  static async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      category?: string | null;
      rules?: string[];
      coverImageUrl?: string | null;
      prizePool?: number;
      maxPostsPerUser?: number;
      extendDays?: number;
    }
  ) {
    const campaign = await this.assertCreator(id, userId);
    if (campaign.status === CampaignStatus.ENDED) throw new HttpError(400, "Campaign has ended");

    const { extendDays, ...fields } = data;
    if (fields.prizePool !== undefined && fields.prizePool < Number(campaign.prizePool)) {
      throw new HttpError(400, "The prize pool can only be increased");
    }
    if (fields.maxPostsPerUser !== undefined && fields.maxPostsPerUser < campaign.maxPostsPerUser) {
      throw new HttpError(400, "Snaps per creator can only be increased");
    }

    let endsAt: Date | undefined;
    if (extendDays) {
      const base = campaign.endsAt && campaign.endsAt > new Date() ? campaign.endsAt : new Date();
      endsAt = new Date(base.getTime() + extendDays * 86_400_000);
      if (endsAt.getTime() - Date.now() > 30 * 86_400_000) {
        throw new HttpError(400, "A campaign can run at most 30 days from now");
      }
    }

    const row = await prisma.campaign.update({
      where: { id },
      data: { ...fields, ...(endsAt ? { endsAt } : {}) },
      include: campaignInclude,
    });
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
  static async joinedBy(userId: string, page = 1, limit = 20, viewerId?: string | null) {
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
    return { campaigns: await this.serializeMany(rows, viewerId), total };
  }

  /** Campaigns a user hosts, newest first. */
  static async hostedBy(userId: string, page = 1, limit = 20, viewerId?: string | null) {
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
    return { campaigns: await this.serializeMany(rows, viewerId), total };
  }
}
