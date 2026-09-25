"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Camera, Vote } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { GridSkeleton } from "@/components/ui/skeleton";
import { ErrorState, LoadMore } from "@/components/ui/state";
import { errorMessage, listCampaignPosts } from "@/lib/api-client";
import { campaignTag, compactNumber, handleOf } from "@/lib/format";
import type { ApiPost } from "@/lib/types";

const PAGE_SIZE = 12;

export function CampaignFeed({
  campaignId,
  title,
  live,
  onRemaining,
}: {
  campaignId: string;
  title: string;
  live: boolean;
  onRemaining?: (remaining: number | null) => void;
}) {
  const [sort, setSort] = useState<"top" | "latest">("top");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nonce, setNonce] = useState(0);

  // Resolves a page request; callers flip the loading flags before fetching.
  const settle = useCallback(
    (nextPage: number, res: Awaited<ReturnType<typeof listCampaignPosts>> | null, e?: unknown) => {
      if (res) {
        setPosts((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data.filter((p) => !prev.some((x) => x.id === p.id))]));
        setError(null);
        setTotal(res.meta.total);
        setPage(nextPage);
        setHasMore(nextPage < res.meta.totalPages);
        onRemaining?.(res.meta.remainingSnaps ?? null);
      } else {
        setError(errorMessage(e));
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [onRemaining]
  );

  useEffect(() => {
    let cancelled = false;
    listCampaignPosts(campaignId, { sort, page: 1, limit: PAGE_SIZE }).then(
      (res) => !cancelled && settle(1, res),
      (e) => !cancelled && settle(1, null, e)
    );
    return () => {
      cancelled = true;
    };
  }, [campaignId, sort, nonce, settle]);

  const changeSort = (next: "top" | "latest") => {
    if (next === sort) return;
    setLoading(true);
    setSort(next);
  };
  const reload = () => {
    setLoading(true);
    setNonce((n) => n + 1);
  };
  const loadMore = () => {
    setLoadingMore(true);
    const next = page + 1;
    listCampaignPosts(campaignId, { sort, page: next, limit: PAGE_SIZE }).then(
      (res) => settle(next, res),
      (e) => settle(next, null, e)
    );
  };

  return (
    <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
      <div className="mb-space-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-space-xs">
          <h3 className="text-headline-sm font-extrabold tracking-tight">Snaps</h3>
          <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant tabular-nums">
            {loading ? "…" : total}
          </span>
        </div>
        <div role="tablist" className="flex rounded-full bg-surface-container p-0.5">
          {(["top", "latest"] as const).map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={sort === s}
              onClick={() => changeSort(s)}
              className={`rounded-full px-3 py-1 text-label-sm capitalize transition-all ${
                sort === s ? "bg-surface-container-lowest shadow-sm" : "text-on-surface-variant"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : error && posts.length === 0 ? (
        <ErrorState message={error} onRetry={reload} />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-low p-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-highest">
            <Camera size={22} className="text-on-surface-variant" />
          </div>
          <p className="text-label-md">No snaps yet</p>
          <p className="text-body-sm text-on-surface-variant">
            {live ? `Be the first to post in ${campaignTag(title)}.` : "Nobody posted in this campaign."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-space-sm">
          <div className="grid grid-cols-3 gap-1.5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/snaps/${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container"
              >
                <RemoteImage
                  src={post.imageUrl}
                  alt={post.caption || `Snap by @${handleOf(post.user)}`}
                  fill
                  sizes="(max-width: 767px) 33vw, 200px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {post.rank && post.rank <= 3 && (
                  <span className="absolute top-1 left-1 rounded-full bg-primary-container px-1.5 text-[10px] font-bold text-on-primary-container">
                    #{post.rank}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4 text-[10px] font-bold text-white">
                  <span className="flex items-center gap-0.5">
                    <Vote size={11} />
                    {compactNumber(post.voteCount)}
                  </span>
                  <span className="truncate">@{handleOf(post.user)}</span>
                </span>
              </Link>
            ))}
          </div>
          {hasMore && <LoadMore onClick={loadMore} loading={loadingMore} />}
        </div>
      )}
    </section>
  );
}
