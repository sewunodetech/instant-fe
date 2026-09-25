"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { CampaignStories } from "@/components/home/campaign-stories";
import { FeedFilters } from "@/components/home/feed-filters";
import { JoinSnapBanner } from "@/components/home/join-snap-banner";
import { StreakBanner } from "@/components/home/streak-banner";
import { fetchFeedSnaps, FeedGrid } from "@/components/home/live-feed";
import { listCampaigns } from "@/lib/api-client";
import { mapApiCampaign } from "@/lib/mappers";
import { activeCampaigns, currentUser, feedSnaps, type Campaign, type Snap } from "@/lib/mock-data";

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(activeCampaigns);
  const [snaps, setSnaps] = useState<Snap[]>(feedSnaps);

  useEffect(() => {
    let cancelled = false;

    listCampaigns({ status: "ACTIVE", limit: 12 })
      .then(({ data }) => {
        if (!cancelled && data.length > 0) {
          setCampaigns(data.map((c, i) => mapApiCampaign(c, i)));
        }
      })
      .catch(() => {
        // keep mock campaigns
      });

    fetchFeedSnaps()
      .then((data) => {
        if (!cancelled) setSnaps(data);
      })
      .catch(() => {
        // keep mock snaps
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <CampaignStories campaigns={campaigns} />

      <div className="mt-space-xs flex flex-col gap-space-md px-margin sm:px-0">
        <StreakBanner
          days={currentUser.streakDays}
          bonusPct={currentUser.streakBonusPct}
          power={currentUser.votePower}
        />
        <FeedFilters />

        <FeedGrid snaps={snaps} />

        <JoinSnapBanner title="Got a Summer moment?" poolUsdc={250} />

        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary shadow-sm">
            <Sparkles size={20} />
          </div>
          <p className="text-headline-sm font-extrabold tracking-tight">You&apos;re completely caught up!</p>
          <p className="max-w-[260px] text-body-sm text-on-surface-variant">
            New snaps arrive spontaneously as creator countdown timers trigger.
          </p>
        </div>
      </div>
    </>
  );
}
