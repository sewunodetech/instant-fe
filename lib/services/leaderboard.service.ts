import { prisma } from "@/lib/prisma";
import { ViralityService } from "./virality.service";
import { HttpError } from "@/lib/api-response";

export class LeaderboardService {
  static async getLeaderboard(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new HttpError(404, "Campaign not found");

    const items = await ViralityService.getLeaderboard(campaignId);

    return {
      campaign: { id: campaign.id, title: campaign.title },
      items,
    };
  }
}
