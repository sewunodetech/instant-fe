import { prisma } from "@/lib/prisma";
import { CampaignStatus, Prisma } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";
import {
  PRIZE_SPLIT,
  postInclude,
  prizeForRank,
  publicUserSelect,
  serializePost,
  toPublicUser,
} from "@/lib/serializers";
import type { ApiPost, Leaderboard, LeaderboardEntry } from "@/lib/types";

type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>;

/** Leaderboard order: most votes first, earliest snap wins ties. */
const rankOrder: Prisma.PostOrderByWithRelationInput[] = [{ voteCount: "desc" }, { createdAt: "asc" }];

export type FeedSort = "latest" | "top";

export class PostService {
  /** Rank of every snap in the given campaigns, keyed by post id. */
  static async ranksFor(campaignIds: string[]) {
    const ranks = new Map<string, number>();
    if (campaignIds.length === 0) return ranks;
    const rows = await prisma.post.findMany({
      where: { campaignId: { in: campaignIds } },
      orderBy: rankOrder,
      select: { id: true, campaignId: true },
    });
    const counters = new Map<string, number>();
    for (const row of rows) {
      const next = (counters.get(row.campaignId) ?? 0) + 1;
      counters.set(row.campaignId, next);
      ranks.set(row.id, next);
    }
    return ranks;
  }

  static async votedBy(viewerId: string | null | undefined, postIds: string[]) {
    if (!viewerId || postIds.length === 0) return new Set<string>();
    const votes = await prisma.vote.findMany({
      where: { userId: viewerId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(votes.map((v) => v.postId));
  }

  static async serializeMany(rows: PostRow[], viewerId?: string | null): Promise<ApiPost[]> {
    const [ranks, voted] = await Promise.all([
      this.ranksFor([...new Set(rows.map((r) => r.campaignId))]),
      this.votedBy(viewerId, rows.map((r) => r.id)),
    ]);
    return rows.map((r) => serializePost(r, { hasVoted: voted.has(r.id), rank: ranks.get(r.id) ?? null }));
  }

  static async getById(id: string, viewerId?: string | null) {
    await CampaignService.syncStatuses();
    const row = await prisma.post.findUnique({ where: { id }, include: postInclude });
    if (!row) return null;
    const [post] = await this.serializeMany([row], viewerId);
    return post;
  }

  static async feed(
    opts: {
      sort?: FeedSort;
      campaignId?: string;
      userId?: string;
      activeOnly?: boolean;
      page?: number;
      limit?: number;
    },
    viewerId?: string | null
  ) {
    await CampaignService.syncStatuses();
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const where: Prisma.PostWhereInput = {};
    if (opts.campaignId) where.campaignId = opts.campaignId;
    if (opts.userId) where.userId = opts.userId;
    if (opts.activeOnly) where.campaign = { status: CampaignStatus.ACTIVE };

    const orderBy = opts.sort === "top" ? rankOrder : [{ createdAt: "desc" as const }];
    const [rows, total] = await Promise.all([
      prisma.post.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: postInclude }),
      prisma.post.count({ where }),
    ]);
    return { posts: await this.serializeMany(rows, viewerId), total };
  }

  static async create(campaignId: string, userId: string, imageUrl: string, caption?: string) {
    await CampaignService.syncStatuses(true);
    const created = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.findUnique({ where: { id: campaignId } });
      if (!campaign) throw new HttpError(404, "Campaign not found");
      if (campaign.status !== CampaignStatus.ACTIVE) throw new HttpError(400, "This campaign is not accepting snaps");
      if (campaign.endsAt && new Date() > campaign.endsAt) throw new HttpError(400, "This campaign has ended");

      const existing = await tx.post.count({ where: { campaignId, userId } });
      if (existing >= campaign.maxPostsPerUser) {
        throw new HttpError(
          400,
          `You've used all ${campaign.maxPostsPerUser} snaps for this campaign`
        );
      }
      return tx.post.create({ data: { campaignId, userId, imageUrl, caption }, include: postInclude });
    });
    const [post] = await this.serializeMany([created], userId);
    return post;
  }

  static async delete(id: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id }, include: { campaign: true } });
    if (!post) throw new HttpError(404, "Snap not found");
    if (post.userId !== userId) throw new HttpError(403, "You can only delete your own snaps");
    if (post.campaign.status === CampaignStatus.ENDED) {
      throw new HttpError(400, "Snaps can't be deleted after the campaign ends");
    }
    await prisma.post.delete({ where: { id } });
  }

  static async remainingSnaps(campaignId: string, userId: string) {
    const [campaign, used] = await Promise.all([
      prisma.campaign.findUnique({ where: { id: campaignId }, select: { maxPostsPerUser: true } }),
      prisma.post.count({ where: { campaignId, userId } }),
    ]);
    if (!campaign) return 0;
    return Math.max(0, campaign.maxPostsPerUser - used);
  }

  static async leaderboard(campaignId: string, viewerId?: string | null): Promise<Leaderboard | null> {
    const campaign = await CampaignService.getById(campaignId);
    if (!campaign) return null;

    const [rows, voterGroups] = await Promise.all([
      prisma.post.findMany({ where: { campaignId }, orderBy: rankOrder, take: 100, include: postInclude }),
      prisma.vote.groupBy({
        by: ["userId"],
        where: { post: { campaignId } },
        _count: { _all: true },
        orderBy: { _count: { userId: "desc" } },
        take: 10,
      }),
    ]);

    const voted = await this.votedBy(viewerId, rows.map((r) => r.id));
    const entries: LeaderboardEntry[] = rows.map((row, i) => ({
      rank: i + 1,
      prize: prizeForRank(campaign.prizePool, i + 1),
      post: serializePost(row, { hasVoted: voted.has(row.id), rank: i + 1 }),
    }));

    const voters = await prisma.user.findMany({
      where: { id: { in: voterGroups.map((g) => g.userId) } },
      select: publicUserSelect,
    });
    const voterById = new Map(voters.map((u) => [u.id, u]));
    const topVoters = voterGroups
      .map((g) => ({ user: toPublicUser(voterById.get(g.userId))!, votes: g._count._all }))
      .filter((v) => v.user);

    const myEntry = viewerId ? (entries.find((e) => e.post.user.id === viewerId) ?? null) : null;

    return { campaign, entries, topVoters, myEntry, prizeSplit: PRIZE_SPLIT };
  }

  /**
   * Top-3 finishes in ended campaigns, per user. Used for profile "wins",
   * activity results and the winner announcement.
   */
  static async podiumsFor(userId: string) {
    const ended = await prisma.campaign.findMany({
      where: { status: CampaignStatus.ENDED, posts: { some: { userId } } },
      select: { id: true, title: true, endsAt: true, prizePool: true },
      orderBy: { endsAt: "desc" },
      take: 50,
    });
    if (ended.length === 0) return [];

    const ranks = await this.ranksFor(ended.map((c) => c.id));
    const mine = await prisma.post.findMany({
      where: { userId, campaignId: { in: ended.map((c) => c.id) } },
      select: { id: true, campaignId: true, imageUrl: true },
    });

    const best = new Map<string, { postId: string; imageUrl: string; rank: number }>();
    for (const p of mine) {
      const rank = ranks.get(p.id);
      if (!rank || rank > PRIZE_SPLIT.length) continue;
      const current = best.get(p.campaignId);
      if (!current || rank < current.rank) best.set(p.campaignId, { postId: p.id, imageUrl: p.imageUrl, rank });
    }

    return ended.flatMap((c) => {
      const b = best.get(c.id);
      if (!b) return [];
      return [
        {
          campaign: { id: c.id, title: c.title },
          endsAt: c.endsAt,
          rank: b.rank,
          prize: prizeForRank(Number(c.prizePool), b.rank),
          post: { id: b.postId, imageUrl: b.imageUrl },
        },
      ];
    });
  }
}
