import { Icon } from "@/components/icon";
import { CampaignStories } from "@/components/home/campaign-stories";
import { FeedFilters } from "@/components/home/feed-filters";
import { JoinSnapBanner } from "@/components/home/join-snap-banner";
import { SnapCard } from "@/components/home/snap-card";
import { StreakBanner } from "@/components/home/streak-banner";
import { activeCampaigns, currentUser, feedSnaps } from "@/lib/mock-data";

export default function HomePage() {
  const [first, ...rest] = feedSnaps;

  return (
    <>
      <CampaignStories campaigns={activeCampaigns} />

      <div className="mt-space-xs flex flex-col gap-space-md px-margin">
        <StreakBanner
          days={currentUser.streakDays}
          bonusPct={currentUser.streakBonusPct}
          power={currentUser.votePower}
        />
        <FeedFilters />

        {first && <SnapCard snap={first} priority />}
        <JoinSnapBanner title="Got a Summer moment?" poolUsdc={250} />
        {rest.map((snap) => (
          <SnapCard key={snap.id} snap={snap} />
        ))}

        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
            <Icon name="auto_awesome" className="text-[20px]" />
          </div>
          <p className="text-headline-sm">You&apos;re completely caught up!</p>
          <p className="max-w-[260px] text-body-sm text-on-surface-variant">
            New snaps arrive spontaneously as creator countdown timers trigger.
          </p>
        </div>
      </div>
    </>
  );
}
