"use client";

import Link from "next/link";
import { Camera, Sparkles, Trophy } from "lucide-react";
import { ChampionCard } from "@/components/leaderboard/champion-card";
import { PodiumCard } from "@/components/leaderboard/podium-card";
import { RankingTabs } from "@/components/leaderboard/ranking-tabs";
import { ResultsHero } from "@/components/leaderboard/results-hero";
import { BackButton } from "@/components/layout/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { getLeaderboard } from "@/lib/api-client";
import { ordinal, usdc } from "@/lib/format";
import { useApi } from "@/lib/use-api";

export function LeaderboardView({ id }: { id: string }) {
  const board = useApi(() => getLeaderboard(id), [id]);

  if (board.loading && !board.data) {
    return (
      <div role="status" aria-label="Loading leaderboard" className="flex flex-col gap-space-md px-space-md pt-3 pb-4 sm:px-0">
        <Skeleton className="h-12 w-2/3 rounded-full" />
        <Skeleton className="h-52 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-space-sm">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    );
  }
  if (!board.data) {
    return (
      <div className="flex flex-col gap-space-md px-space-md pt-3 sm:px-0">
        <BackButton fallbackHref="/campaigns" />
        <ErrorState message={board.error ?? "Campaign not found"} onRetry={board.reload} />
      </div>
    );
  }

  const { campaign, entries, topVoters, myEntry } = board.data;
  const ended = campaign.status === "ENDED";
  const [champion, second, third, ...rest] = entries;

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <ResultsHero campaign={campaign} hasWinner={Boolean(champion)} />

      {myEntry && (
        <Link
          href={`/snaps/${myEntry.post.id}`}
          className={`flex items-center gap-3 rounded-3xl p-space-md shadow-soft ${
            myEntry.rank <= 3 ? "bg-primary-container text-on-primary-container" : "bg-secondary-fixed text-on-secondary-fixed"
          }`}
        >
          {myEntry.rank <= 3 ? <Trophy size={28} /> : <Sparkles size={28} />}
          <div className="min-w-0 flex-1">
            <p className="text-label-lg font-extrabold">
              {ended
                ? myEntry.rank <= 3
                  ? `You won ${ordinal(myEntry.rank)} place!`
                  : `You finished ${ordinal(myEntry.rank)}`
                : `You're ${ordinal(myEntry.rank)} right now`}
            </p>
            <p className="text-body-sm opacity-80">
              {myEntry.prize > 0
                ? `${ended ? "Prize" : "On track for"}: ${usdc(myEntry.prize)} USDC`
                : ended
                  ? "Thanks for playing — join the next one!"
                  : "Share your snap to climb into the top 3."}
            </p>
          </div>
        </Link>
      )}

      {champion ? (
        <>
          <ChampionCard entry={champion} ended={ended} />
          {(second || third) && (
            <div className="grid w-full grid-cols-2 gap-space-sm">
              {second && <PodiumCard entry={second} />}
              {third && <PodiumCard entry={third} />}
            </div>
          )}
          <RankingTabs entries={rest} voters={topVoters} />
        </>
      ) : (
        <EmptyState
          icon={<Camera size={24} />}
          title="No snaps yet"
          body={ended ? "This campaign ended without entries." : "Post the first snap and take the lead."}
          action={ended ? { label: "Explore campaigns", href: "/campaigns" } : { label: "Post a snap", href: `/snap?campaign=${id}` }}
        />
      )}

      {ended && champion && campaign.prizePool > 0 && (
        <p className="rounded-2xl bg-surface-container px-3 py-2 text-center text-body-sm text-on-surface-variant">
          Prizes are sent by the host to each winner&apos;s wallet.
        </p>
      )}

      {ended ? (
        <Link
          href="/campaigns"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-secondary text-label-lg font-extrabold text-on-secondary shadow-md transition-transform active:scale-[0.98]"
        >
          Find the next challenge
        </Link>
      ) : (
        <Link
          href={`/campaigns/${id}`}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-label-lg font-extrabold text-on-secondary shadow-md transition-transform active:scale-[0.98]"
        >
          Back to campaign
        </Link>
      )}
    </div>
  );
}
