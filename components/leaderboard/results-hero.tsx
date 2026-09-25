"use client";

import { useEffect } from "react";
import { BadgeCheck, PartyPopper, Trophy } from "lucide-react";
import { ConfettiLayer, prefersReducedMotion, useConfetti } from "@/components/confetti";
import { BackButton } from "@/components/layout/back-button";
import { campaignTag, compactNumber, timeLeft, usdc } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";

export function ResultsHero({ campaign, hasWinner }: { campaign: ApiCampaign; hasWinner: boolean }) {
  const ended = campaign.status === "ENDED";
  const { particles, burst } = useConfetti();

  useEffect(() => {
    if (ended && hasWinner && !prefersReducedMotion()) burst();
  }, [ended, hasWinner, burst]);

  return (
    <>
      <div className="flex items-center justify-between py-space-sm">
        <div className="flex min-w-0 items-center gap-space-xs">
          <BackButton fallbackHref={`/campaigns/${campaign.id}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="text-headline-sm font-extrabold tracking-tight">
                {ended ? "Winners & Results" : "Live Leaderboard"}
              </h1>
              {ended && <BadgeCheck size={18} fill="currentColor" className="text-secondary" />}
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1">
              <span className="truncate rounded-full bg-secondary-fixed/50 px-2 py-0.5 text-label-sm text-secondary">
                {campaignTag(campaign.title)}
              </span>
              {campaign.prizePool > 0 && (
                <span className="shrink-0 text-body-sm text-on-surface-variant">• {usdc(campaign.prizePool)} USDC</span>
              )}
            </div>
          </div>
        </div>
        {ended && hasWinner && (
          <button
            aria-label="Celebrate"
            onClick={burst}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary shadow-sm transition-transform active:scale-90"
          >
            <PartyPopper size={22} />
          </button>
        )}
      </div>

      <section className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md text-center shadow-soft">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-container text-on-primary-container shadow-pop-yellow">
          <Trophy size={40} fill="currentColor" />
        </div>
        {ended ? (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-tertiary-container/40 px-3 py-1 text-label-sm text-on-tertiary-container">
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            Campaign ended
          </span>
        ) : (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/60 px-3 py-1 text-label-sm text-on-secondary-fixed-variant">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
            Live • {timeLeft(campaign.endsAt) ?? "closing"}
          </span>
        )}
        <h2 className="text-headline-lg-mobile font-extrabold tracking-tight">
          {ended ? (hasWinner ? "Champion crowned" : "No entries") : "Race for the crown"}
        </h2>
        <p className="mt-1 max-w-xs text-body-sm text-on-surface-variant">
          {ended
            ? hasWinner
              ? `${compactNumber(campaign.stats.votes)} votes from the community decided the top 3.`
              : "This campaign closed without any snaps."
            : `${compactNumber(campaign.stats.votes)} votes so far. Rankings update live until the campaign closes.`}
        </p>

        <ConfettiLayer particles={particles} />
      </section>
    </>
  );
}
