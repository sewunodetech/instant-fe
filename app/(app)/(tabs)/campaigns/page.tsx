import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { CampaignExplorer } from "@/components/discovery/campaign-explorer";

export const metadata: Metadata = { title: "Explore · instant.fun" };

function CrownDoodle() {
  return (
    <svg aria-hidden className="h-7 w-7" fill="none" viewBox="0 0 36 36">
      <path d="M5 26.5C8 28.5 28 28.5 31 26.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
      <path
        d="M6 25L4.5 12.5C4.3 11 6 10.2 7.2 11.2L12 15.5L17 7.5C17.6 6.5 19 6.5 19.6 7.5L24.5 15.5L29 11.2C30.2 10.2 31.8 11 31.6 12.5L30 25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <circle cx="7" cy="9" fill="currentColor" r="1.5" />
      <circle cx="18.3" cy="5.5" fill="currentColor" r="1.5" />
      <circle cx="29.5" cy="9" fill="currentColor" r="1.5" />
      <path d="M33 4L34.5 6L33 8L31.5 6Z" fill="currentColor" />
    </svg>
  );
}

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-4 px-space-md pb-4 sm:px-0">
      <div className="pt-3">
        <div className="flex items-center justify-between">
          <h1 className="text-headline-lg-mobile">Explore</h1>
          <span className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 shadow-sm">
            <Icon name="verified" className="text-[18px] text-secondary" />
            <span className="text-label-sm text-on-surface-variant">Live Challenges</span>
          </span>
        </div>
        <p className="mt-1 text-on-surface-variant">Pick a challenge, post a snap, earn support!</p>
        <Link
          href="/create"
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-md text-on-primary-fixed shadow-sm transition-transform active:scale-95"
        >
          <Icon name="add" className="text-[18px]" />
          Create campaign
        </Link>
      </div>

      <CampaignExplorer />

      <aside className="relative mt-1 overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container to-surface-container-low p-5 shadow-[0_2px_12px_rgba(17,17,17,0.04)]">
        <div className="pointer-events-none absolute -top-3 -right-3 h-20 w-20 rounded-full bg-primary-container/20 blur-xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary-container shadow-sm">
            <CrownDoodle />
          </div>
          <div className="min-w-0 flex-1">
            <span className="mb-0.5 block text-[10px] font-bold tracking-wider text-secondary uppercase">Community Creed</span>
            <h2 className="text-[15px] leading-tight font-bold">Real People. Real Moments. Real Rewards.</h2>
            <p className="mt-1 text-body-sm leading-snug text-on-surface-variant">
              Every photo submission gets voted by real users. Zero fake clout.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
