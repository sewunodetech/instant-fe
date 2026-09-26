"use client";

import { useMemo, useState } from "react";
import { Compass, Flame, Hourglass, LayoutGrid, Trophy, type LucideIcon } from "lucide-react";
import { CampaignRowCard, FeaturedCampaignCard } from "@/components/discovery/campaign-cards";
import { Stagger, StaggerItem } from "@/components/ui/motion-kit";
import { CampaignCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { listCampaigns } from "@/lib/api-client";
import { endsWithinHours } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { ApiCampaign } from "@/lib/types";

const filters: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "Live", icon: LayoutGrid },
  { id: "popular", label: "Popular", icon: Flame },
  { id: "ending", label: "Ending Soon", icon: Hourglass },
  { id: "prize", label: "Top Prize", icon: Trophy },
  { id: "ended", label: "Results", icon: Compass },
];

function apply(filter: string, campaigns: ApiCampaign[]) {
  switch (filter) {
    case "popular":
      return [...campaigns].sort((a, b) => b.stats.votes + b.stats.snaps - (a.stats.votes + a.stats.snaps));
    case "ending":
      return campaigns.filter((c) => endsWithinHours(c.endsAt, 72));
    case "prize":
      return campaigns.filter((c) => c.prizePool > 0).sort((a, b) => b.prizePool - a.prizePool);
    default:
      return campaigns;
  }
}

export function CampaignExplorer() {
  const [filter, setFilter] = useState("all");
  const ended = filter === "ended";
  const query = useApi(() => listCampaigns({ status: ended ? "ended" : "active", limit: 50 }).then((r) => r.data), [ended]);

  const visible = useMemo(() => apply(filter, query.data ?? []), [filter, query.data]);
  const [featured, ...rest] = visible;

  return (
    <>
      <div role="tablist" className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1">
        {filters.map((f) => {
          const active = f.id === filter;
          const Icon = f.icon;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-label-md transition-all active:scale-95 ${
                active ? "bg-secondary-container font-bold text-on-secondary" : "bg-surface-container text-on-surface-variant"
              }`}
            >
              <Icon size={16} />
              {f.label}
            </button>
          );
        })}
      </div>

      {query.loading ? (
        <div className="flex flex-col gap-space-md">
          <CampaignCardSkeleton featured />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      ) : query.error ? (
        <ErrorState message={query.error} onRetry={query.reload} />
      ) : featured ? (
        <Stagger key={filter} className="flex flex-col gap-3">
          <StaggerItem>
            <FeaturedCampaignCard campaign={featured} />
          </StaggerItem>
          {rest.map((c) => (
            <StaggerItem key={c.id}>
              <CampaignRowCard campaign={c} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={<Compass size={24} />}
          title={ended ? "No finished campaigns yet" : filter === "all" ? "No live campaigns" : "Nothing matches"}
          body={
            ended
              ? "Results show up here once a campaign closes."
              : filter === "all"
                ? "Start the first one — it takes a minute."
                : "Try another filter."
          }
          action={!ended && filter === "all" ? { label: "Create campaign", href: "/create" } : undefined}
        />
      )}
    </>
  );
}
