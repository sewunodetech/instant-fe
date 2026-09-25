import Link from "next/link";
import { ImagePlus } from "lucide-react";
import type { Campaign } from "@/lib/mock-data";

const dotColor: Record<Campaign["dot"], string> = {
  live: "bg-primary-container",
  blue: "bg-secondary-container",
  green: "bg-tertiary",
  muted: "bg-outline-variant",
};

export function CampaignStories({ campaigns }: { campaigns: Campaign[] }) {
  return (
    <section className="no-scrollbar flex items-center gap-space-sm overflow-x-auto scroll-smooth px-margin pt-space-md pb-space-sm sm:px-0">
      <Link
        href="/snap"
        className="flex shrink-0 items-center gap-space-xs rounded-full border-2 border-on-surface/10 bg-primary-container py-1.5 pr-space-md pl-space-xs text-on-primary-fixed shadow-soft transition-all hover:opacity-95 active:scale-95"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-primary shadow-xs">
          <ImagePlus size={18} />
        </span>
        <span className="flex flex-col text-left">
          <span className="text-label-sm leading-tight">Post Snap</span>
          <span className="text-[10px] leading-none opacity-75">Instant cam</span>
        </span>
      </Link>

      {campaigns.map((c) => (
        <Link
          key={c.id}
          href={`/campaigns/${c.id}`}
          className="flex shrink-0 items-center gap-2 rounded-full bg-surface-container-lowest py-2 pr-3.5 pl-3 shadow-sm transition-colors hover:bg-surface-container"
        >
          {c.dot === "live" ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-container" />
            </span>
          ) : (
            <span className={`h-2 w-2 rounded-full ${dotColor[c.dot]}`} />
          )}
          <span className="flex flex-col">
            <span className="text-label-md">{c.tag}</span>
            <span
              className={`text-[10px] font-bold ${c.dot === "live" ? "text-primary" : "text-on-surface-variant"}`}
            >
              {c.poolUsdc} USDC • {c.daysLeft}d
            </span>
          </span>
        </Link>
      ))}
    </section>
  );
}
