"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ConfettiLayer, prefersReducedMotion, useConfetti } from "@/components/confetti";
import { Icon } from "@/components/icon";
import { BackButton } from "@/components/layout/back-button";
import type { Campaign } from "@/lib/mock-data";

export function ResultsHero({ campaign }: { campaign: Campaign }) {
  const ended = !campaign.live;
  const { particles, burst } = useConfetti();

  useEffect(() => {
    if (!ended || prefersReducedMotion()) return;
    const t = setTimeout(burst, 400);
    return () => clearTimeout(t);
  }, [ended, burst]);

  return (
    <>
      <div className="flex items-center justify-between py-space-sm">
        <div className="flex min-w-0 items-center gap-space-xs">
          <BackButton fallbackHref={`/campaigns/${campaign.id}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="text-headline-sm">{ended ? "Winners & Results" : "Live Leaderboard"}</h1>
              {ended && <Icon name="verified" filled className="text-[18px] text-secondary" />}
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="rounded-full bg-secondary-fixed/50 px-2 py-0.5 text-label-sm text-secondary">
                {campaign.tag}
              </span>
              <span className="text-body-sm text-on-surface-variant">• ${campaign.poolUsdc} USDC Pool</span>
            </div>
          </div>
        </div>
        {ended && (
          <button
            aria-label="Celebrate"
            onClick={burst}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-sm transition-transform active:scale-90"
          >
            <Icon name="celebration" className="text-[22px]" />
          </button>
        )}
      </div>

      <section className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl bg-surface-container-lowest p-space-md text-center shadow-card">
        <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-primary-fixed/25 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-secondary-fixed/30 blur-2xl" />

        <div className="relative mb-2 h-36 w-36">
          <Image
            src="/mock/trophy-champion.jpg"
            alt=""
            fill
            sizes="144px"
            priority
            className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
          />
        </div>

        {ended ? (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-tertiary-container/40 px-3 py-1 text-label-sm text-on-tertiary-container">
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            Campaign Ended • {campaign.poolUsdc} USDC Distributed!
          </span>
        ) : (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/60 px-3 py-1 text-label-sm text-on-secondary-fixed-variant">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
            Live • {campaign.daysLeft} {campaign.daysLeft === 1 ? "day" : "days"} left
          </span>
        )}
        <h2 className="text-headline-lg-mobile">{ended ? "Grand Champion Crowned" : "Race for the Crown"}</h2>
        <p className="mt-1 max-w-xs text-body-sm text-on-surface-variant">
          {ended
            ? `Over ${campaign.votesCast.toLocaleString("en")} votes were cast by the community to decide the top creators.`
            : `${campaign.votesCast.toLocaleString("en")} votes cast so far. Rankings update live until the campaign closes.`}
        </p>

        <ConfettiLayer particles={particles} />
      </section>
    </>
  );
}
