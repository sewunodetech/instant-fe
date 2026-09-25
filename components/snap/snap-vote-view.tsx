"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Trophy } from "lucide-react";
import { SnapHero } from "@/components/snap/snap-hero";
import { SupportPanel } from "@/components/snap/support-panel";
import { currentUser, type Campaign, type Snap } from "@/lib/mock-data";

export function SnapVoteView({ snap, campaign }: { snap: Snap; campaign: Campaign }) {
  const [votes, setVotes] = useState(snap.votes);
  const [balance, setBalance] = useState(currentUser.usdcBalance);
  const isMockId = snap.id.startsWith("snap-");
  const postId = isMockId ? undefined : snap.id;

  return (
    <div className="flex flex-col gap-space-md lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-space-lg">
      <div className="w-full overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest shadow-soft">
        <SnapHero snap={snap} votes={votes} timeLeft={`${campaign.daysLeft}d left`} />
      </div>

      <div className="flex flex-col gap-space-md">
        <SupportPanel
          creatorName={snap.creator.name}
          balance={balance}
          postId={postId}
          onVoted={() => setVotes((n) => n + (postId ? 1 : 0))}
          onSupported={(usdc) => {
            setVotes((n) => n + 1);
            setBalance((b) => b - usdc);
          }}
        />
        {!postId && (
          <p className="rounded-2xl bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant">
            Demo snap — using local preview. Post a snap for live API voting.
          </p>
        )}

        <Link
          href={`/campaigns/${campaign.id}/leaderboard`}
          className="flex items-center justify-center gap-2 rounded-full border-2 border-on-surface/10 bg-surface-container-lowest px-4 py-3 font-bold text-secondary shadow-soft transition-all hover:bg-surface-container active:scale-95"
        >
          <Trophy size={20} />
          <span className="text-label-md">Leaderboard</span>
        </Link>

        <div className="flex items-center gap-3 rounded-2xl border-2 border-on-surface/10 bg-surface-container p-3 text-on-surface-variant">
          <ShieldCheck size={20} className="shrink-0 text-secondary" />
          <p className="text-body-sm leading-snug">
            Free votes protect against bots with on-chain verification. Optional support goes straight to the creator.
            Gas fees are covered by instant.fun.
          </p>
        </div>
      </div>
    </div>
  );
}
