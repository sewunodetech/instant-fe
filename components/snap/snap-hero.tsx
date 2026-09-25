import Link from "next/link";
import { Clock } from "lucide-react";
import { DoubleTapVote } from "@/components/snap/double-tap-vote";
import { AnimatedHeart, RollingCount } from "@/components/ui/animated-heart";
import { Avatar } from "@/components/auth/user-avatar";
import { rankPill } from "@/components/ui/rank";
import { RemoteImage } from "@/components/ui/remote-image";
import { handleOf, profileKey, timeAgo, timeLeft } from "@/lib/format";
import type { ApiPost } from "@/lib/types";

export function SnapHero({
  post,
  votes,
  hasVoted,
  canVote,
  onVote,
}: {
  post: ApiPost;
  votes: number;
  hasVoted: boolean;
  canVote: boolean;
  onVote: () => void;
}) {
  const handle = handleOf(post.user);
  const left = post.campaign.status === "ACTIVE" ? timeLeft(post.campaign.endsAt) : null;

  return (
    <div className="snap-hero-frame bg-surface-container">
      <DoubleTapVote canVote={canVote} hasVoted={hasVoted} onVote={onVote} label={`Snap by @${handle}. Double-tap to vote.`}>
        <RemoteImage
          src={post.imageUrl}
          alt={post.caption || `Snap by @${handle}`}
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-cover"
        />
      </DoubleTapVote>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <AnimatedHeart active={hasVoted} size={16} className="text-on-surface-variant" />
          <span className="flex gap-1 text-label-md font-extrabold tracking-tight">
            <RollingCount value={votes} /> {votes === 1 ? "vote" : "votes"}
          </span>
          {post.rank && (
            <>
              <span className="h-1 w-1 rounded-full bg-outline-variant" />
              <span className={`rounded-full px-1.5 py-0.5 text-label-sm font-bold ${rankPill(post.rank)}`}>
                Rank #{post.rank}
              </span>
            </>
          )}
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-on-surface shadow-sm backdrop-blur-md">
          <Clock size={14} />
          <span className="text-label-sm">{left ?? "Ended"}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <Link href={`/u/${profileKey(post.user)}`} className="absolute bottom-3 left-3 flex max-w-[85%] items-center gap-2">
        <Avatar user={post.user} size={40} className="shadow-sm" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-label-lg text-white drop-shadow-sm">@{handle}</span>
          <span className="text-label-sm text-white/80">{timeAgo(post.createdAt)}</span>
        </div>
      </Link>
    </div>
  );
}
