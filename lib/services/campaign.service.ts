import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@/lib/generated/prisma";
import { HttpError } from "@/lib/api-response";

export class CampaignService {
  static async findById(id: string) {
    return prisma.campaign.findUnique({ where: { id } });
  }

  static async findAll(
    filters?: { status?: CampaignStatus; category?: string },
    page = 1,
    limit = 20
  ) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);
    return { campaigns, total };
  }

  static async create(data: {
    title: string;
    description?: string;
    category?: string;
    rules?: string[];
    maxPostsPerUser?: number;
    startsAt?: string;
    endsAt?: string;
  }) {
    return prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        rules: data.rules || [],
        maxPostsPerUser: data.maxPostsPerUser || 3,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
  }

  static async update(id: string, data: Record<string, unknown>) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new HttpError(404, "Campaign not found");
    return prisma.campaign.update({ where: { id }, data });
  }

  static async start(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new HttpError(404, "Campaign not found");
    if (campaign.status !== CampaignStatus.DRAFT)
      throw new HttpError(400, "Campaign is not in DRAFT status");
    return prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ACTIVE, startsAt: new Date() },
    });
  }

  static async finish(id: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new HttpError(404, "Campaign not found");
    if (campaign.status !== CampaignStatus.ACTIVE)
      throw new HttpError(400, "Campaign is not ACTIVE");
    return prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.ENDED },
    });
  }

  static async getCampaignPosts(
    campaignId: string,
    page = 1,
    limit = 20
  ) {
    const where = { campaignId };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
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
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);
    return { posts, total };
  }

  static async getCampaignDonations(
    campaignId: string,
    page = 1,
    limit = 20
  ) {
    const where = { campaignId };
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
          post: { select: { id: true, imageUrl: true, caption: true } },
        },
      }),
      prisma.donation.count({ where }),
    ]);
    return { donations, total };
  }

  static async getCampaignTransactions(
    campaignId: string,
    page = 1,
    limit = 20
  ) {
    const where = { campaignId };
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions, total };
  }

  static async getUserCampaigns(
    walletAddress: string,
    page = 1,
    limit = 20
  ) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return { campaigns: [], total: 0 };
    const where = { posts: { some: { userId: user.id } } };
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);
    return { campaigns, total };
  }
}
