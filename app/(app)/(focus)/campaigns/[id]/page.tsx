import { CampaignDetail } from "@/components/campaign/campaign-detail";
import { CampaignService } from "@/lib/services/campaign.service";
import { campaignTag } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/campaigns/[id]">) {
  try {
    const campaign = await CampaignService.findRaw((await params).id);
    if (campaign) return { title: campaignTag(campaign.title), description: campaign.description ?? undefined };
  } catch {
    // metadata is best-effort
  }
  return { title: "Campaign" };
}

export default async function CampaignDetailPage({ params }: PageProps<"/campaigns/[id]">) {
  return <CampaignDetail id={(await params).id} />;
}
