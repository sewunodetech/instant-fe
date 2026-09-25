"use client";

import { useState } from "react";
import { CampaignRowCard, FeaturedCampaignCard } from "@/components/discovery/campaign-cards";
import { LucideIcon } from "@/components/lucide-icon";
import type { Campaign } from "@/lib/mock-data";

const filters = [
  { id: "all", label: "All", icon: "apps" },
  { id: "trending", label: "Trending", icon: "whatshot" },
  { id: "live", label: "Live", icon: "bolt" },
  { id: "ending", label: "Ending Soon", icon: "hourglass_top" },
  { id: "prize", label: "Top Prize", icon: "emoji_events" },
] as const;

type FilterId = (typeof filters)[number]["id"];

const ENDING_SOON_DAYS = 3;

function apply(filter: FilterId, campaigns: Campaign[]) {
  switch (filter) {
    case "trending":
      return campaigns.filter((c) => c.trending);
    case "live":
      return campaigns.filter((c) => c.live);
    case "ending":
      return campaigns.filter((c) => c.daysLeft <= ENDING_SOON_DAYS).sort((a, b) => a.daysLeft - b.daysLeft);
    case "prize":
      return [...campaigns].sort((a, b) => b.poolUsdc - a.poolUsdc);
    default:
      return campaigns;
  }
}

export function CampaignDiscovery({ campaigns }: { campaigns: Campaign[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [featured, ...rest] = apply(filter, campaigns);

  return (
    <>
      <div role="tablist" className="no-scrollbar -mx-space-md flex items-center gap-2 overflow-x-auto px-space-md py-1 sm:mx-0 sm:px-0">
        {filters.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full text-label-md shadow-sm transition-all active:scale-95 ${
                f.id === "all" ? "px-5" : "px-4"
              } ${active ? "bg-on-surface text-surface-container-lowest" : "bg-surface-container-lowest hover:bg-surface-container"}`}
            >
              <LucideIcon name={f.icon} size={16} />
              {f.label}
            </button>
          );
        })}
      </div>

      {featured ? (
        <>
          <div className="grid grid-cols-1 gap-space-md lg:grid-cols-2">
            <div className="lg:col-span-2">
              <FeaturedCampaignCard campaign={featured} />
            </div>
            {rest.map((c) => (
              <CampaignRowCard key={c.id} campaign={c} />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-6 text-center text-body-md text-on-surface-variant shadow-soft">
          No campaigns match this filter right now.
        </p>
      )}
    </>
  );
}
