"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Share2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { SuccessBurst } from "@/components/ui/success-burst";
import { campaignTag, handleOf } from "@/lib/format";
import type { ApiCampaign } from "@/lib/types";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * "Your snap is live" moment: the photo drops in as a polaroid, confetti
 * pops, then the copy and actions rise in one after another.
 */
export function PostedCelebration({
  postId,
  campaign,
  photoUrl,
  caption,
}: {
  postId: string;
  campaign: ApiCampaign;
  photoUrl: string;
  caption: string;
}) {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const tag = campaignTag(campaign.title);

  useEffect(() => {
    navigator.vibrate?.([30, 60, 30, 60, 60]);
  }, []);

  async function share() {
    const url = new URL(`/snaps/${postId}`, window.location.origin).toString();
    const title = `Vote for my snap in ${tag} on instant.fun`;
    if (navigator.share) await navigator.share({ title, url }).catch(() => {});
    else await navigator.clipboard?.writeText(url).catch(() => {});
  }

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease },
  });

  return (
    <div className="relative flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center overflow-hidden px-6 pt-8 pb-6 text-center">
      {/* Soft spotlight behind the polaroid */}
      <div aria-hidden className="absolute top-[18%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-secondary-container/20 blur-3xl" />

      <div className="relative">
        <SuccessBurst className="top-1/2" />
        <motion.figure
          initial={reduce ? false : { y: -120, rotate: -18, scale: 0.7, opacity: 0 }}
          animate={{ y: 0, rotate: -4, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="relative z-10 w-60 rounded-[1.25rem] bg-white p-3 pb-4 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.35)]"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container">
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob of the photo just posted */}
            <img src={photoUrl} alt="Your snap" className="h-full w-full object-cover" />
            {/* Instant-film "developing" flash */}
            {!reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-white"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
              />
            )}
          </div>
          <figcaption className="mt-2.5 truncate text-left text-label-md text-on-surface">
            {caption || `@${handleOf(user)} · ${tag}`}
          </figcaption>

          <motion.span
            initial={reduce ? false : { scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.55 }}
            className="absolute -top-3 -right-3 flex h-11 w-11 items-center justify-center rounded-full bg-tertiary text-white shadow-lg ring-4 ring-surface"
          >
            <Check size={24} strokeWidth={3} />
          </motion.span>
        </motion.figure>
      </div>

      <motion.h1 {...rise(0.6)} className="mt-8 text-[1.75rem] leading-tight font-extrabold tracking-[-0.02em]">
        Your snap is live!
      </motion.h1>
      <motion.p {...rise(0.7)} className="mt-2 max-w-xs text-body-md text-on-surface-variant">
        It&apos;s in <span className="font-bold text-secondary">{tag}</span>. Share it — the top 3 by votes win.
      </motion.p>

      <motion.div {...rise(0.82)} className="mt-7 flex w-full flex-col gap-2.5">
        <button
          type="button"
          onClick={share}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-label-lg font-bold text-on-secondary shadow-pop-blue transition-transform active:scale-[0.98]"
        >
          <Share2 size={20} />
          Share &amp; get votes
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={`/snaps/${postId}`}
            className="flex h-12 items-center justify-center rounded-full bg-surface-container text-label-md transition-transform active:scale-95"
          >
            View snap
          </Link>
          <Link
            href={`/campaigns/${campaign.id}`}
            className="flex h-12 items-center justify-center gap-1 rounded-full bg-surface-container text-label-md transition-transform active:scale-95"
          >
            Campaign <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
