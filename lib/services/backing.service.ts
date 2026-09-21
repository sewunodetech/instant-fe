import { prisma } from "@/lib/prisma";
import { BackingStatus, Prisma } from "@/lib/generated/prisma";
import { HttpError } from "@/lib/api-response";
import { BlockchainService } from "./blockchain.service";

type TxClient = Prisma.TransactionClient;

export class BackingService {
  static async createBackingIntent(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { campaign: true },
    });
    if (!post) throw new HttpError(404, "Post not found");
    if (post.campaign.status !== "ACTIVE")
      throw new HttpError(400, "Campaign is not active");

    const existingBacking = await prisma.backing.findFirst({
      where: { userId, postId, status: BackingStatus.CONFIRMED },
    });
    if (existingBacking)
      throw new HttpError(409, "Already backed this post");

    const chainId = parseInt(process.env.CHAIN_ID || "97");
    const transaction = await BlockchainService.prepareBackingTransaction({
      campaignId: post.campaignId,
      postId,
      userId,
      amount: "1",
      token: "USDC",
      chainId,
    });

    const backing = await prisma.backing.create({
      data: {
        campaignId: post.campaignId,
        postId,
        userId,
        amount: 1,
        token: "USDC",
        status: BackingStatus.PENDING,
      },
    });

    return { backing, transaction };
  }

  static async confirmBacking(txHash: string, blockNumber: number) {
    const backing = await prisma.backing.findFirst({
      where: { txHash },
    });
    if (!backing)
      throw new HttpError(404, "Backing with this txHash not found");

    return prisma.$transaction(async (tx: TxClient) => {
      const updatedBacking = await tx.backing.update({
        where: { id: backing.id },
        data: {
          status: BackingStatus.CONFIRMED,
          blockNumber: BigInt(blockNumber),
        },
      });

      await tx.post.update({
        where: { id: backing.postId },
        data: {
          backerCount: { increment: 1 },
          backingAmount: { increment: backing.amount },
        },
      });

      await tx.transaction.create({
        data: {
          txHash,
          chainId: parseInt(process.env.CHAIN_ID || "97"),
          userId: backing.userId,
          campaignId: backing.campaignId,
          type: "BACKING",
          status: "CONFIRMED",
          amount: backing.amount,
          token: backing.token,
          blockNumber: BigInt(blockNumber),
        },
      });

      return updatedBacking;
    });
  }

  static async getPostBackers(postId: string, page = 1, limit = 20) {
    const where = { postId };
    const [backings, total] = await Promise.all([
      prisma.backing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, walletAddress: true, username: true },
          },
        },
      }),
      prisma.backing.count({ where }),
    ]);
    return { backings, total };
  }

  static async getUserBackings(
    walletAddress: string,
    page = 1,
    limit = 20
  ) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return { backings: [], total: 0 };
    const where = { userId: user.id };
    const [backings, total] = await Promise.all([
      prisma.backing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post: { select: { id: true, imageUrl: true, caption: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.backing.count({ where }),
    ]);
    return { backings, total };
  }
}
