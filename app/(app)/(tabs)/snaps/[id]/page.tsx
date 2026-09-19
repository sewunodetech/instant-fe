import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { BackButton } from "@/components/layout/back-button";
import { ShareButton } from "@/components/snap/share-button";
import { SnapVoteView } from "@/components/snap/snap-vote-view";
import { feedSnaps, getCampaign, getSnap } from "@/lib/mock-data";

export function generateStaticParams() {
  return feedSnaps.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/snaps/[id]">) {
  const snap = getSnap((await params).id);
  return { title: snap ? `Vote for @${snap.creator.handle} · instant.fun` : "Snap · instant.fun" };
}

export default async function SnapVotePage({ params }: PageProps<"/snaps/[id]">) {
  const snap = getSnap((await params).id);
  const campaign = snap && getCampaign(snap.campaignId);
  if (!snap || !campaign) notFound();

  return (
    <div className="flex flex-col gap-space-md px-space-md pt-2 pb-4">
      <div className="flex items-center justify-between">
        <BackButton />
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-secondary shadow-sm"
        >
          <Icon name="local_fire_department" className="text-[16px]" />
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
