"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HandHeart, Hash, Loader2, Trash2, Trophy } from "lucide-react";
import { AnimatedHeart } from "@/components/ui/animated-heart";
import { Avatar } from "@/components/auth/user-avatar";
import { BackButton } from "@/components/layout/back-button";
import { ShareButton } from "@/components/snap/share-button";
import { SnapHero } from "@/components/snap/snap-hero";
import { SupportPanel } from "@/components/snap/support-panel";
import { useVote } from "@/components/snap/use-vote";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { deletePost, errorMessage, getPost, listPostVoters } from "@/lib/api-client";
import { campaignTag, handleOf, nameOf, profileKey, usdc } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { ApiPost } from "@/lib/types";

export function SnapDetail({ id }: { id: string }) {
  const post = useApi(() => getPost(id), [id]);

  if (post.loading && !post.data) {
    return (
      <div role="status" aria-label="Loading snap" className="flex flex-col gap-space-md px-space-md pt-2 pb-4">
        <div className="flex items-center justify-between">
          <BackButton fallbackHref="/home" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
        <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>
    );
  }
  if (!post.data) {
    return (
      <div className="flex flex-col gap-space-md px-space-md pt-2">
        <BackButton fallbackHref="/home" />
        <ErrorState message={post.error ?? "Snap not found"} onRetry={post.reload} />
      </div>
    );
  }
  return <SnapDetailLoaded key={post.data.id} post={post.data} />;
}

function SnapDetailLoaded({ post: initial }: { post: ApiPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const { voteCount, hasVoted, toggle, error, disabledReason, isOwn } = useVote(post);
  const voters = useApi(() => listPostVoters(post.id, 1, 12), [post.id, voteCount]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handle = handleOf(post.user);
  const creatorName = nameOf(post.user);
  const live = post.campaign.status === "ACTIVE";

  async function remove() {
    if (!window.confirm("Delete this snap? Its votes will be lost.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(post.id);
      router.replace(`/campaigns/${post.campaign.id}`);
    } catch (e) {
      setDeleteError(errorMessage(e));
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-space-md px-space-md pt-2 pb-4">
      <div className="flex items-center justify-between gap-2">
        <BackButton fallbackHref="/home" />
        <Link
          href={`/campaigns/${post.campaign.id}`}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-secondary-fixed px-3 py-1 text-secondary shadow-sm"
        >
          <Hash size={16} className="shrink-0" />
          <span className="truncate text-label-md">{campaignTag(post.campaign.title)}</span>
        </Link>
        <ShareButton
          title={`Vote for @${handle} on instant.fun`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-container"
        />
      </div>

      <div className="flex flex-col gap-space-md">
        <div className="flex flex-col gap-space-sm">
          <div className="w-full overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest shadow-soft">
            <SnapHero post={post} votes={voteCount} hasVoted={hasVoted} canVote={!disabledReason} onVote={toggle} />
          </div>
          {post.caption && <p className="px-1 text-body-md whitespace-pre-line">{post.caption}</p>}
          {post.donationAmount > 0 && (
            <p className="flex items-center gap-1.5 px-1 text-body-sm text-on-surface-variant">
              <HandHeart size={16} className="text-secondary" />
              {usdc(post.donationAmount)} USDC from {post.donationCount}{" "}
              {post.donationCount === 1 ? "supporter" : "supporters"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-space-md">
          <section className="flex flex-col gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
            <button
              type="button"
              onClick={toggle}
              disabled={Boolean(disabledReason)}
              aria-pressed={hasVoted}
              className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-label-lg transition-colors duration-200 active:scale-95 disabled:cursor-default ${
                hasVoted
                  ? "bg-vote-container text-on-vote-container"
                  : disabledReason
                    ? "bg-surface-container text-on-surface-variant"
                    : "bg-secondary-container text-on-secondary shadow-shutter"
              }`}
            >
              <AnimatedHeart active={hasVoted} size={22} />
              <span className="font-bold tracking-tight">
                {hasVoted ? "Voted · tap to undo" : isOwn ? "You can't vote your own snap" : disabledReason ?? "Vote — it's free"}
              </span>
            </button>
            {error && (
              <p role="alert" className="text-body-sm text-error">
                {error}
              </p>
            )}
            <p className="text-center text-body-sm text-on-surface-variant">
              One free vote per snap. Top 3 by votes win when the campaign ends.
            </p>
          </section>

          {!isOwn && live && (
            <SupportPanel
              post={post}
              creatorName={creatorName}
              onSupported={(update) => setPost((p) => ({ ...p, ...update }))}
            />
          )}

          <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
            <h3 className="mb-space-sm text-label-lg font-extrabold">Recent voters</h3>
            {voters.loading && !voters.data ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            ) : !voters.data?.data.length ? (
              <p className="text-body-sm text-on-surface-variant">No votes yet — be the first.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {voters.data.data.map((v) => (
                  <li key={v.id}>
                    <Link href={`/u/${profileKey(v.user)}`} aria-label={`@${handleOf(v.user)}`} title={`@${handleOf(v.user)}`}>
                      <Avatar user={v.user} size={40} />
                    </Link>
                  </li>
                ))}
                {voters.data.meta.total > voters.data.data.length && (
                  <li className="flex h-10 items-center rounded-full bg-surface-container px-3 text-label-sm text-on-surface-variant">
                    +{voters.data.meta.total - voters.data.data.length}
                  </li>
                )}
              </ul>
            )}
          </section>

          <Link
            href={`/campaigns/${post.campaign.id}/leaderboard`}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-on-surface/10 bg-surface-container-lowest px-4 py-3 font-bold text-secondary shadow-soft transition-all hover:bg-surface-container active:scale-95"
          >
            <Trophy size={20} />
            <span className="text-label-md">{live ? "Leaderboard" : "See winners"}</span>
          </Link>

          {isOwn && live && (
            <>
              {deleteError && <p className="text-body-sm text-error">{deleteError}</p>}
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-full px-4 py-3 text-label-md text-error transition-colors hover:bg-error/10 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Delete snap
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
