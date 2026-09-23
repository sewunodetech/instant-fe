import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { HttpError } from "@/lib/api-response";

type TxClient = Prisma.TransactionClient;

export class VoteService {
  static async vote(userId: string, postId: string) {
    return prisma.$transaction(async (tx: TxClient) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
        include: { campaign: true },
      });
      if (!post) throw new HttpError(404, "Post not found");
      if (post.campaign.status !== "ACTIVE")
        throw new HttpError(400, "Campaign is not active");

      if (post.userId === userId)
        throw new HttpError(400, "Cannot vote on your own post");

      const existing = await tx.vote.findUnique({
        where: { userId_postId: { userId, postId } },
      });
      if (existing) throw new HttpError(409, "Already voted on this post");

      await tx.vote.create({ data: { userId, postId } });
      await tx.post.update({
        where: { id: postId },
        data: { voteCount: { increment: 1 } },
      });

      return { success: true };
    });
  }

  static async unvote(userId: string, postId: string) {
    return prisma.$transaction(async (tx: TxClient) => {
      const existing = await tx.vote.findUnique({
        where: { userId_postId: { userId, postId } },
      });
      if (!existing) throw new HttpError(404, "Vote not found");

      await tx.vote.delete({ where: { id: existing.id } });
      await tx.post.update({
        where: { id: postId },
        data: { voteCount: { decrement: 1 } },
      });

      return { success: true };
    });
  }

  static async getPostVotes(postId: string, page = 1, limit = 20) {
    const where = { postId };
    const [votes, total] = await Promise.all([
      prisma.vote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              displayName: true,
            },
          },
        },
      }),
      prisma.vote.count({ where }),
    ]);
    return { votes, total };
  }
}
