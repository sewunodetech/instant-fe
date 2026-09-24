import Link from "next/link";
import { notFound } from "next/navigation";
import { Flame } from "lucide-react";
import { BackButton } from "@/components/layout/back-button";
import { ShareButton } from "@/components/snap/share-button";
import { SnapVoteView } from "@/components/snap/snap-vote-view";
import { feedSnaps, getCampaign, getSnap } from "@/lib/mock-data";
import { mapApiCampaign, mapApiPost } from "@/lib/mappers";
import { PostService } from "@/lib/services/post.service";
import { CampaignService } from "@/lib/services/campaign.service";

export async function generateMetadata({ params }: PageProps<"/snaps/[id]">) {
  try {
    const post = await PostService.findById((await params).id);
    if (post) {
      const handle = post.user?.username || "creator";
      return { title: `Vote for @${handle} · instant.fun` };
    }
  } catch {
    // fall through to mock
  }
  const snap = getSnap((await params).id);
  return { title: snap ? `Vote for @${snap.creator.handle} · instant.fun` : "Snap · instant.fun" };
}

export default async function SnapVotePage({ params }: PageProps<"/snaps/[id]">) {
  const id = (await params).id;

  let snap = null as ReturnType<typeof mapApiPost> | undefined;
  let campaign = null as ReturnType<typeof mapApiCampaign> | undefined;

  try {
    const post = await PostService.findById(id);
    if (post) {
      const apiCampaign = post.campaignId
        ? await CampaignService.findById(post.campaignId)
        : null;
      snap = mapApiPost(
        {
          ...post,
          user: post.user
            ? {
                id: post.user.id,
                walletAddress: post.user.walletAddress,
                username: post.user.username,
                displayName: post.user.displayName,
                avatarUrl: post.user.avatarUrl,
              }
            : undefined,
        },
        0
      );
      if (apiCampaign) campaign = mapApiCampaign(apiCampaign, 0);
    }
  } catch {
    // fall through to mock
  }

  if (!snap) {
    const mockSnap = getSnap(id);
    const mockCampaign = mockSnap && getCampaign(mockSnap.campaignId);
    if (!mockSnap || !mockCampaign) notFound();
    snap = mockSnap;
    campaign = mockCampaign;
  }

  if (!campaign) notFound();

  const isMock = id.startsWith("snap-");
  const linkCampaignId = isMock ? campaign.id : snap.campaignId || campaign.id;

  return (
    <div className="flex flex-col gap-space-md px-space-md pt-2 pb-4 sm:px-0">
      <div className="flex items-center justify-between">
        <BackButton />
        <Link
          href={`/campaigns/${linkCampaignId}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-secondary shadow-sm"
        >
          <Flame size={16} />
          <span className="text-label-md">{campaign.tag}</span>
        </Link>
        <ShareButton
          title={`Vote for @${snap.creator.handle} on instant.fun`}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface-container"
        />
      </div>

      <SnapVoteView snap={snap} campaign={campaign} />
    </div>
  );
}
