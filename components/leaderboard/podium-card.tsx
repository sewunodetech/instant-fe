import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { RemoteImage } from "@/components/ui/remote-image";
import { handleOf, usdc } from "@/lib/format";
import type { LeaderboardEntry } from "@/lib/types";

const podium = {
  2: { rankLabel: "2nd place · Silver", badge: "bg-silver text-on-silver", prize: "text-on-silver" },
  3: { rankLabel: "3rd place · Bronze", badge: "bg-bronze text-on-bronze", prize: "text-on-bronze" },
} as const;

export function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const style = podium[entry.rank as 2 | 3];
  const { post } = entry;

  return (
    <Link
      href={`/snaps/${post.id}`}
      className="flex flex-col justify-between rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-3.5 shadow-soft transition-transform active:scale-[0.98]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-label-sm font-extrabold ${style.badge}`}>
          #{entry.rank}
        </span>
        <span className="flex items-center gap-0.5 text-label-sm text-on-surface-variant tabular-nums">
          <Heart size={13} fill="currentColor" className="text-vote" />
          {post.voteCount.toLocaleString("en")}
        </span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <Avatar user={post.user} size={32} />
        <div className="min-w-0">
          <span className="block truncate text-label-md">@{handleOf(post.user)}</span>
          <span className="text-[10px] font-bold text-on-surface-variant">{style.rankLabel}</span>
        </div>
      </div>
      <div className="relative mb-2 h-20 w-full overflow-hidden rounded-xl bg-surface-container">
        <RemoteImage src={post.imageUrl} alt="" fill sizes="200px" className="object-cover" />
      </div>
      {entry.prize > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-2 py-1.5">
          <span className="text-label-sm text-on-surface-variant">Prize</span>
          <span className={`text-label-lg font-extrabold tabular-nums ${style.prize}`}>+{usdc(entry.prize)}</span>
        </div>
      )}
    </Link>
  );
}
