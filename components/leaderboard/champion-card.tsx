import Link from "next/link";
import { Award, Heart } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { RemoteImage } from "@/components/ui/remote-image";
import { handleOf, profileKey, usdc } from "@/lib/format";
import type { LeaderboardEntry } from "@/lib/types";

export function ChampionCard({ entry, ended }: { entry: LeaderboardEntry; ended: boolean }) {
  const { post } = entry;
  const handle = handleOf(post.user);
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border-2 border-primary-container bg-surface-container-lowest p-space-md shadow-soft ring-4 ring-primary-container/15">
      <div className="mb-space-sm flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-label-sm font-extrabold text-on-primary-container">
          <Award size={16} fill="currentColor" />
          {ended ? "#1 Champion" : "#1 Leading"}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm tabular-nums">
          <Heart size={15} fill="currentColor" className="text-error" />
          {post.voteCount.toLocaleString("en")} votes
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/snaps/${post.id}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container"
        >
          <RemoteImage src={post.imageUrl} alt={`Winning snap by @${handle}`} fill sizes="96px" className="object-cover" />
        </Link>
        <div className="flex h-24 min-w-0 flex-1 flex-col justify-between py-0.5">
          <Link href={`/u/${profileKey(post.user)}`} className="flex min-w-0 items-center gap-2">
            <Avatar user={post.user} size={24} />
            <span className="truncate text-label-lg">@{handle}</span>
          </Link>
          {post.caption && <p className="truncate text-body-sm text-on-surface-variant">&ldquo;{post.caption}&rdquo;</p>}
          {entry.prize > 0 && (
            <div>
              <span className="block text-label-sm text-on-surface-variant">{ended ? "Prize" : "On track for"}</span>
              <span className="text-headline-sm font-extrabold text-tertiary tabular-nums">+{usdc(entry.prize)} USDC</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
