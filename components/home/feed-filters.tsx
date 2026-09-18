"use client";

import { useState } from "react";

const filters = ["For You (Hot Snaps)", "Following", "Ending Soon ⏳"] as const;

export function FeedFilters() {
  const [active, setActive] = useState<(typeof filters)[number]>(filters[0]);

  return (
    <div role="tablist" className="no-scrollbar flex items-center gap-space-xs overflow-x-auto py-1">
      {filters.map((f) => {
        const selected = f === active;
        return (
          <button
            key={f}
            role="tab"
            aria-selected={selected}
            onClick={() => setActive(f)}
            className={`rounded-full px-4 py-2 text-label-md whitespace-nowrap transition-colors ${
              selected
                ? "bg-secondary text-on-secondary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant shadow-xs hover:bg-surface-container"
            }`}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
