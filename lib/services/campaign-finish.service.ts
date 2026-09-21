import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma";
import { HttpError } from "@/lib/api-response";
import { ViralityService } from "./virality.service";
import { RewardCalculationService } from "./reward.service";

type TxClient = Prisma.TransactionClient;

export class CampaignFinishService {
  static async finishCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new HttpError(404, "Campaign not found");
    if (campaign.status !== "ACTIVE")
      throw new HttpError(400, "Campaign is not ACTIVE");

    if (campaign.endsAt && new Date() < campaign.endsAt) {
      throw new HttpError(400, "Campaign end time has not been reached");
    }

    const leaderboard = await ViralityService.getLeaderboard(campaignId);

    await prisma.$transaction(async (tx: TxClient) => {
      for (const item of leaderboard) {
        await tx.campaignResult.create({
          data: {
            campaignId,
            postId: item.postId,
            rank: item.rank,
            voteCount: item.voteCount,
            backerCount: item.backerCount,
            backingAmount: parseFloat(item.backingAmount),
            viralityScore: item.viralityScore,
          },
        });
      }

      await tx.campaign.update({
        where: { id: campaignId },
        data: { status: "ENDED" },
      });
    });

    const rewards = await RewardCalculationService.persistRewards(campaignId);

    return {
      campaignId,
      status: "ENDED",
      leaderboard,
      rewardsCount: rewards.length,
    };
  }
}
