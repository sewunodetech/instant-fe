"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Aperture,
  Bookmark,
  CircleCheck,
  Clock,
  HandHeart,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Vote,
  BadgeCheck,
} from "lucide-react";
import { LucideIcon } from "@/components/lucide-icon";
import type { Snap } from "@/lib/mock-data";

const supportOptions = [1, 5, 10];

export function SnapCard({
  snap,
  priority,
  onVote,
  onSupport,
  busy,
}: {
  snap: Snap;
  priority?: boolean;
  onVote?: () => Promise<void>;
  onSupport?: (amount: number) => Promise<void>;
  busy?: boolean;
}) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(snap.votes);
  const [support, setSupport] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const isTop = snap.rank === 1;

  async function vote() {
    if (voted || pending) return;
    setPending(true);
    try {
      if (onVote) await onVote();
      setVoted(true);
      setVotes((v) => (onVote ? v : v + 1));
      navigator.vibrate?.([25, 50, 25]);
    } catch {
      // keep unvoted on failure
    } finally {
      setPending(false);
    }
  }

  async function sendSupport() {
    if (supported || !support || pending) return;
    setPending(true);
    try {
      if (onSupport) await onSupport(support);
      else setVotes((v) => v + 1);
      setSupported(true);
      setVoted(true);
      navigator.vibrate?.([25, 50, 25]);
    } catch {
      // keep unsupported on failure
    } finally {
      setPending(false);
    }
  }

  const voteButton = (
    <button
      onClick={vote}
      disabled={voted || pending || busy}
      className={`flex h-11 items-center gap-1.5 rounded-full transition-transform active:scale-95 ${
        snap.featured ? "px-4" : "px-5"
      } ${
        voted
          ? "bg-tertiary-container text-on-tertiary-container"
          : snap.featured
            ? "bg-secondary-container text-on-secondary shadow-md hover:opacity-90"
            : "bg-secondary-fixed text-on-secondary-fixed-variant shadow-sm hover:bg-secondary-fixed-dim"
      }`}
    >
      {voted ? <CircleCheck size={18} fill="currentColor" /> : <Vote size={18} />}
      <span className="text-label-lg whitespace-nowrap">
        {pending && !supported ? "..." : voted ? "Voted!" : "Vote"}
      </span>
    </button>
  );

  const supportRow = (
    <div className="flex items-center gap-1.5">
      {!supported &&
        supportOptions.map((b) => (
          <button
            key={b}
            aria-pressed={support === b}
            aria-label={`Support ${b} USDC`}
            onClick={() => setSupport((cur) => (cur === b ? null : b))}
            className={`h-9 rounded-full px-2.5 text-label-sm transition-transform active:scale-95 ${
              support === b
                ? "bg-primary-container text-on-primary-fixed shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            +{b}
          </button>
        ))}
      <button
        onClick={sendSupport}
        disabled={!support || supported || pending}
        className={`flex h-9 items-center gap-1 rounded-full px-3 text-label-sm transition-transform active:scale-95 disabled:opacity-50 ${
          supported
            ? "bg-tertiary-container text-on-tertiary-container"
            : "bg-primary-container text-on-primary-fixed shadow-sm"
        }`}
      >
        {supported ? <Heart size={16} fill="currentColor" /> : <HandHeart size={16} />}
        {supported ? `Sent ${support}` : support ? `Send ${support}` : "Support"}
      </button>
    </div>
  );

  const actions = (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1 p-1 text-on-surface-variant hover:text-on-surface">
        <MessageCircle size={22} />
        <span className="text-label-sm tabular-nums">{snap.comments}</span>
      </button>
      <button
        aria-label={saved ? "Unsave" : "Save"}
        aria-pressed={saved}
        onClick={() => setSaved((s) => !s)}
        className="p-1 text-on-surface-variant hover:text-on-surface"
      >
        <Bookmark size={22} fill={saved ? "currentColor" : "none"} />
      </button>
    </div>
  );

  return (
    <article className="flex flex-col gap-3 rounded-3xl bg-surface-container-lowest p-3 shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-container">
        <Image
          src={snap.image}
          alt={snap.imageAlt}
          fill
          priority={priority}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover select-none"
        />
        <Link
          href={`/snaps/${snap.id}`}
          aria-label={`Open snap by @${snap.creator.handle}`}
          className="absolute inset-0"
        />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-inverse-surface/75 px-3 py-1.5 text-inverse-on-surface shadow-xs backdrop-blur-md">
            <LucideIcon
              name={snap.campaign.icon}
              size={15}
              filled={isTop}
              className={isTop ? "text-primary-container" : "text-secondary-fixed"}
            />
            <span className="text-label-sm whitespace-nowrap">{snap.campaign.tag}</span>
            <span className="text-xs text-white/40">•</span>
            <span className={`text-label-sm whitespace-nowrap ${isTop ? "text-primary-container" : "text-secondary-fixed"}`}>
              {snap.campaign.poolUsdc} USDC{isTop && " Pool"}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm shadow-sm ${
              isTop ? "bg-primary-container text-on-primary-fixed" : "bg-surface-container-high text-on-surface"
            }`}
          >
            <Trophy size={13} />
            <span>#{snap.rank}</span>
            <span className="text-[10px] tabular-nums opacity-75">{votes} votes</span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between">
          <div className="flex items-center gap-2 rounded-full bg-inverse-surface/80 p-1.5 pr-3 text-inverse-on-surface shadow-sm backdrop-blur-md">
            <div className="relative">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  snap.featured ? "bg-surface-container-high text-on-surface" : "bg-secondary-fixed text-on-secondary-fixed"
                }`}
              >
                {snap.creator.initial}
              </div>
              {snap.creator.online && (
                <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full bg-tertiary-container ring-2 ring-inverse-surface" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-label-md leading-tight">@{snap.creator.handle}</span>
                {snap.creator.verified && (
                  <BadgeCheck size={14} fill="currentColor" className="text-secondary-container" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-inverse-on-surface/80">
                {snap.liveShutter ? <Aperture size={11} /> : <Clock size={11} />}
                <span>{snap.liveShutter ? `Live Shutter • ${snap.postedAgo}` : snap.postedAgo}</span>
              </div>
            </div>
          </div>
          <button
            aria-label="Share"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-inverse-surface/80 text-inverse-on-surface shadow-sm backdrop-blur-md transition-all hover:bg-inverse-surface active:scale-95"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-1 pt-1 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {voteButton}
            {supportRow}
          </div>
          {actions}
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2 text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <HandHeart size={16} className="text-primary" />
            <span>Free vote · Support goes 100% to @{snap.creator.handle}</span>
          </div>
          <span className="text-[12px] font-bold text-secondary tabular-nums">{votes} Votes</span>
        </div>
      </div>
    </article>
  );
}
