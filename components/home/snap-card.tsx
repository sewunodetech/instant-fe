"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, HandHeart, Trophy } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { DoubleTapVote } from "@/components/snap/double-tap-vote";
import { ShareButton } from "@/components/snap/share-button";
import { useVote } from "@/components/snap/use-vote";
import { AnimatedHeart, RollingCount } from "@/components/ui/animated-heart";
import { rankPill } from "@/components/ui/rank";
import { RemoteImage } from "@/components/ui/remote-image";
import { campaignTag, handleOf, profileKey, timeAgo } from "@/lib/format";
import type { ApiPost } from "@/lib/types";
import { coin } from "@/lib/currency";

export function SnapCard({ post, priority }: { post: ApiPost; priority?: boolean }) {
  const router = useRouter();
  const { voteCount, hasVoted, toggle, pending, error, disabledReason, isOwn } = useVote(post);
  const handle = handleOf(post.user);
 const tag = campaignTag(post.campaign.title);

  return (
    <article className="flex flex-col gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-3 shadow-soft">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-container">
        <DoubleTapVote
          canVote={!disabledReason}
          hasVoted={hasVoted}
          onVote={toggle}
          onTap={() => router.push(`/snaps/${post.id}`)}
          label={`Open snap by @${handle}. Double-tap to vote.`}
        >
          <RemoteImage
            src={post.imageUrl}
            alt={post.caption || `Snap by @${handle}`}
            fill
            priority={priority}
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover select-none"
          />
        </DoubleTapVote>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <Link
            href={`/campaigns/${post.campaign.id}`}
            className="pointer-events-auto flex min-w-0 items-center gap-1.5 rounded-full bg-surface-container-lowest/85 px-3 py-1.5 text-on-surface shadow-sm backdrop-blur-md"
          >
            <span className="truncate text-label-sm">{tag}</span>
            {post.campaign.prizePool > 0 && (
              <>
                <span className="text-xs text-on-surface-variant/50">•</span>
                <span className="text-label-sm font-bold whitespace-nowrap text-secondary">
                  {coin(post.campaign.prizePool)}
                </span>
              </>
            )}
          </Link>
          {post.rank && (
            <div
              className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-label-sm shadow-sm ${
                rankPill(post.rank)
              }`}
            >
              <Trophy size={13} />#{post.rank}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between">
          <Link
            href={`/u/${profileKey(post.user)}`}
            className="pointer-events-auto flex min-w-0 items-center gap-2 rounded-full bg-surface-container-lowest/85 p-1.5 pr-3 text-on-surface shadow-sm backdrop-blur-md"
          >
            <Avatar user={post.user} size={32} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-label-md leading-tight">@{handle}</span>
              <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                <Clock size={11} />
                {timeAgo(post.createdAt)}
              </span>
            </div>
          </Link>
          <ShareButton
            title={`Vote for @${handle} on instant.fun`}
            path={`/snaps/${post.id}`}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest/85 text-on-surface shadow-sm backdrop-blur-md transition-all active:scale-95"
          />
        </div>
      </div>

      {post.caption && <p className="line-clamp-2 px-1 text-body-sm text-on-surface">{post.caption}</p>}

      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <button
          type="button"
          onClick={toggle}
          disabled={pending || Boolean(disabledReason)}
          aria-pressed={hasVoted}
          className={`flex h-11 items-center gap-2 rounded-full px-5 transition-colors duration-200 active:scale-95 disabled:cursor-default ${
            hasVoted
              ? "bg-vote-container text-on-vote-container"
              : disabledReason
                ? "bg-surface-container text-on-surface-variant"
                : "bg-secondary-container text-on-secondary shadow-md"
          }`}
        >
          <AnimatedHeart active={hasVoted} size={18} />
          <span className="text-label-lg whitespace-nowrap">
            {hasVoted ? "Voted" : isOwn ? "Your snap" : disabledReason ?? "Vote"}
          </span>
        </button>

        {!isOwn && post.campaign.status === "ACTIVE" && (
          <Link
            href={`/snaps/${post.id}#support`}
            className="flex h-11 items-center gap-1.5 rounded-full bg-surface-container px-4 text-label-md text-on-surface transition-transform active:scale-95"
          >
            <HandHeart size={18} className="text-secondary" />
            Support
          </Link>
        )}

        <span className={`ml-auto flex items-center gap-1 text-label-md font-bold ${hasVoted ? "text-vote" : "text-on-surface-variant"}`}>
          <RollingCount value={voteCount} /> {voteCount === 1 ? "vote" : "votes"}
        </span>
      </div>
      {error && (
        <p role="alert" className="px-1 text-body-sm text-error">
          {error}
        </p>
      )}
    </article>
  );
}
