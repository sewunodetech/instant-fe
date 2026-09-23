"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { BackButton } from "@/components/layout/back-button";
import { activityFeed, type ActivityKind } from "@/lib/mock-data";

const kindMeta: Record<ActivityKind, { icon: string; className: string }> = {
  vote: { icon: "how_to_vote", className: "bg-secondary-fixed text-on-secondary-fixed" },
  support: { icon: "volunteer_activism", className: "bg-primary-container text-on-primary-fixed" },
  comment: { icon: "mode_comment", className: "bg-surface-container text-on-surface-variant" },
  follow: { icon: "person_add", className: "bg-tertiary-container text-on-tertiary-container" },
  reward: { icon: "emoji_events", className: "bg-tertiary text-on-tertiary" },
  campaign: { icon: "campaign", className: "bg-error-container text-on-error-container" },
};

const filters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reward", label: "Rewards" },
  { id: "support", label: "Support" },
] as const;

export default function ActivityPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");

  const items = activityFeed.filter((item) => {
    if (filter === "all") return true;
    if (filter === "unread") return item.unread;
    return item.kind === filter;
  });

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/home" />
          <div>
            <h1 className="text-headline-sm tracking-tight">Activity</h1>
            <p className="text-label-sm text-on-surface-variant">Votes, support &amp; campaign updates</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Mark all read"
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="done_all" className="text-[22px]" />
        </button>
      </div>

      <div role="tablist" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {filters.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`h-9 shrink-0 rounded-full px-4 text-label-md shadow-sm transition-all active:scale-95 ${
                active ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-lowest hover:bg-surface-container"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-surface-container-lowest p-8 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
            <Icon name="notifications_none" className="text-[24px] text-on-surface-variant" />
          </div>
          <p className="text-headline-sm">All clear</p>
          <p className="max-w-[240px] text-body-sm text-on-surface-variant">New activity will show up here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-space-sm">
          {items.map((item) => {
            const meta = kindMeta[item.kind];
            const href =
              item.snapId && ["snap-1", "snap-2"].includes(item.snapId)
                ? `/snaps/${item.snapId}`
                : item.campaignId
                  ? `/campaigns/${item.campaignId}`
                  : item.snapId
                    ? "/home"
                    : "/activity";
            return (
              <li key={item.id}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-3xl p-3 transition-shadow hover:shadow-card ${
                    item.unread ? "bg-surface-container-lowest shadow-sm ring-1 ring-primary-container/60" : "bg-surface-container-lowest shadow-sm"
                  }`}
                >
                  <div className="relative shrink-0">
                    {item.avatar ? (
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-surface-container">
                        <Image src={item.avatar} alt="" width={48} height={48} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${meta.className}`}>
                        <Icon name={meta.icon} className="text-[22px]" filled={item.kind === "reward"} />
                      </div>
                    )}
                    <span
                      className={`absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-surface ${meta.className}`}
                    >
                      <Icon name={meta.icon} className="text-[11px]" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-label-md">{item.title}</p>
                      {item.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />}
                    </div>
                    <p className="truncate text-body-sm text-on-surface-variant">{item.detail}</p>
                    <p className="mt-0.5 text-label-sm text-on-surface-variant/70">{item.timeAgo}</p>
                  </div>
                  {typeof item.amountUsdc === "number" && item.amountUsdc > 0 && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-label-sm tabular-nums ${
                        item.kind === "support" && item.title.startsWith("You")
                          ? "bg-surface-container text-on-surface"
                          : "bg-tertiary-container/50 text-on-tertiary-container"
                      }`}
                    >
                      {item.kind === "support" && item.title.startsWith("You") ? "−" : "+"}
                      {item.amountUsdc} USDC
                    </span>
                  )}
                  <Icon name="chevron_right" className="shrink-0 text-[18px] text-on-surface-variant" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="text-label-lg">Quick links</h2>
        </div>
        <div className="grid grid-cols-3 gap-space-xs">
          {[
            { href: "/wallet", label: "Wallet", icon: "account_balance_wallet" },
            { href: "/rewards", label: "Rewards", icon: "emoji_events" },
            { href: "/campaigns", label: "Explore", icon: "explore" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-container-low p-3 text-label-sm transition-colors hover:bg-surface-container"
            >
              <Icon name={l.icon} className="text-[20px] text-secondary" />
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
