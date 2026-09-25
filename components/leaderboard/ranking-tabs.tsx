"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { RemoteImage } from "@/components/ui/remote-image";
import { handleOf, profileKey } from "@/lib/format";
import type { LeaderboardEntry, TopVoter } from "@/lib/types";

type Tab = "creators" | "voters";

export function RankingTabs({ entries, voters }: { entries: LeaderboardEntry[]; voters: TopVoter[] }) {
  const [tab, setTab] = useState<Tab>("creators");

  return (
    <>
      <div role="tablist" className="flex rounded-full bg-surface-container p-1">
        {(
          [
            { id: "creators", label: "All snaps" },
            { id: "voters", label: "Top voters" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-3 py-2 text-center text-label-md font-bold transition-all ${
              tab === t.id ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "creators" ? (
        entries.length === 0 ? (
          <p className="rounded-2xl bg-surface-container-low p-4 text-center text-body-sm text-on-surface-variant">
            No other snaps yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {entries.map((e) => (
              <li key={e.post.id}>
                <Link
                  href={`/snaps/${e.post.id}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-on-surface/10 bg-surface-container-lowest p-3 shadow-soft transition-transform active:scale-[0.99]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-md font-bold tabular-nums">
                    {e.rank}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    <RemoteImage src={e.post.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-label-md">@{handleOf(e.post.user)}</span>
                    <span className="text-body-sm text-on-surface-variant tabular-nums">
                      {e.post.voteCount} {e.post.voteCount === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                  {e.post.hasVoted && (
                    <span className="shrink-0 rounded-full bg-tertiary-container/60 px-2 py-0.5 text-label-sm text-on-tertiary-container">
                      Voted
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 rounded-2xl bg-surface-container-low p-3">
            <Info size={18} className="shrink-0 text-secondary" />
            <p className="text-body-sm text-on-surface-variant">Community members who cast the most votes in this campaign.</p>
          </div>
          {voters.length === 0 ? (
            <p className="rounded-2xl bg-surface-container-low p-4 text-center text-body-sm text-on-surface-variant">
              No votes yet.
            </p>
          ) : (
            <ol className="flex flex-col gap-2.5">
              {voters.map((v, i) => (
                <li key={v.user.id}>
                  <Link
                    href={`/u/${profileKey(v.user)}`}
                    className="flex items-center gap-3 rounded-2xl border-2 border-on-surface/10 bg-surface-container-lowest p-3 shadow-soft"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-md">
                      {i + 1}
                    </span>
                    <Avatar user={v.user} size={40} />
                    <span className="min-w-0 flex-1 truncate text-label-md">@{handleOf(v.user)}</span>
                    <span className="shrink-0 text-label-md font-extrabold text-secondary tabular-nums">
                      {v.votes} {v.votes === 1 ? "vote" : "votes"}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </>
  );
}
