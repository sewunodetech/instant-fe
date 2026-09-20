import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api-response";
import { ViralityService } from "./virality.service";

export class RewardCalculationService {
  static async calculateCreatorRewards(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new HttpError(404, "Campaign not found");

    const leaderboard = await ViralityService.getLeaderboard(campaignId);
    const rewards: Array<{
      userId: string;
      postId: string;
      amount: number;
      multiplier?: number;
    }> = [];

    const topPosts = leaderboard.slice(0, 3);

    for (const item of topPosts) {
      const post = await prisma.post.findUnique({
        where: { id: item.postId },
      });
      if (!post) continue;

      const rewardAmount = this.getCreatorRewardAmount(item.rank);

      rewards.push({
        userId: post.userId,
        postId: item.postId,
        amount: rewardAmount,
      });
    }

    return rewards;
  }

  static async calculateBackerRewards(campaignId: string) {
    const leaderboard = await ViralityService.getLeaderboard(campaignId);
    const topPostIds = leaderboard.slice(0, 3).map((item: { postId: string }) => item.postId);

    const backings = await prisma.backing.findMany({
      where: {
        campaignId,
        postId: { in: topPostIds },
        status: "CONFIRMED",
      },
    });

    const rewards: Array<{
      userId: string;
      postId: string;
      amount: number;
      multiplier: number;
    }> = [];

    for (const backing of backings) {
      const rank =
        leaderboard.findIndex((item: { postId: string }) => item.postId === backing.postId) + 1;
      const multiplier = this.getBackerMultiplier(rank);

      rewards.push({
        userId: backing.userId,
        postId: backing.postId,
        amount: Number(backing.amount) * multiplier,
        multiplier,
      });
    }

    return rewards;
  }

  static getCreatorRewardAmount(rank: number): number {
    const rewards: Record<number, number> = {
      1: 100,
      2: 50,
      3: 25,
    };
    return rewards[rank] || 0;
  }

  static getBackerMultiplier(rank: number): number {
    const multipliers: Record<number, number> = {
      1: 5.0,
      2: 3.0,
      3: 2.0,
    };
    return multipliers[rank] || 1.0;
  }

  static async persistRewards(campaignId: string) {
    const [creatorRewards, backerRewards] = await Promise.all([
      this.calculateCreatorRewards(campaignId),
      this.calculateBackerRewards(campaignId),
    ]);

    const allRewards = [
      ...creatorRewards.map((r) => ({
        campaignId,
        userId: r.userId,
        postId: r.postId,
        type: "CREATOR_REWARD" as const,
        amount: r.amount,
        multiplier: null,
      })),
      ...backerRewards.map((r) => ({
        campaignId,
        userId: r.userId,
        postId: r.postId,
        type: "BACKER_REWARD" as const,
        amount: r.amount,
        multiplier: r.multiplier,
      })),
    ];

    for (const reward of allRewards) {
      await prisma.reward.create({
        data: {
          ...reward,
          amount: reward.amount,
          token: "USDC",
          status: "PENDING",
        },
      });
    }

    return allRewards;
  }
}
