"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";

const filters = [
  { id: "hot", label: "For You" },
  { id: "following", label: "Following" },
  { id: "ending", label: "Ending Soon" },
] as const;

export function FeedFilters() {
  const [active, setActive] = useState<(typeof filters)[number]["id"]>("hot");

  return (
    <div role="tablist" className="no-scrollbar flex items-center gap-space-xs overflow-x-auto py-1">
      {filters.map((f) => {
        const selected = f.id === active;
        return (
          <button
            key={f.id}
            role="tab"
            aria-selected={selected}
            onClick={() => setActive(f.id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-label-md whitespace-nowrap transition-colors ${
              selected
                ? "bg-secondary text-on-secondary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant shadow-xs hover:bg-surface-container"
            }`}
          >
            {f.id === "hot" && <Icon name="whatshot" className="text-[16px]" />}
            {f.id === "ending" && <Icon name="hourglass_top" className="text-[16px]" />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
