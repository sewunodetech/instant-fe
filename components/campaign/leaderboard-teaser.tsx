import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronRight } from "lucide-react";
import type { Campaign } from "@/lib/mock-data";

export function LeaderboardTeaser({ campaign }: { campaign: Campaign }) {
  const { leader } = campaign;

  return (
    <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="mb-space-sm flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <h3 className="text-headline-sm">Live Leaderboard</h3>
          {campaign.live && <span className="h-2 w-2 rounded-full bg-tertiary" />}
        </div>
        <Link
          href={`/campaigns/${campaign.id}/leaderboard`}
          className="flex items-center text-label-md text-secondary hover:underline"
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary-fixed/20 via-surface-container-low to-surface-container-low p-space-sm">
        <div className="flex min-w-0 items-center gap-space-sm">
          <div className="relative shrink-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-surface-dim">
              <Image src={leader.snapImage} alt="" fill sizes="48px" className="object-cover" />
            </div>
            <div className="absolute -top-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-label-sm text-on-primary-fixed shadow-sm">
              #1
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[14px] font-bold">@{leader.handle}</span>
              {leader.verified && <BadgeCheck size={14} fill="currentColor" className="text-secondary" />}
            </div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="tabular-nums">{leader.votes} votes</span>
              <span>•</span>
              <span className="text-label-sm text-tertiary">Est. +{leader.estUsdc} USDC</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center -space-x-2 pl-2" aria-label={`Top voters and ${campaign.otherVoters} others`}>
          {campaign.topVoterAvatars.map((src) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full bg-surface-container-highest object-cover ring-2 ring-surface-container-low"
            />
          ))}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-fixed text-[10px] font-bold text-on-secondary-fixed ring-2 ring-surface-container-low">
            +{campaign.otherVoters}
          </div>
        </div>
      </div>
    </section>
  );
}
