import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";

export class UserService {
  static async findByWalletAddress(walletAddress: string) {
    return prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async createOrUpdate(
    walletAddress: string,
    data?: { username?: string; displayName?: string; avatarUrl?: string }
  ) {
    const addr = walletAddress.toLowerCase();
    return prisma.user.upsert({
      where: { walletAddress: addr },
      update: data || {},
      create: { walletAddress: addr },
    });
  }

  static async update(
    userId: string,
    data: { username?: string; displayName?: string; avatarUrl?: string }
  ) {
    return prisma.user.update({ where: { id: userId }, data });
  }

  static async getStats(walletAddress: string) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return null;

    const [posts, campaigns, backings, rewards] = await Promise.all([
      prisma.post.count({ where: { userId: user.id } }),
      prisma.campaign.count({
        where: { posts: { some: { userId: user.id } } },
      }),
      prisma.backing.count({ where: { userId: user.id } }),
      prisma.reward.aggregate({
        where: { userId: user.id, status: "DISTRIBUTED" },
        _sum: { amount: true },
      }),
    ]);

    return {
      posts,
      campaigns,
      backed: backings.toString(),
      earned: (rewards._sum.amount || new Prisma.Decimal(0)).toString(),
    };
  }
}
