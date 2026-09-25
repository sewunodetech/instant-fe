import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { CampaignService } from "@/lib/services/campaign.service";
import { campaignTag } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/campaigns/[id]/leaderboard">) {
  try {
    const campaign = await CampaignService.findRaw((await params).id);
    if (campaign) return { title: `${campaignTag(campaign.title)} Leaderboard` };
  } catch {
    // metadata is best-effort
  }
  return { title: "Leaderboard" };
}

export default async function LeaderboardPage({ params }: PageProps<"/campaigns/[id]/leaderboard">) {
  return <LeaderboardView id={(await params).id} />;
}
