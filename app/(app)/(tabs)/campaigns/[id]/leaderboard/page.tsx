import { notFound } from "next/navigation";
import { ChampionCard } from "@/components/leaderboard/champion-card";
import { NextChallengeBanner } from "@/components/leaderboard/next-challenge-banner";
import { PodiumCard } from "@/components/leaderboard/podium-card";
import { RankingTabs } from "@/components/leaderboard/ranking-tabs";
import { ResultsHero } from "@/components/leaderboard/results-hero";
import { activeCampaigns, getCampaign, getLeaderboard, pastCampaigns } from "@/lib/mock-data";

export function generateStaticParams() {
  return [...activeCampaigns, ...pastCampaigns].map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/campaigns/[id]/leaderboard">) {
  const campaign = getCampaign((await params).id);
  return { title: campaign ? `${campaign.tag} Leaderboard · instant.fun` : "Leaderboard · instant.fun" };
}

export default async function LeaderboardPage({ params }: PageProps<"/campaigns/[id]/leaderboard">) {
  const { id } = await params;
  const campaign = getCampaign(id);
  if (!campaign) notFound();

  const board = getLeaderboard(id);
  const [champion, second, third, ...rest] = board.creators;
  const ended = !campaign.live;

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <ResultsHero campaign={campaign} />
      <ChampionCard champion={champion} dividend={board.voterDividend} ended={ended} />
      <div className="grid w-full grid-cols-2 gap-space-sm">
        <PodiumCard creator={second} />
        <PodiumCard creator={third} />
      </div>
      <RankingTabs creators={rest} voters={board.voters} ended={ended} />
      <NextChallengeBanner />
    </div>
  );
}
