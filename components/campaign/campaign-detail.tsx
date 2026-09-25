"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Camera, ChevronRight, Clock, Flag, CircleCheck, Crown, Heart, Hourglass, Loader2, Pencil, Trophy, Users } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { CampaignCover } from "@/components/campaign/campaign-cover";
import { CampaignFeed } from "@/components/campaign/campaign-feed";
import { HowItWorks } from "@/components/campaign/how-it-works";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { ShareButton } from "@/components/snap/share-button";
import { rankPill } from "@/components/ui/rank";
import { LiveCountdown, Shine } from "@/components/ui/motion-kit";
import { RemoteImage } from "@/components/ui/remote-image";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { endCampaign, errorMessage, getLeaderboard } from "@/lib/api-client";
import { campaignTag, compactNumber, handleOf, nameOf, profileKey, timeLeft, usdc } from "@/lib/format";
import { useApi } from "@/lib/use-api";

export function CampaignDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const board = useApi(() => getLeaderboard(id), [id]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const onRemaining = useCallback((n: number | null) => setRemaining(n), []);
  // When the countdown hits zero, refetch so the page flips to results.
  const reloadBoard = board.reload;
  const onClosed = useCallback(() => {
    setTimeout(() => void reloadBoard(), 1500);
  }, [reloadBoard]);

  const campaign = board.data?.campaign;

  if (board.loading && !campaign) return <DetailSkeleton />;
  if (!campaign) {
    return (
      <>
        <PageHeader backHref="/campaigns" />
        <main className="px-4 pt-24">
          <ErrorState message={board.error ?? "Campaign not found"} onRetry={board.reload} />
        </main>
      </>
    );
  }

  const live = campaign.status === "ACTIVE";
  const left = timeLeft(campaign.endsAt);
  const isHost = user?.id === campaign.creator?.id;
  const podium = board.data?.entries.slice(0, 3) ?? [];
  const tag = campaignTag(campaign.title);
  // Hosts judge their own campaign — they never enter it.
  const canPost = live && !isHost && remaining !== 0;

  async function endNow() {
    if (!window.confirm("End this campaign now? Voting closes and the top 3 are announced as winners.")) return;
    setEnding(true);
    setEndError(null);
    try {
      await endCampaign(id);
      await board.reload();
    } catch (e) {
      setEndError(errorMessage(e));
    } finally {
      setEnding(false);
    }
  }

  const stats = [
    { icon: Users, value: compactNumber(campaign.stats.creators), label: "Creators" },
    { icon: Camera, value: compactNumber(campaign.stats.snaps), label: "Snaps" },
    { icon: Heart, value: compactNumber(campaign.stats.votes), label: "Votes" },
  ];

  return (
    <>
      <PageHeader
        backHref="/campaigns"
        actions={
          <>
            {isHost && live && (
              <Link
                href={`/campaigns/${id}/edit`}
                aria-label="Edit campaign"
                className="flex h-11 w-11 items-center justify-center text-on-surface transition-transform active:scale-90"
              >
                <Pencil size={18} />
              </Link>
            )}
            <ShareButton
              title={`${tag} on instant.fun`}
              className="flex h-11 w-11 items-center justify-center text-on-surface transition-transform active:scale-90"
            />
          </>
        }
      />

      <main className="flex flex-1 flex-col gap-4 pb-[calc(env(safe-area-inset-bottom,0px)+7rem)]">
        <div className="relative aspect-[4/5] max-h-[68dvh] w-full overflow-hidden rounded-b-[2rem] bg-surface-container-low">
          <CampaignCover campaign={campaign} priority sizes="(max-width: 480px) 100vw, 480px" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/20" />
          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 text-white">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="w-fit rounded-full bg-white/20 px-2.5 py-0.5 text-label-sm backdrop-blur-md">{tag}</span>
              {isHost ? (
                <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-label-sm font-bold text-on-gold">
                  <Crown size={12} /> Hosting
                </span>
              ) : campaign.joined ? (
                <span className="flex items-center gap-1 rounded-full bg-tertiary-container px-2.5 py-0.5 text-label-sm font-bold text-on-tertiary-container">
                  <CircleCheck size={12} /> Joined
                </span>
              ) : null}
            </span>
            <h1 className="text-[1.875rem] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance drop-shadow-sm">
              {campaign.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex items-center justify-between gap-2">
            {campaign.prizePool > 0 ? (
              <span className="relative flex items-center gap-1.5 overflow-hidden rounded-full bg-gold px-3 py-1.5 text-label-md font-bold text-on-gold">
                <Shine />
                <Trophy size={15} /> {usdc(campaign.prizePool)} USDC prize
              </span>
            ) : (
              <span />
            )}
            <span className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1.5 text-label-md">
              {live ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
                  {campaign.endsAt ? <LiveCountdown endsAt={campaign.endsAt} onDone={onClosed} /> : "Live"}
                </>
              ) : (
                <>
                  <Flag size={13} />
                  Ended
                </>
              )}
            </span>
          </div>

        <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
          {campaign.category && (
            <span className="mb-space-sm inline-block rounded-full bg-secondary-fixed px-2.5 py-0.5 text-label-sm font-bold text-on-secondary-fixed capitalize">
              {campaign.category}
            </span>
          )}
          {campaign.description && (
            <p className="mb-space-md leading-relaxed whitespace-pre-line text-on-surface-variant">{campaign.description}</p>
          )}
          {campaign.creator && (
            <Link
              href={`/u/${profileKey(campaign.creator)}`}
              className="mb-space-md flex items-center gap-2 text-body-sm text-on-surface-variant"
            >
              <Avatar user={campaign.creator} size={24} />
              Hosted by <span className="font-bold text-on-surface">{nameOf(campaign.creator)}</span>
            </Link>
          )}
          <dl className="grid grid-cols-3 gap-space-xs">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center rounded-2xl bg-surface-container-low p-2.5 text-center">
                  <Icon size={20} className="mb-0.5 text-secondary" />
                  <dt className="order-last text-label-sm text-on-surface-variant">{s.label}</dt>
                  <dd className="text-headline-sm leading-tight font-extrabold tabular-nums">{s.value}</dd>
                </div>
              );
            })}
          </dl>
          {live && campaign.endsAt && (
            <p className="mt-space-sm flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <Clock size={14} />
              Winners announced{" "}
              {new Date(campaign.endsAt).toLocaleString("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </section>

        <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
          <div className="mb-space-sm flex items-center justify-between">
            <h3 className="text-headline-sm font-extrabold tracking-tight">{live ? "Live leaderboard" : "Winners"}</h3>
            <Link
              href={`/campaigns/${id}/leaderboard`}
              className="flex items-center text-label-md font-bold text-secondary hover:underline"
            >
              View all <ChevronRight size={16} />
            </Link>
          </div>
          {podium.length === 0 ? (
            <p className="rounded-2xl bg-surface-container-low p-4 text-center text-body-sm text-on-surface-variant">
              Rankings appear once snaps start getting votes.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {podium.map((e) => (
                <li key={e.post.id}>
                  <Link
                    href={`/snaps/${e.post.id}`}
                    className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-2 transition-colors hover:bg-surface-container"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-label-sm font-extrabold ${rankPill(e.rank)}`}>
                      {e.rank}
                    </span>
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      <RemoteImage src={e.post.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label-md">@{handleOf(e.post.user)}</p>
                      <p className="text-body-sm text-on-surface-variant tabular-nums">
                        {e.post.voteCount} {e.post.voteCount === 1 ? "vote" : "votes"}
                      </p>
                    </div>
                    {e.prize > 0 && (
                      <span className="shrink-0 text-label-md font-extrabold text-tertiary tabular-nums">
                        +{usdc(e.prize)} USDC
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <CampaignFeed campaignId={id} title={campaign.title} live={live} onRemaining={onRemaining} />

        <HowItWorks
          rules={campaign.rules}
          prizePool={campaign.prizePool}
          prizeSplit={board.data?.prizeSplit ?? []}
          maxPostsPerUser={campaign.maxPostsPerUser}
        />

        {isHost && live && (
          <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
            <h3 className="text-label-lg font-extrabold">Host controls</h3>
            <p className="mt-0.5 text-body-sm text-on-surface-variant">
              The campaign ends automatically {left ? `in ${left.replace(" left", "")}` : "soon"}. You can close it early
              to announce winners now.
            </p>
            {endError && <p className="mt-2 text-body-sm text-error">{endError}</p>}
            <Link
              href={`/campaigns/${id}/edit`}
              className="mt-space-sm flex h-11 w-full items-center justify-center gap-2 rounded-full bg-surface-container text-label-md transition-transform active:scale-95"
            >
              <Pencil size={16} />
              Edit campaign
            </Link>
            <button
              type="button"
              onClick={endNow}
              disabled={ending}
              className="mt-space-sm flex h-11 w-full items-center justify-center gap-2 rounded-full bg-error-container text-label-md text-on-error-container transition-transform active:scale-95 disabled:opacity-60"
            >
              {ending ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />}
              End campaign &amp; announce winners
            </button>
          </section>
        )}
        </div>
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-surface via-surface/90 to-transparent px-4 pt-6 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
        <div className="app-shell pointer-events-auto">
          {canPost ? (
            <Link
              href={`/snap?campaign=${id}`}
              className="flex h-14 w-full items-center justify-center gap-space-sm rounded-full bg-secondary-container text-headline-sm text-on-secondary shadow-lg transition-all hover:brightness-105 active:scale-[0.98]"
            >
              <Camera size={24} />
              {campaign.joined ? `Joined · post another (${remaining ?? 0} left)` : "Join & Snap"}
            </Link>
          ) : (
            <Link
              href={`/campaigns/${id}/leaderboard`}
              className="flex h-14 w-full items-center justify-center gap-space-sm rounded-full bg-gold text-headline-sm text-on-gold shadow-pop-yellow transition-all active:scale-[0.98]"
            >
              {isHost && live ? <Crown size={22} /> : live ? <Hourglass size={22} /> : <Trophy size={22} />}
              {isHost && live ? "You're hosting · Live rankings" : live ? "Joined · all snaps used" : "See winners"}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <>
      <PageHeader backHref="/campaigns" />
      <main role="status" aria-label="Loading campaign" className="flex flex-col gap-4">
        <Skeleton className="aspect-[4/5] max-h-[68dvh] w-full rounded-none rounded-b-[2rem]" />
        <div className="mx-4 flex flex-col gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md">
          <Skeleton className="h-7 w-2/3 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-4/5 rounded-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
        <Skeleton className="mx-4 h-48 rounded-3xl" />
      </main>
    </>
  );
}
