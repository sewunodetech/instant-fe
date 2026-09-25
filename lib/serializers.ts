import type { ApiCampaign, ApiPost, CampaignStats, PublicUser } from "@/lib/types";

/** Prisma `select` for the user fields safe to expose publicly. */
export const publicUserSelect = {
  id: true,
  walletAddress: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

type DecimalLike = { toString(): string } | number | string | null | undefined;

export function toNumber(value: DecimalLike) {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.toISOString();
}

export function toPublicUser(user: PublicUser | null | undefined): PublicUser | null {
  if (!user) return null;
  return {
    id: user.id,
    walletAddress: user.walletAddress,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

function toRules(rules: unknown): string[] {
  if (!Array.isArray(rules)) return [];
  return rules.filter((r): r is string => typeof r === "string" && r.trim().length > 0);
}

type CampaignRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  rules: unknown;
  coverImageUrl: string | null;
  prizePool: DecimalLike;
  maxPostsPerUser: number;
  status: ApiCampaign["status"];
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  creator?: PublicUser | null;
};

export function serializeCampaign(
  c: CampaignRow,
  extra?: { stats?: CampaignStats; topImageUrl?: string | null; joined?: boolean }
): ApiCampaign {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    rules: toRules(c.rules),
    coverImageUrl: c.coverImageUrl,
    prizePool: toNumber(c.prizePool),
    maxPostsPerUser: c.maxPostsPerUser,
    status: c.status,
    startsAt: iso(c.startsAt),
    endsAt: iso(c.endsAt),
    createdAt: iso(c.createdAt)!,
    creator: toPublicUser(c.creator),
    stats: extra?.stats ?? { snaps: 0, creators: 0, votes: 0 },
    topImageUrl: extra?.topImageUrl ?? null,
    joined: extra?.joined ?? false,
  };
}

type PostRow = {
  id: string;
  campaignId: string;
  imageUrl: string;
  caption: string | null;
  voteCount: number;
  donationCount: number;
  donationAmount: DecimalLike;
  createdAt: Date;
  user: PublicUser;
  campaign: {
    id: string;
    title: string;
    status: ApiCampaign["status"];
    endsAt: Date | null;
    prizePool: DecimalLike;
  };
};

export function serializePost(
  p: PostRow,
  extra?: { hasVoted?: boolean; rank?: number | null }
): ApiPost {
  return {
    id: p.id,
    campaignId: p.campaignId,
    imageUrl: p.imageUrl,
    caption: p.caption,
    voteCount: p.voteCount,
    donationCount: p.donationCount,
    donationAmount: toNumber(p.donationAmount),
    createdAt: iso(p.createdAt)!,
    user: toPublicUser(p.user)!,
    campaign: {
      id: p.campaign.id,
      title: p.campaign.title,
      status: p.campaign.status,
      endsAt: iso(p.campaign.endsAt),
      prizePool: toNumber(p.campaign.prizePool),
    },
    hasVoted: extra?.hasVoted ?? false,
    rank: extra?.rank ?? null,
  };
}

/** Prisma `include` producing a row `serializePost` accepts. */
export const postInclude = {
  user: { select: publicUserSelect },
  campaign: { select: { id: true, title: true, status: true, endsAt: true, prizePool: true } },
} as const;

/** Share of the prize pool for 1st, 2nd and 3rd place. */
export const PRIZE_SPLIT = [0.5, 0.3, 0.2];

export function prizeForRank(prizePool: number, rank: number) {
  const share = PRIZE_SPLIT[rank - 1];
  if (!share || prizePool <= 0) return 0;
  return Math.round(prizePool * share * 100) / 100;
}
