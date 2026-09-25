"use client";

import Link from "next/link";
import { useState } from "react";
import { BellOff, Flag, HandHeart, Heart, Trophy, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Stagger, StaggerItem } from "@/components/ui/motion-kit";
import { RemoteImage } from "@/components/ui/remote-image";
import { ListRowSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { getMyActivity } from "@/lib/api-client";
import { campaignTag, handleOf, ordinal, timeAgo, usdc } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { ActivityItem, ActivityKind } from "@/lib/types";

const kindMeta: Record<ActivityKind, { icon: LucideIcon; className: string }> = {
  vote: { icon: Heart, className: "bg-vote-container text-vote" },
  support_in: { icon: HandHeart, className: "bg-tertiary-container text-on-tertiary-container" },
  support_out: { icon: HandHeart, className: "bg-secondary-container text-on-secondary" },
  win: { icon: Trophy, className: "bg-primary-container text-on-primary-container" },
  campaign_end: { icon: Flag, className: "bg-secondary-fixed text-on-secondary-fixed" },
};

const filters = [
  { id: "all", label: "All" },
  { id: "vote", label: "Votes" },
  { id: "support", label: "Support" },
  { id: "results", label: "Results" },
] as const;
type FilterId = (typeof filters)[number]["id"];

function matches(filter: FilterId, item: ActivityItem) {
  if (filter === "all") return true;
  if (filter === "vote") return item.kind === "vote";
  if (filter === "support") return item.kind === "support_in" || item.kind === "support_out";
  return item.kind === "win" || item.kind === "campaign_end";
}

function describe(item: ActivityItem) {
  const tag = item.campaign ? campaignTag(item.campaign.title) : "";
  const who = item.actor ? `@${handleOf(item.actor)}` : "Someone";
  switch (item.kind) {
    case "vote":
      return { title: `${who} voted your snap`, detail: tag };
    case "support_in":
      return { title: `${who} sent you ${usdc(item.amount ?? 0)} USDC`, detail: tag };
    case "support_out":
      return { title: `You supported ${who}`, detail: `${usdc(item.amount ?? 0)} USDC · ${tag}` };
    case "win":
      return {
        title: `You placed ${ordinal(item.rank ?? 0)} in ${tag}!`,
        detail: item.prize ? `Prize: ${usdc(item.prize)} USDC` : "Winners announced",
      };
    case "campaign_end":
      return { title: `Your campaign ${tag} ended`, detail: "Winners are announced — see results" };
  }
}

function hrefFor(item: ActivityItem) {
  if (item.kind === "win" || item.kind === "campaign_end") return `/campaigns/${item.campaign?.id}/leaderboard`;
  if (item.post) return `/snaps/${item.post.id}`;
  return item.campaign ? `/campaigns/${item.campaign.id}` : "/home";
}

export default function ActivityPage() {
  const [filter, setFilter] = useState<FilterId>("all");
  const activity = useApi(() => getMyActivity(), []);
  const items = (activity.data ?? []).filter((item) => matches(filter, item));

  return (
    <>
    <ScreenHeader title="Activity" subtitle="Votes, support & results" />
    <div className="flex flex-col gap-4 px-4 pt-2">
      <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {filters.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`h-10 shrink-0 rounded-full px-4 text-label-md transition-all active:scale-95 ${
                active ? "bg-secondary-container font-bold text-on-secondary" : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {activity.loading ? (
        <ListRowSkeleton />
      ) : activity.error ? (
        <ErrorState message={activity.error} onRetry={activity.reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BellOff size={24} />}
          title="Nothing here yet"
          body="Post snaps and vote on others — votes, support and results will show up here."
          action={{ label: "Explore campaigns", href: "/campaigns" }}
        />
      ) : (
        <Stagger className="flex flex-col gap-space-sm">
          {items.map((item) => {
            const meta = kindMeta[item.kind];
            const Icon = meta.icon;
            const { title, detail } = describe(item);
            return (
              <StaggerItem key={item.id}>
                <Link
                  href={hrefFor(item)}
                  className={`flex items-center gap-3 rounded-3xl border-2 bg-surface-container-lowest p-3 shadow-soft transition-all active:scale-[0.99] ${
                    item.kind === "win" ? "border-primary-container ring-4 ring-primary-container/15" : "border-on-surface/10"
                  }`}
                >
                  <div className="relative shrink-0">
                    {item.actor ? (
                      <Avatar user={item.actor} size={48} />
                    ) : (
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${meta.className}`}>
                        <Icon size={22} />
                      </div>
                    )}
                    {item.actor && (
                      <span
                        className={`absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-surface ${meta.className}`}
                      >
                        <Icon size={11} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md">{title}</p>
                    <p className="truncate text-body-sm text-on-surface-variant">{detail}</p>
                    <p className="mt-0.5 text-label-sm text-on-surface-variant/70">{timeAgo(item.createdAt)}</p>
                  </div>
                  {item.post && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      <RemoteImage src={item.post.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}
    </div>
    </>
  );
}
