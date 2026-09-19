"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import type { Snap } from "@/lib/mock-data";

const boostOptions = [5, 10];

export function SnapCard({ snap, priority }: { snap: Snap; priority?: boolean }) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(snap.votes);
  const [boost, setBoost] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const amount = boost ?? 1;
  const isTop = snap.rank === 1;

  function vote() {
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + amount);
    navigator.vibrate?.([25, 50, 25]);
  }

  const voteButton = (
    <button
      onClick={vote}
      disabled={voted}
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
      <Icon name={voted ? "check_circle" : "bolt"} filled={voted} className="text-[18px]" />
      <span className="text-label-lg whitespace-nowrap">{voted ? "Voted!" : `Vote ${amount} USDC`}</span>
    </button>
  );

  const actions = (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1 p-1 text-on-surface-variant hover:text-on-surface">
        <Icon name="mode_comment" className="text-[22px]" />
        <span className="text-label-sm tabular-nums">{snap.comments}</span>
      </button>
      <button
        aria-label={saved ? "Unsave" : "Save"}
        aria-pressed={saved}
        onClick={() => setSaved((s) => !s)}
        className="p-1 text-on-surface-variant hover:text-on-surface"
      >
        <Icon name={saved ? "bookmark" : "bookmark_border"} filled={saved} className="text-[22px]" />
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
          sizes="(max-width: 430px) 100vw, 406px"
          className="object-cover select-none"
        />
        <Link
          href={`/snaps/${snap.id}`}
          aria-label={`Open snap by @${snap.creator.handle}`}
          className="absolute inset-0"
        />

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-inverse-surface/75 px-3 py-1.5 text-inverse-on-surface shadow-xs backdrop-blur-md">
            <Icon
              name={snap.campaign.icon}
              filled={isTop}
              className={`text-[15px] ${isTop ? "text-primary-container" : "text-secondary-fixed"}`}
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
                  <Icon name="verified" filled className="text-[14px] text-secondary-container" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-inverse-on-surface/80">
                <Icon name={snap.liveShutter ? "shutter_speed" : "schedule"} className="text-[11px]" />
                <span>{snap.liveShutter ? `Live Shutter • ${snap.postedAgo}` : snap.postedAgo}</span>
              </div>
            </div>
          </div>
          <button
            aria-label="Share"
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-inverse-surface/80 text-inverse-on-surface shadow-sm backdrop-blur-md transition-all hover:bg-inverse-surface active:scale-95"
          >
            <Icon name="share" className="text-[20px]" />
          </button>
        </div>
      </div>

      {snap.featured ? (
        <div className="flex flex-col gap-2.5 px-1 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {voteButton}
              {!voted &&
                boostOptions.map((b) => (
                  <button
                    key={b}
                    aria-pressed={boost === b}
                    onClick={() => setBoost((cur) => (cur === b ? null : b))}
                    className={`h-9 rounded-full px-2.5 text-label-sm transition-transform active:scale-95 ${
                      boost === b
                        ? "bg-secondary text-on-secondary"
                        : "bg-secondary-fixed text-on-secondary-fixed hover:opacity-90"
                    }`}
                  >
                    +{b}
                  </button>
                ))}
            </div>
            {actions}
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2 text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <Icon name="savings" className="text-[16px] text-tertiary" />
              <span>Top voters split 30% pool (~${snap.voterPoolUsdc} USDC)</span>
            </div>
            <span className="text-[12px] font-bold text-secondary tabular-nums">{votes} Votes</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1 pt-1 pb-2">
          {voteButton}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
              <Icon name={voted ? "favorite" : "favorite_border"} filled={voted} className="text-[20px]" />
              <span className="tabular-nums">{votes}</span>
            </div>
            {actions}
          </div>
        </div>
      )}
    </article>
  );
}
