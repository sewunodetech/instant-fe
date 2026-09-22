import { prisma } from "@/lib/prisma";
import { DonationStatus, Prisma } from "@/lib/generated/prisma";
import { HttpError } from "@/lib/api-response";
import { BlockchainService } from "./blockchain.service";

type TxClient = Prisma.TransactionClient;

export class DonationService {
  static async createDonationIntent(userId: string, postId: string, amount: number) {
    if (amount <= 0) {
      throw new HttpError(400, "Donation amount must be greater than 0");
    }
    if (amount > 10000) {
      throw new HttpError(400, "Donation amount cannot exceed 10,000");
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { campaign: true },
    });
    if (!post) throw new HttpError(404, "Post not found");
    if (post.campaign.status !== "ACTIVE")
      throw new HttpError(400, "Campaign is not active");

    const chainId = parseInt(process.env.CHAIN_ID || "97");
    const transaction = await BlockchainService.prepareDonationTransaction({
      campaignId: post.campaignId,
      postId,
      userId,
      amount: amount.toString(),
      token: "USDC",
      chainId,
    });

    const donation = await prisma.donation.create({
      data: {
        campaignId: post.campaignId,
        postId,
        userId,
        amount,
        token: "USDC",
        status: DonationStatus.PENDING,
      },
    });

    return { donation, transaction };
  }

  static async confirmDonation(txHash: string, blockNumber: number) {
    const donation = await prisma.donation.findFirst({
      where: { txHash },
    });
    if (!donation)
      throw new HttpError(404, "Donation with this txHash not found");

    if (donation.status === DonationStatus.CONFIRMED) {
      return donation;
    }

    return prisma.$transaction(async (tx: TxClient) => {
      const updatedDonation = await tx.donation.update({
        where: { id: donation.id },
        data: {
          status: DonationStatus.CONFIRMED,
          blockNumber: BigInt(blockNumber),
        },
      });

      await tx.post.update({
        where: { id: donation.postId },
        data: {
          donationCount: { increment: 1 },
          donationAmount: { increment: donation.amount },
        },
      });

      await tx.transaction.create({
        data: {
          txHash,
          chainId: parseInt(process.env.CHAIN_ID || "97"),
          userId: donation.userId,
          campaignId: donation.campaignId,
          type: "DONATION",
          status: "CONFIRMED",
          amount: donation.amount,
          token: donation.token,
          blockNumber: BigInt(blockNumber),
        },
      });

      return updatedDonation;
    });
  }

  static async getPostDonors(postId: string, page = 1, limit = 20) {
    const where = { postId };
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
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
      prisma.donation.count({ where }),
    ]);
    return { donations, total };
  }

  static async getUserDonations(
    walletAddress: string,
    page = 1,
    limit = 20
  ) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return { donations: [], total: 0 };
    const where = { userId: user.id };
    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post: { select: { id: true, imageUrl: true, caption: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.donation.count({ where }),
    ]);
    return { donations, total };
  }
}
