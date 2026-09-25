import Link from "next/link";
import { Camera } from "lucide-react";
import { campaignTag, usdc } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";

export function JoinSnapBanner({ campaign }: { campaign: ApiCampaign }) {
  return (
    <aside className="flex w-full items-center justify-between gap-3 rounded-3xl border-2 border-on-surface/10 bg-gradient-to-r from-secondary via-secondary-container to-secondary p-4 text-on-secondary shadow-soft">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-secondary shadow-sm">
          <Camera size={22} />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-headline-sm leading-tight font-extrabold tracking-tight">
            {campaignTag(campaign.title)}
          </span>
          <span className="text-body-sm opacity-90">
            {campaign.prizePool > 0
              ? `Snap now & compete for ${usdc(campaign.prizePool)} USDC.`
              : "Snap now & climb the leaderboard."}
          </span>
        </div>
      </div>
      <Link
        href={`/snap?campaign=${campaign.id}`}
        className="shrink-0 rounded-full bg-surface-container-lowest px-4 py-2.5 text-label-sm font-bold text-secondary shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
      >
        Join
      </Link>
    </aside>
  );
}
