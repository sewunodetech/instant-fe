"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icon";
import type { Snap } from "@/lib/mock-data";

type Props = {
  snap: Snap;
  votes: number;
  timeLeft: string;
};

export function SnapHero({ snap, votes, timeLeft }: Props) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="snap-hero-frame bg-surface-container">
      <Image
        src={snap.image}
        alt={snap.imageAlt}
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 520px"
        className="object-cover"
      />

      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <Icon name="local_fire_department" filled className="text-[18px] text-amber-500" />
          <span className="text-label-md font-extrabold tracking-tight tabular-nums">
            {votes.toLocaleString("en")} votes
          </span>
          <span className="h-1 w-1 rounded-full bg-outline-variant" />
          <span className="rounded-full bg-tertiary-container/30 px-1.5 py-0.5 text-label-sm text-tertiary">
            Rank #{snap.rank}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-inverse-surface/75 px-2.5 py-1 text-inverse-on-surface backdrop-blur-md">
          <Icon name="schedule" className="text-[14px]" />
          <span className="text-label-sm">{timeLeft}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {snap.creator.avatar ? (
            <Image
              src={snap.creator.avatar}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-fixed text-sm font-bold text-on-secondary-fixed">
              {snap.creator.initial}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-label-lg text-white drop-shadow-sm">@{snap.creator.handle}</span>
              {snap.creator.verified && (
                <Icon name="verified" filled className="text-[16px] text-secondary-container" />
              )}
            </div>
            <span className="text-label-sm text-white/80">
              {snap.postedAgo}
              {snap.location && ` • ${snap.location}`}
            </span>
          </div>
        </div>
        <button
          aria-label={liked ? "Unlike" : "Like"}
          aria-pressed={liked}
          onClick={() => setLiked((l) => !l)}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white backdrop-blur-md transition-transform hover:bg-white/30 active:scale-90 ${
            liked ? "bg-white/40" : "bg-white/20"
          }`}
        >
          <Icon name="favorite" filled={liked} className={`text-[20px] ${liked ? "text-rose-500" : ""}`} />
        </button>
      </div>
    </div>
  );
}
