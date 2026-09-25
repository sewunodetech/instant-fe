"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, Info } from "lucide-react";
import type { Creator, RewardedVoter } from "@/lib/mock-data";

type Tab = "creators" | "voters";

type Props = {
  creators: Creator[];
  voters: RewardedVoter[];
  ended: boolean;
};

export function RankingTabs({ creators, voters, ended }: Props) {
  const [tab, setTab] = useState<Tab>("creators");

  const tabs: { id: Tab; label: string }[] = [
    { id: "creators", label: "Top Creators (All)" },
    { id: "voters", label: ended ? "Top Voters Rewarded" : "Top Voters" },
  ];

  return (
    <>
      <div role="tablist" className="flex rounded-full bg-surface-container p-1">
        {tabs.map((t) => (
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
        <ol className="flex flex-col gap-2.5">
          {creators.map((c) => (
            <li
              key={c.rank}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container text-label-md font-bold">
                  {c.rank}
                </span>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  <Image src={c.snapImage} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-label-md">@{c.handle}</span>
                    {c.verified && <BadgeCheck size={14} className="text-secondary" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="tabular-nums">{c.votes} votes</span>
                    <span>•</span>
                    <span className="text-label-sm text-tertiary">+{c.payoutUsdc} USDC</span>
                  </div>
                </div>
              </div>
              <button className="shrink-0 rounded-full bg-surface-container px-3 py-1.5 text-label-sm transition-all hover:bg-surface-container-high active:scale-95">
                View
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="mb-1 flex items-center gap-2 rounded-2xl bg-surface-container-low p-space-md">
            <Info size={20} className="text-secondary" />
            <p className="text-body-sm text-on-surface-variant">
              Voters who voted early on winning snaps earn pro-rata dividend yields!
            </p>
          </div>
          <ol className="flex flex-col gap-2.5">
            {voters.map((v) => (
              <li
                key={v.rank}
                className="flex items-center justify-between rounded-2xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-label-md ${
                      v.rank === 1 ? "bg-primary-fixed-dim/30 text-on-primary-fixed-variant" : "bg-surface-container"
                    }`}
                  >
                    {v.rank}
                  </span>
                  <Image src={v.avatar} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <span className="block text-label-md">@{v.handle}</span>
                    <span className="text-body-sm text-on-surface-variant">{v.note}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-label-lg font-extrabold text-tertiary tabular-nums">
                    +{v.dividendUsdc} USDC
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant">Dividend</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  );
}
