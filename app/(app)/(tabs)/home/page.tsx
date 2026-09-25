"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Camera, Flame, Sparkles, Wallet, Zap } from "lucide-react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { headerIconButton } from "@/components/layout/screen-header";
import { CampaignStories } from "@/components/home/campaign-stories";
import { JoinSnapBanner } from "@/components/home/join-snap-banner";
import { SnapCard } from "@/components/home/snap-card";
import { FeedSkeleton, StoriesSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, LoadMore } from "@/components/ui/state";
import { errorMessage, listCampaigns, listFeed } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import type { ApiPost } from "@/lib/types";

const PAGE_SIZE = 10;
const sorts = [
  { id: "latest", label: "Latest", icon: Zap },
  { id: "top", label: "Top", icon: Flame },
] as const;
type Sort = (typeof sorts)[number]["id"];

export default function HomePage() {
  const campaigns = useApi(() => listCampaigns({ status: "active", limit: 12 }).then((r) => r.data), []);

  const [sort, setSort] = useState<Sort>("latest");
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nonce, setNonce] = useState(0);

  // Resolves a page request; callers flip the loading flags before fetching.
  const settle = useCallback((nextPage: number, res: Awaited<ReturnType<typeof listFeed>> | null, e?: unknown) => {
    if (res) {
      setPosts((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data.filter((p) => !prev.some((x) => x.id === p.id))]));
      setPage(nextPage);
      setHasMore(nextPage < res.meta.totalPages);
      setError(null);
    } else {
      setError(errorMessage(e));
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listFeed({ sort, page: 1, limit: PAGE_SIZE }).then(
      (res) => !cancelled && settle(1, res),
      (e) => !cancelled && settle(1, null, e)
    );
    return () => {
      cancelled = true;
    };
  }, [sort, nonce, settle]);

  const changeSort = (next: Sort) => {
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
    listFeed({ sort, page: next, limit: PAGE_SIZE }).then(
      (res) => settle(next, res),
      (e) => settle(next, null, e)
    );
  };

  const featured = campaigns.data?.[0];

  return (
    <>
      <header className="flex items-center justify-between px-4 pt-3">
        <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
        <div className="flex items-center gap-1.5">
          <Link href="/wallet" aria-label="Wallet" className={headerIconButton}>
            <Wallet size={20} />
          </Link>
          <UserAvatar size={36} />
        </div>
      </header>

      {campaigns.loading ? <StoriesSkeleton /> : <CampaignStories campaigns={campaigns.data ?? []} />}

      <div className="flex flex-col gap-4 px-4">
        <div className="sticky top-0 z-30 -mx-4 bg-surface/90 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pb-2 backdrop-blur-lg">
          <div role="tablist" aria-label="Sort feed" className="grid grid-cols-2 rounded-full bg-surface-container p-1">
            {sorts.map((s) => {
              const selected = s.id === sort;
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => changeSort(s.id)}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-full text-label-md transition-all duration-200 ${
                    selected ? "bg-surface-container-lowest font-bold text-on-surface shadow-sm" : "text-on-surface-variant"
                  }`}
                >
                  <Icon size={16} className={selected ? "text-secondary" : ""} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <FeedSkeleton />
        ) : error && posts.length === 0 ? (
          <ErrorState message={error} onRetry={reload} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Camera size={24} />}
            title="No snaps yet"
            body={
              campaigns.data?.length
                ? "Be the first to post in a live campaign."
                : "No live campaigns right now — start one and invite friends."
            }
            action={campaigns.data?.length ? { label: "Post a snap", href: "/snap" } : { label: "Create campaign", href: "/create" }}
          />
        ) : (
          <div className="flex flex-col gap-space-md">
            {posts.map((post, i) => (
              <SnapCard key={post.id} post={post} priority={i === 0} />
            ))}
            {error && <ErrorState message={error} onRetry={loadMore} />}
            {hasMore && !error && <LoadMore onClick={loadMore} loading={loadingMore} />}
          </div>
        )}

        {featured && !loading && <JoinSnapBanner campaign={featured} />}

        {!loading && posts.length > 0 && !hasMore && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary shadow-sm">
              <Sparkles size={20} />
            </div>
            <p className="text-headline-sm font-extrabold tracking-tight">You&apos;re all caught up!</p>
            <p className="max-w-[260px] text-body-sm text-on-surface-variant">
              New snaps show up here as creators post them.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
