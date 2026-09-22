import { prisma } from "@/lib/prisma";

export class UserService {
  static async findByPrivyId(privyId: string) {
    return prisma.user.findUnique({ where: { privyId } });
  }

  static async findByWalletAddress(walletAddress: string) {
    return prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  static async createOrUpdate(privyId: string, data?: {
    walletAddress?: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
  }) {
    return prisma.user.upsert({
      where: { privyId },
      update: data || {},
      create: { privyId, ...data },
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

    const [posts, campaigns, donations] = await Promise.all([
      prisma.post.count({ where: { userId: user.id } }),
      prisma.campaign.count({
        where: { posts: { some: { userId: user.id } } },
      }),
      prisma.donation.aggregate({
        where: { userId: user.id, status: "CONFIRMED" },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      posts,
      campaigns,
      donated: donations._count.toString(),
      totalDonated: (donations._sum.amount || 0).toString(),
    };
  }
}
