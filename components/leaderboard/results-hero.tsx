"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BadgeCheck, PartyPopper, Sparkle, Trophy } from "lucide-react";
import { ConfettiLayer, prefersReducedMotion, useConfetti } from "@/components/confetti";
import { BackButton } from "@/components/layout/back-button";
import { CountUp, easeOut, LiveCountdown } from "@/components/ui/motion-kit";
import { campaignTag } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";
import { coin } from "@/lib/currency";

const SPARKLES = [
  { x: -54, y: -18, size: 14, delay: 0 },
  { x: 56, y: -30, size: 10, delay: 0.6 },
  { x: 48, y: 30, size: 12, delay: 1.2 },
  { x: -46, y: 34, size: 9, delay: 1.8 },
];

/** Trophy on a slowly turning sunburst, bobbing, with twinkling sparkles. */
function TrophyStage() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="relative mb-4 flex h-28 w-28 items-center justify-center">
      <div
        className="animate-spin-slow absolute -inset-10 rounded-full opacity-60"
        style={{
          background:
            "repeating-conic-gradient(from 0deg, color-mix(in srgb, var(--color-gold) 55%, transparent) 0deg 10deg, transparent 10deg 30deg)",
          maskImage: "radial-gradient(circle, black 35%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, black 35%, transparent 70%)",
        }}
      />
      <motion.div
        initial={reduce ? false : { scale: 0.3, rotate: -20, y: 20 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="relative"
      >
        <div className="animate-float flex h-20 w-20 items-center justify-center rounded-3xl bg-gold text-on-gold shadow-pop-yellow">
          <Trophy size={40} fill="currentColor" />
        </div>
      </motion.div>
      {!reduce &&
        SPARKLES.map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-gold drop-shadow-sm"
            style={{ x: s.x, y: s.y }}
            animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          >
            <Sparkle size={s.size} fill="currentColor" strokeWidth={0} />
          </motion.span>
        ))}
    </div>
  );
}

export function ResultsHero({ campaign, hasWinner }: { campaign: ApiCampaign; hasWinner: boolean }) {
  const ended = campaign.status === "ENDED";
  const reduce = useReducedMotion();
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
                <span className="shrink-0 text-body-sm text-on-surface-variant">• {coin(campaign.prizePool)}</span>
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

      <section className="relative flex w-full flex-col items-center overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-gradient-to-b from-gold/25 via-surface-container-lowest to-surface-container-lowest px-space-md pt-6 pb-space-md text-center shadow-soft">
        <TrophyStage />

        {ended ? (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-tertiary-container/40 px-3 py-1 text-label-sm text-on-tertiary-container">
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            Campaign ended
          </span>
        ) : (
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary-container px-3 py-1.5 text-label-sm text-on-secondary shadow-pop-blue">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Live
            {campaign.endsAt && <LiveCountdown endsAt={campaign.endsAt} />}
          </span>
        )}
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: easeOut }}
          className="text-headline-lg-mobile font-extrabold tracking-tight"
        >
          {ended ? (hasWinner ? "Champion crowned" : "No entries") : "Race for the crown"}
        </motion.h2>
        <p className="mt-1 max-w-xs text-body-sm text-on-surface-variant">
          <CountUp value={campaign.stats.votes} className="font-extrabold text-on-surface" />{" "}
          {campaign.stats.votes === 1 ? "vote" : "votes"}{" "}
          {ended
            ? hasWinner
              ? "from the community decided the top 3."
              : "— this campaign closed without any snaps."
            : "so far. Rankings update live until the campaign closes."}
        </p>

        <ConfettiLayer particles={particles} />
      </section>
    </>
  );
}
