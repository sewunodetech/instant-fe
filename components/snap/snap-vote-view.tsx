"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageCircle, ShieldCheck, Trophy } from "lucide-react";
import { SnapHero } from "@/components/snap/snap-hero";
import { SupportPanel } from "@/components/snap/support-panel";
import { currentUser, type Campaign, type Snap } from "@/lib/mock-data";

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
  const isMockId = snap.id.startsWith("snap-");
  const postId = isMockId ? undefined : snap.id;

  return (
    <div className="flex flex-col gap-space-md lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-space-lg">
      <div className="w-full overflow-hidden rounded-3xl bg-surface-container-lowest shadow-card">
        <SnapHero snap={snap} votes={votes} timeLeft={`${campaign.daysLeft}d left`} />
        <div className="p-space-md">
          <Caption text={snap.caption} campaignTag={campaign.tag} />
        </div>
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

        <div className="flex items-center gap-2">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-4 py-3 shadow-sm transition-all hover:bg-surface-container active:scale-95">
            <MessageCircle size={20} className="text-on-surface-variant" />
            <span className="text-label-md">{snap.comments} Comments</span>
          </button>
          <Link
            href={`/campaigns/${campaign.id}/leaderboard`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface-container-lowest px-4 py-3 text-secondary shadow-sm transition-all hover:bg-surface-container active:scale-95"
          >
            <Trophy size={20} />
            <span className="text-label-md">Leaderboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-surface-container p-3 text-on-surface-variant">
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
