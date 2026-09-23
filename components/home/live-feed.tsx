"use client";

import { useEffect, useState } from "react";
import { SnapCard } from "@/components/home/snap-card";
import { listCampaigns, listCampaignPosts, votePost, backPost, ApiClientError } from "@/lib/api-client";
import { mapApiCampaign, mapApiPost } from "@/lib/mappers";
import { feedSnaps, type Snap } from "@/lib/mock-data";

async function fetchFeedSnaps(limitCampaigns = 4): Promise<Snap[]> {
  try {
    const { data: campaigns } = await listCampaigns({ status: "ACTIVE", limit: limitCampaigns });
    const batches = await Promise.all(
      campaigns.map(async (c) => {
        const mapped = mapApiCampaign(c, 0);
        const { data: posts } = await listCampaignPosts(c.id, 1, 8);
        return posts.map((p, i) => {
          const snap = mapApiPost({ ...p, campaign: { id: c.id, title: c.title, status: c.status } }, i);
          snap.campaign = {
            tag: mapped.tag,
            poolUsdc: mapped.poolUsdc,
            icon: mapped.kind === "Sponsored" ? "campaign" : "stars",
          };
          return snap;
        });
      })
    );
    const combined = batches.flat();
    return combined.length > 0 ? combined : feedSnaps;
  } catch {
    return feedSnaps;
  }
}

function ApiAwareSnapCard({ snap, priority }: { snap: Snap; priority?: boolean }) {
  const [votes, setVotes] = useState(snap.votes);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVotes(snap.votes);
  }, [snap.votes]);

  const isMock = snap.id.startsWith("snap-");

  async function handleVote() {
    if (busy || isMock) return;
    setBusy(true);
    try {
      await votePost(snap.id);
      setVotes((v) => v + 1);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 409) {
        // already voted
      } else {
        throw err;
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleSupport(amount: number) {
    if (isMock) return;
    await backPost(snap.id, amount);
    setVotes((v) => v + 1);
  }

  return (
    <div className="[&>article]:h-full">
      <SnapCard
        snap={{ ...snap, votes }}
        priority={priority}
        onVote={handleVote}
        onSupport={handleSupport}
        busy={busy}
      />
    </div>
  );
}

function FeedGrid({ snaps }: { snaps: Snap[] }) {
  const [first, ...rest] = snaps;

  if (!first) {
    return (
      <p className="rounded-3xl bg-surface-container-lowest p-6 text-center text-body-md text-on-surface-variant shadow-card">
        No snaps yet. Be the first to post!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
      <div className="md:col-span-2 xl:col-span-1">
        <ApiAwareSnapCard snap={first} priority />
      </div>
      <div className="md:col-span-2 xl:col-span-3" />
      {rest.map((snap) => (
        <ApiAwareSnapCard key={snap.id} snap={snap} />
      ))}
    </div>
  );
}

export { FeedGrid, fetchFeedSnaps };
