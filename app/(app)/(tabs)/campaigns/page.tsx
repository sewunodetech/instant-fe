import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Plus, ShieldCheck } from "lucide-react";
import { CampaignExplorer } from "@/components/discovery/campaign-explorer";

export const metadata: Metadata = { title: "Explore · instant.fun" };

export default function CampaignsPage() {
  return (
    <div className="flex flex-col gap-4 px-space-md pb-4 sm:px-0">
      <div className="pt-3">
        <div className="flex items-center justify-between">
          <h1 className="text-headline-lg-mobile">Explore</h1>
          <span className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 shadow-sm">
            <BadgeCheck size={18} className="text-secondary" />
            <span className="text-label-sm text-on-surface-variant">Live Challenges</span>
          </span>
        </div>
        <p className="mt-1 text-on-surface-variant">Pick a challenge, post a snap, earn support!</p>
        <Link
          href="/create"
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-label-md text-on-secondary shadow-sm transition-transform active:scale-95"
        >
          <Plus size={18} />
          Create campaign
        </Link>
      </div>

      <CampaignExplorer />

      <aside className="relative mt-1 overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-gradient-to-r from-surface-container to-surface-container-low p-5 shadow-soft">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary shadow-sm">
            <ShieldCheck size={28} />
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
