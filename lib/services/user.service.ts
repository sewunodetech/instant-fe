import { prisma } from "@/lib/prisma";
import { DonationStatus } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import { PostService } from "@/lib/services/post.service";
import { publicUserSelect, toNumber, toPublicUser } from "@/lib/serializers";
import type { ActivityItem, AppUser, UserStats } from "@/lib/types";

export const USERNAME_RE = /^[a-z0-9_]{3,30}$/;
const RESERVED = new Set(["me", "admin", "root", "support", "instant", "instantfun", "api", "null", "undefined"]);
const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type UserRow = {
  id: string;
  privyId: string | null;
  walletAddress: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPrivate: boolean;
};

export function toAppUser(u: UserRow): AppUser {
  return {
    id: u.id,
    privyId: u.privyId,
    walletAddress: u.walletAddress,
    username: u.username,
    displayName: u.displayName,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    isPrivate: u.isPrivate,
  };
}

/** Accepts our media proxy paths or absolute https URLs. */
export function isAllowedImageUrl(url: string) {
  if (url.startsWith("/api/media/")) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export class UserService {
  /** Resolves a profile by username, wallet address or id. */
  static async findByHandle(handle: string) {
    const key = decodeURIComponent(handle).replace(/^@/, "");
    if (WALLET_RE.test(key)) return prisma.user.findUnique({ where: { walletAddress: key.toLowerCase() } });
    if (UUID_RE.test(key)) return prisma.user.findUnique({ where: { id: key } });
    return prisma.user.findUnique({ where: { username: key.toLowerCase() } });
  }

  /**
   * Resolves a profile for a viewer. A private profile is `restricted` for
   * everyone except its owner: identity is visible, stats and lists aren't.
   */
  static async resolveForViewer(handle: string, viewerId?: string | null) {
    const user = await this.findByHandle(handle);
    if (!user) return null;
    return { user, restricted: user.isPrivate && user.id !== viewerId };
  }

  static async getStats(userId: string): Promise<UserStats> {
    const [snaps, joined, created, totals, podiums] = await Promise.all([
      prisma.post.count({ where: { userId } }),
      prisma.campaign.count({ where: { posts: { some: { userId } } } }),
      prisma.campaign.count({ where: { creatorId: userId } }),
      prisma.post.aggregate({ where: { userId }, _sum: { voteCount: true, donationAmount: true } }),
      PostService.podiumsFor(userId),
    ]);
    return {
      snaps,
      campaignsJoined: joined,
      campaignsCreated: created,
      votesReceived: totals._sum.voteCount ?? 0,
      wins: podiums.length,
      supportReceived: toNumber(totals._sum.donationAmount),
    };
  }

  static async update(
    userId: string,
    input: { username?: unknown; displayName?: unknown; avatarUrl?: unknown; bio?: unknown; isPrivate?: unknown }
  ) {
    const data: {
      username?: string;
      displayName?: string | null;
      avatarUrl?: string | null;
      bio?: string | null;
      isPrivate?: boolean;
    } = {};

    if (input.isPrivate !== undefined) {
      if (typeof input.isPrivate !== "boolean") throw new HttpError(400, "isPrivate must be true or false");
      data.isPrivate = input.isPrivate;
    }

    if (input.username !== undefined) {
      if (typeof input.username !== "string") throw new HttpError(400, "Username must be text");
      const username = input.username.trim().toLowerCase().replace(/^@/, "");
      if (!USERNAME_RE.test(username)) {
        throw new HttpError(400, "Username must be 3–30 characters: a–z, 0–9 or underscore");
      }
      if (RESERVED.has(username)) throw new HttpError(400, "That username is reserved");
      const taken = await prisma.user.findUnique({ where: { username }, select: { id: true } });
      if (taken && taken.id !== userId) throw new HttpError(409, "That username is already taken");
      data.username = username;
    }

    if (input.displayName !== undefined) {
      if (input.displayName !== null && typeof input.displayName !== "string") {
        throw new HttpError(400, "Display name must be text");
      }
      const displayName = (input.displayName ?? "").trim();
      if (displayName.length > 50) throw new HttpError(400, "Display name must be at most 50 characters");
      data.displayName = displayName || null;
    }

    if (input.bio !== undefined) {
      if (input.bio !== null && typeof input.bio !== "string") throw new HttpError(400, "Bio must be text");
      const bio = (input.bio ?? "").trim();
      if (bio.length > 160) throw new HttpError(400, "Bio must be at most 160 characters");
      data.bio = bio || null;
    }

    if (input.avatarUrl !== undefined) {
      if (input.avatarUrl !== null && (typeof input.avatarUrl !== "string" || !isAllowedImageUrl(input.avatarUrl))) {
        throw new HttpError(400, "Invalid avatar image");
      }
      data.avatarUrl = (input.avatarUrl as string | null) || null;
    }

    try {
      return toAppUser(await prisma.user.update({ where: { id: userId }, data }));
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        throw new HttpError(409, "That username is already taken");
      }
      throw error;
    }
  }

  /** Notification-style feed built from votes, support and results. */
  static async activity(userId: string, limit = 50): Promise<ActivityItem[]> {
    const [votes, supportIn, supportOut, podiums, hostedEnded] = await Promise.all([
      prisma.vote.findMany({
        where: { post: { userId }, userId: { not: userId } },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          user: { select: publicUserSelect },
          post: { select: { id: true, imageUrl: true, campaign: { select: { id: true, title: true } } } },
        },
      }),
      prisma.donation.findMany({
        where: { post: { userId }, status: DonationStatus.CONFIRMED },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          amount: true,
          updatedAt: true,
          user: { select: publicUserSelect },
          post: { select: { id: true, imageUrl: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.donation.findMany({
        where: { userId, status: DonationStatus.CONFIRMED },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          amount: true,
          updatedAt: true,
          post: { select: { id: true, imageUrl: true, user: { select: publicUserSelect } } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      PostService.podiumsFor(userId),
      prisma.campaign.findMany({
        where: { creatorId: userId, status: "ENDED" },
        orderBy: { endsAt: "desc" },
        take: 20,
        select: { id: true, title: true, endsAt: true, updatedAt: true },
      }),
    ]);

    const items: ActivityItem[] = [
      ...votes.map<ActivityItem>((v) => ({
        id: `vote-${v.id}`,
        kind: "vote",
        createdAt: v.createdAt.toISOString(),
        actor: toPublicUser(v.user),
        post: { id: v.post.id, imageUrl: v.post.imageUrl },
        campaign: v.post.campaign,
      })),
      ...supportIn.map<ActivityItem>((d) => ({
        id: `in-${d.id}`,
        kind: "support_in",
        createdAt: d.updatedAt.toISOString(),
        actor: toPublicUser(d.user),
        post: d.post,
        campaign: d.campaign,
        amount: toNumber(d.amount),
      })),
      ...supportOut.map<ActivityItem>((d) => ({
        id: `out-${d.id}`,
        kind: "support_out",
        createdAt: d.updatedAt.toISOString(),
        actor: toPublicUser(d.post.user),
        post: { id: d.post.id, imageUrl: d.post.imageUrl },
        campaign: d.campaign,
        amount: toNumber(d.amount),
      })),
      ...podiums.map<ActivityItem>((p) => ({
        id: `win-${p.campaign.id}`,
        kind: "win",
        createdAt: (p.endsAt ?? new Date()).toISOString(),
        actor: null,
        post: p.post,
        campaign: p.campaign,
        rank: p.rank,
        prize: p.prize,
      })),
      ...hostedEnded.map<ActivityItem>((c) => ({
        id: `end-${c.id}`,
        kind: "campaign_end",
        createdAt: (c.endsAt ?? c.updatedAt).toISOString(),
        actor: null,
        post: null,
        campaign: { id: c.id, title: c.title },
      })),
    ];

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }
}
