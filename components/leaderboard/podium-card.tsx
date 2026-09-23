import Image from "next/image";
import { Heart } from "lucide-react";
import type { Creator } from "@/lib/mock-data";

const podium = {
  2: { rankLabel: "Silver Rank", badge: "bg-surface-container-highest text-on-surface-variant", prize: "text-secondary" },
  3: { rankLabel: "Bronze Rank", badge: "bg-primary-fixed-dim/40 text-on-primary-fixed-variant", prize: "text-tertiary" },
} as const;

export function PodiumCard({ creator }: { creator: Creator }) {
  const style = podium[creator.rank as 2 | 3];

  return (
    <div className="flex flex-col justify-between rounded-3xl bg-surface-container-lowest p-3.5 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-label-sm ${style.badge}`}>
          #{creator.rank}
        </span>
        <span className="flex items-center gap-0.5 text-label-sm text-on-surface-variant tabular-nums">
          <Heart size={13} fill="currentColor" className="text-error" />
          {creator.votes.toLocaleString("en")}
        </span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        {creator.avatar && (
          <Image src={creator.avatar} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" />
        )}
        <div className="min-w-0">
          <span className="block truncate text-label-md">@{creator.handle}</span>
          <span className="text-[10px] font-bold text-on-surface-variant">{style.rankLabel}</span>
        </div>
      </div>
      <div className="relative mb-2 h-20 w-full overflow-hidden rounded-xl bg-surface-container">
        <Image src={creator.snapImage} alt={`Snap by @${creator.handle}`} fill sizes="200px" className="object-cover" />
      </div>
      <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-2 py-1.5">
        <span className="text-label-sm text-on-surface-variant">Prize</span>
        <span className={`text-label-lg font-extrabold tabular-nums ${style.prize}`}>+{creator.payoutUsdc} USDC</span>
      </div>
    </div>
  );
}
