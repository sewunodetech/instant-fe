"use client";

import { useState } from "react";
import { Flame, Hourglass } from "lucide-react";

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
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-label-md font-bold whitespace-nowrap shadow-soft transition-all active:scale-95 ${
              selected
                ? "bg-on-surface text-surface-container-lowest"
                : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {f.id === "hot" && <Flame size={16} />}
            {f.id === "ending" && <Hourglass size={16} />}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
