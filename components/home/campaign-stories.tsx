import Link from "next/link";
import { CircleCheck, ImagePlus } from "lucide-react";
import { campaignTag, endsWithinHours, timeLeft, usdc } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";

export function CampaignStories({ campaigns }: { campaigns: ApiCampaign[] }) {
  return (
    <section className="no-scrollbar flex items-center gap-space-sm overflow-x-auto scroll-smooth px-4 pt-3 pb-1">
      <Link
        href="/snap"
        className="flex shrink-0 items-center gap-space-xs rounded-full border-2 border-on-surface/10 bg-secondary-container py-1.5 pr-space-md pl-space-xs text-on-secondary shadow-soft transition-all hover:opacity-95 active:scale-95"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-secondary shadow-xs">
          <ImagePlus size={18} />
        </span>
        <span className="flex flex-col text-left">
          <span className="text-label-sm leading-tight">Post Snap</span>
          <span className="text-[10px] leading-none opacity-75">Instant cam</span>
        </span>
      </Link>

      {campaigns.map((c) => {
        const urgent = endsWithinHours(c.endsAt, 24);
        return (
          <Link
            key={c.id}
            href={`/campaigns/${c.id}`}
            className="flex shrink-0 items-center gap-2 rounded-full bg-surface-container-lowest py-2 pr-3.5 pl-3 shadow-sm transition-colors hover:bg-surface-container"
          >
            <span className="relative flex h-2.5 w-2.5">
              {urgent && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-60" />
              )}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${urgent ? "bg-error" : "bg-tertiary"}`} />
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-1 text-label-md">
                {campaignTag(c.title)}
                {c.joined && <CircleCheck size={13} className="text-tertiary" aria-label="Joined" />}
              </span>
              <span className={`text-[10px] font-bold ${urgent ? "text-error" : "text-on-surface-variant"}`}>
                {c.prizePool > 0 ? `${usdc(c.prizePool)} USDC • ` : ""}
                {timeLeft(c.endsAt) ?? "Live"}
              </span>
            </span>
          </Link>
        );
      })}
    </section>
  );
}
