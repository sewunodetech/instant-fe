import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { HttpError } from "@/lib/api-response";

type TxClient = Prisma.TransactionClient;

export class PostService {
  static async findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  static async create(
    campaignId: string,
    userId: string,
    imageUrl: string,
    caption?: string
  ) {
    return prisma.$transaction(async (tx: TxClient) => {
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaign) throw new HttpError(404, "Campaign not found");
      if (campaign.status !== "ACTIVE")
        throw new HttpError(400, "Campaign is not active");

      if (campaign.startsAt && new Date() < campaign.startsAt)
        throw new HttpError(400, "Campaign has not started yet");
      if (campaign.endsAt && new Date() > campaign.endsAt)
        throw new HttpError(400, "Campaign has ended");

      const existingPosts = await tx.post.count({
        where: { campaignId, userId },
      });
      if (existingPosts >= campaign.maxPostsPerUser) {
        throw new HttpError(
          400,
          `Maximum ${campaign.maxPostsPerUser} posts per campaign reached`
        );
      }

      return tx.post.create({
        data: { campaignId, userId, imageUrl, caption },
      });
    });
  }

  static async delete(id: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new HttpError(404, "Post not found");
    if (post.userId !== userId) throw new HttpError(403, "Not authorized");
    return prisma.post.delete({ where: { id } });
  }

  static async getUserPosts(
    walletAddress: string,
    page = 1,
    limit = 20
  ) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return { posts: [], total: 0 };
    const where = { userId: user.id };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: { select: { id: true, title: true, status: true } },
          user: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);
    return { posts, total };
  }
}
