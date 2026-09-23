import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { compactNumber } from "@/lib/format";
import type { Campaign } from "@/lib/mock-data";

const initials = [
  { label: "JD", className: "bg-secondary-fixed text-on-secondary-fixed" },
  { label: "MK", className: "bg-tertiary-container text-on-tertiary-container" },
  { label: "SL", className: "bg-primary-container text-on-surface" },
];

// Cards use a stretched detail link; the Join link sits above it with z-10.

export function FeaturedCampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-4 shadow-card transition-shadow hover:shadow-[0_8px_26px_rgba(17,17,17,0.09)]">
      <div className="relative h-56 w-full overflow-hidden rounded-[18px] bg-surface-container-high">
        <Image src={campaign.cover} alt="" fill priority sizes="(max-width: 767px) 100vw, 720px" className="object-cover" />
        <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary-container px-3 py-1.5 text-label-md shadow-md">
          <Icon name="tag" className="text-[16px]" />
          {campaign.tag.slice(1)}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 text-label-sm shadow-md backdrop-blur-md">
          <Icon name="emoji_events" className="text-[15px] text-primary" />
          {campaign.poolUsdc} USDC <span className="font-medium text-on-surface-variant">Pool</span>
        </span>
        <div className="absolute inset-x-0 bottom-0 flex h-16 items-end bg-gradient-to-t from-black/60 to-transparent p-3">
          <span className="flex items-center gap-2 text-label-sm text-white drop-shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary-fixed opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tertiary-fixed" />
            </span>
            {campaign.trending ? "HOT CHALLENGE" : "LIVE NOW"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div aria-hidden className="flex -space-x-2">
              {initials.map((i) => (
                <span
                  key={i.label}
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-surface-container-lowest ${i.className}`}
                >
                  {i.label}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
              <Icon name="group" className="text-[15px]" />
              <strong className="text-on-surface">{compactNumber(campaign.creators)}</strong> creators
            </span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-body-sm text-on-surface-variant">
            <Icon name="hourglass_top" className="text-[15px] text-secondary" />
            Ends in <strong>{campaign.daysLeft}d</strong>
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href={`/campaigns/${campaign.id}`}
            className="min-w-0 flex-1 truncate text-body-sm text-on-surface-variant after:absolute after:inset-0"
          >
            {campaign.tagline}
          </Link>
          <Link
            href={`/snap?campaign=${campaign.id}`}
            className="relative z-10 flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary-container px-6 text-label-lg shadow-sm transition-transform active:translate-y-0.5 active:scale-95"
          >
            Join <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CampaignRowCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="relative rounded-3xl bg-surface-container-lowest p-4 shadow-card transition-shadow hover:shadow-[0_6px_22px_rgba(17,17,17,0.08)]">
      <div className="flex items-center gap-3.5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-surface-container-high">
          <Image src={campaign.cover} alt="" fill sizes="96px" className="object-cover" />
          {campaign.badge && (
            <span
              className={`absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                campaign.badge === "New" ? "bg-on-surface/75 text-white backdrop-blur-sm" : "bg-primary-container"
              }`}
            >
              {campaign.badge}
            </span>
          )}
        </div>
        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center justify-between gap-1">
              <Link
                href={`/campaigns/${campaign.id}`}
                className="truncate rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-secondary after:absolute after:inset-0"
              >
                {campaign.tag}
              </Link>
              <span className="shrink-0 text-label-sm text-tertiary">{campaign.poolUsdc} USDC</span>
            </div>
            <p className="mt-1 line-clamp-1 text-body-sm text-on-surface-variant">{campaign.tagline}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Icon name="group" className="text-[15px]" />
                {compactNumber(campaign.creators)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Icon name="hourglass_top" className="text-[15px]" />
                {campaign.daysLeft}d left
              </span>
            </div>
            <Link
              href={`/snap?campaign=${campaign.id}`}
              className="relative z-10 flex h-8 shrink-0 items-center rounded-full bg-secondary-fixed px-4 text-label-sm text-on-secondary-fixed transition-transform active:scale-95"
            >
              Join
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
