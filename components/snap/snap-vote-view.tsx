"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { SnapHero } from "@/components/snap/snap-hero";
import { VotePanel } from "@/components/snap/vote-panel";
import { currentUser, voteTiers, type Campaign, type Snap } from "@/lib/mock-data";

function Caption({ text, campaignTag }: { text: string; campaignTag: string }) {
  return (
    <p className="text-body-md">
      {text.split(/(#\w+)/).map((part, i) =>
        part.startsWith("#") ? (
          <span key={i} className={part === campaignTag ? "font-bold text-secondary" : "text-on-surface-variant"}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export function SnapVoteView({ snap, campaign }: { snap: Snap; campaign: Campaign }) {
  const [votes, setVotes] = useState(snap.votes);
  const [balance, setBalance] = useState(currentUser.usdcBalance);

  return (
    <>
      <div className="w-full overflow-hidden rounded-3xl bg-surface-container-lowest shadow-card">
        <SnapHero snap={snap} votes={votes} timeLeft={`${campaign.daysLeft}d left`} />
        <div className="p-space-md">
          <Caption text={snap.caption} campaignTag={campaign.tag} />
        </div>
      </div>

      <VotePanel
        creatorName={snap.creator.name}
        poolUsdc={campaign.poolUsdc}
        tiers={voteTiers}
        balance={balance}
        onVoted={(usdc, v) => {
          setVotes((n) => n + v);
          setBalance((b) => b - usdc);
        }}
      />

      <div className="flex items-center gap-2">
        <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-4 py-3 shadow-sm transition-all hover:bg-surface-container active:scale-95">
          <Icon name="mode_comment" className="text-[20px] text-on-surface-variant" />
          <span className="text-label-md">{snap.comments} Comments</span>
        </button>
        <Link
          href={`/campaigns/${campaign.id}/leaderboard`}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-4 py-3 text-secondary shadow-sm transition-all hover:bg-surface-container active:scale-95"
        >
          <Icon name="leaderboard" className="text-[20px]" />
          <span className="text-label-md">Leaderboard</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-3 text-on-surface-variant">
        <Icon name="verified_user" className="shrink-0 text-[20px] text-secondary" />
        <p className="text-body-sm leading-snug">
          Voting protects against bots with on-chain verification. Gas fees are covered by instant.fun.
        </p>
      </div>
    </>
  );
}
