import Link from "next/link";
import { ArrowRight, Camera, Hourglass, Tag, Trophy, Users } from "lucide-react";
import { CampaignCover } from "@/components/campaign/campaign-cover";
import { campaignTag, compactNumber, timeLeft, usdc } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";

// Cards use a stretched detail link; the Join link sits above it with z-10.

function StatusPill({ campaign }: { campaign: ApiCampaign }) {
  const left = timeLeft(campaign.endsAt);
  if (campaign.status === "ENDED" || !left) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-body-sm text-on-surface-variant">
        <Trophy size={15} className="text-tertiary" />
        Winners announced
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-body-sm text-on-surface-variant">
      <Hourglass size={15} className="text-secondary" />
      {left}
    </span>
  );
}

export function FeaturedCampaignCard({ campaign }: { campaign: ApiCampaign }) {
  const live = campaign.status === "ACTIVE";
  return (
    <article className="relative overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-4 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative h-56 w-full overflow-hidden rounded-[18px] bg-surface-container-high">
        <CampaignCover campaign={campaign} priority sizes="(max-width: 767px) 100vw, 720px" showTag={false} />
        <span className="absolute top-3 left-3 flex max-w-[60%] items-center gap-1 rounded-full bg-secondary-container px-3 py-1.5 text-label-md text-on-secondary shadow-md">
          <Tag size={16} className="shrink-0" />
          <span className="truncate">{campaignTag(campaign.title).slice(1)}</span>
        </span>
        {campaign.prizePool > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 text-label-sm shadow-md backdrop-blur-md">
            <Trophy size={15} className="text-secondary" />
            {usdc(campaign.prizePool)} USDC
          </span>
        )}
        {live && (
          <div className="absolute inset-x-0 bottom-0 flex h-16 items-end bg-gradient-to-t from-black/60 to-transparent p-3">
            <span className="flex items-center gap-2 text-label-sm text-white drop-shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary-fixed opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tertiary-fixed" />
              </span>
              LIVE NOW
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
            <Users size={15} />
            <strong className="text-on-surface">{compactNumber(campaign.stats.creators)}</strong> creators ·{" "}
            <Camera size={15} />
            <strong className="text-on-surface">{compactNumber(campaign.stats.snaps)}</strong>
          </span>
          <StatusPill campaign={campaign} />
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="min-w-0 flex-1 truncate text-body-sm text-on-surface-variant after:absolute after:inset-0"
          >
            {campaign.description || campaign.title}
          </Link>
          {live ? (
            <Link
              href={`/snap?campaign=${campaign.id}`}
              className="relative z-10 flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-secondary-container px-6 text-label-lg text-on-secondary shadow-sm transition-transform active:scale-95"
            >
              Join <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              href={`/campaigns/${campaign.id}/leaderboard`}
              className="relative z-10 flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary-container px-5 text-label-lg text-on-primary-container shadow-sm transition-transform active:scale-95"
            >
              Results <Trophy size={18} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function CampaignRowCard({ campaign }: { campaign: ApiCampaign }) {
  const live = campaign.status === "ACTIVE";
  return (
    <article className="relative rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-4 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-center gap-3.5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-surface-container-high">
          <CampaignCover campaign={campaign} sizes="96px" showTag={false} />
        </div>
        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center justify-between gap-1">
              <Link
                href={`/campaigns/${campaign.id}`}
                className="truncate rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary after:absolute after:inset-0"
              >
                {campaignTag(campaign.title)}
              </Link>
              {campaign.prizePool > 0 && (
                <span className="shrink-0 text-label-sm text-tertiary">{usdc(campaign.prizePool)} USDC</span>
              )}
            </div>
            <p className="mt-1 line-clamp-1 text-body-sm text-on-surface-variant">
              {campaign.description || campaign.title}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Users size={15} />
                {compactNumber(campaign.stats.creators)}
              </span>
              <span>•</span>
              <span className="truncate">{live ? (timeLeft(campaign.endsAt) ?? "Live") : "Ended"}</span>
            </div>
            <Link
              href={live ? `/snap?campaign=${campaign.id}` : `/campaigns/${campaign.id}/leaderboard`}
              className="relative z-10 flex h-8 shrink-0 items-center rounded-full bg-secondary-fixed px-4 text-label-sm text-on-secondary-fixed transition-transform active:scale-95"
            >
              {live ? "Join" : "Results"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
