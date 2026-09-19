import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import type { Creator, Leaderboard } from "@/lib/mock-data";

type Props = {
  champion: Creator;
  dividend: Leaderboard["voterDividend"];
  ended: boolean;
};

export function ChampionCard({ champion, dividend, ended }: Props) {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
      <div className="mb-space-sm flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-label-sm text-on-primary-container">
          <Icon name="workspace_premium" filled className="text-[16px]" />
          {ended ? "#1 Champion" : "#1 Leading"}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm tabular-nums">
          <Icon name="favorite" filled className="text-[15px] text-error" />
          {champion.votes.toLocaleString("en")} votes
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container">
          <Image src={champion.snapImage} alt={`Winning snap by @${champion.handle}`} fill sizes="96px" className="object-cover" />
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 via-transparent to-transparent pb-1.5">
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              View Snap
            </span>
          </div>
        </div>

        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2">
              {champion.avatar && (
                <Image src={champion.avatar} alt="" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
              )}
              <span className="truncate text-label-lg">@{champion.handle}</span>
            </div>
            {champion.tagline && (
              <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">&ldquo;{champion.tagline}&rdquo;</p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between pt-2">
            <div>
              <span className="block text-label-sm text-on-surface-variant">
                {ended ? "Creator Payout" : "Est. Creator Payout"}
              </span>
              <span className="text-headline-sm font-extrabold tabular-nums">
                +{champion.payoutUsdc.toFixed(2)} USDC
              </span>
            </div>
            <Icon name="military_tech" filled className="text-[28px] text-primary" />
          </div>
        </div>
      </div>

      <Link
        href="/rewards"
        className="mt-3 flex items-center justify-between rounded-2xl bg-surface-container-low p-2.5 transition-colors hover:bg-surface-container"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-fixed text-secondary">
            <Icon name="redeem" className="text-[16px]" />
          </div>
          <div>
            <span className="block text-label-sm leading-tight">
              {ended ? "Voter Dividend Unlocked" : "Voter Dividend Pool"}
            </span>
            <span className="text-body-sm leading-tight text-on-surface-variant">
              {ended
                ? `${dividend.count} Top Voters won +${dividend.eachUsdc} USDC each!`
                : `Top ${dividend.count} voters on track for +${dividend.eachUsdc} USDC each`}
            </span>
          </div>
        </div>
        <Icon name="chevron_right" className="text-[18px] text-secondary" />
      </Link>
    </section>
  );
}
