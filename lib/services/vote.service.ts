import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";
import { publicUserSelect } from "@/lib/serializers";
import type { VoteResult } from "@/lib/types";

async function assertVotable(postId: string) {
  await CampaignService.syncStatuses();
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { campaign: true } });
  if (!post) throw new HttpError(404, "Snap not found");
  const { campaign } = post;
  if (campaign.status !== CampaignStatus.ACTIVE || (campaign.endsAt && campaign.endsAt <= new Date())) {
    throw new HttpError(400, "Voting has closed for this campaign");
  }
  return post;
}

export class VoteService {
  static async vote(userId: string, postId: string): Promise<VoteResult> {
    const post = await assertVotable(postId);
    if (post.userId === userId) throw new HttpError(400, "You can't vote on your own snap");

    try {
      const updated = await prisma.$transaction(async (tx) => {
        await tx.vote.create({ data: { userId, postId } });
        return tx.post.update({
          where: { id: postId },
          data: { voteCount: { increment: 1 } },
          select: { voteCount: true },
        });
      });
      return { voteCount: updated.voteCount, hasVoted: true };
    } catch (error) {
      // Unique (userId, postId) — a double tap or a second device.
      if (error instanceof Error && "code" in error && error.code === "P2002") {
        throw new HttpError(409, "You already voted for this snap");
      }
      throw error;
    }
  }

  static async unvote(userId: string, postId: string): Promise<VoteResult> {
    await assertVotable(postId);
    const updated = await prisma.$transaction(async (tx) => {
      const { count } = await tx.vote.deleteMany({ where: { userId, postId } });
      if (count === 0) throw new HttpError(404, "You haven't voted for this snap");
      return tx.post.update({
        where: { id: postId },
        data: { voteCount: { decrement: 1 } },
        select: { voteCount: true },
      });
    });
    return { voteCount: updated.voteCount, hasVoted: false };
  }

  static async getPostVotes(postId: string, page = 1, limit = 20) {
    const where = { postId };
    const [votes, total] = await Promise.all([
      prisma.vote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, createdAt: true, user: { select: publicUserSelect } },
      }),
      prisma.vote.count({ where }),
    ]);
    return { votes, total };
  }
}
