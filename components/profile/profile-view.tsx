"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, Compass, Megaphone, Trophy, Vote, Wallet } from "lucide-react";
import { Avatar } from "@/components/auth/user-avatar";
import { CampaignRowCard } from "@/components/discovery/campaign-cards";
import { RemoteImage } from "@/components/ui/remote-image";
import { CampaignCardSkeleton, GridSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { listUserCampaigns, listUserPosts } from "@/lib/api-client";
import { compactNumber, handleOf, nameOf, shortAddress, usdc } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { PublicProfile } from "@/lib/types";

const tabs = [
  { id: "snaps", label: "Snaps", icon: Camera },
  { id: "joined", label: "Joined", icon: Compass },
  { id: "hosted", label: "Hosted", icon: Megaphone },
] as const;
type TabId = (typeof tabs)[number]["id"];

export function ProfileView({
  profile,
  isMe,
  actions,
}: {
  profile: PublicProfile;
  isMe: boolean;
  actions?: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("snaps");
  const key = profile.id;
  const posts = useApi(() => listUserPosts(key, 1, 60), [key]);
  const campaigns = useApi(
    tab === "snaps" ? null : () => listUserCampaigns(key, tab === "hosted" ? "hosted" : "joined").then((r) => r.data),
    [key, tab]
  );

  const stats = [
    { label: "Snaps", value: compactNumber(profile.stats.snaps) },
    { label: "Votes", value: compactNumber(profile.stats.votesReceived) },
    { label: "Wins", value: compactNumber(profile.stats.wins) },
    { label: "Tips", value: usdc(profile.stats.supportReceived) },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-2">
      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div className="flex items-start gap-space-md">
          <Avatar user={profile} size={80} className="ring-3 ring-secondary-container" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-headline-sm font-extrabold tracking-tight">{nameOf(profile)}</h1>
            <p className="truncate text-body-sm text-on-surface-variant">@{handleOf(profile)}</p>
            {profile.walletAddress && (
              <p className="mt-1 flex items-center gap-1 text-label-sm text-on-surface-variant">
                <Wallet size={13} className="text-secondary" />
                {shortAddress(profile.walletAddress)}
              </p>
            )}
          </div>
        </div>
        {profile.bio && <p className="mt-space-sm text-body-sm whitespace-pre-line">{profile.bio}</p>}

        <dl className="mt-space-md grid grid-cols-4 gap-space-xs">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl bg-surface-container-low p-2">
              <dd className="text-label-lg font-extrabold tabular-nums">{s.value}</dd>
              <dt className="mt-0.5 text-[10px] text-on-surface-variant">{s.label}</dt>
            </div>
          ))}
        </dl>

        {actions && <div className="mt-space-sm">{actions}</div>}
      </section>

      <div role="tablist" className="flex items-center gap-space-xs rounded-full bg-surface-container-low p-1">
        {tabs.map((t) => {
          const active = t.id === tab;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-label-md transition-all ${
                active ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "snaps" ? (
        posts.loading ? (
          <GridSkeleton count={9} />
        ) : posts.error ? (
          <ErrorState message={posts.error} onRetry={posts.reload} />
        ) : !posts.data?.data.length ? (
          <EmptyState
            icon={<Camera size={24} />}
            title="No snaps yet"
            body={isMe ? "Join a campaign and post your first snap." : "This creator hasn't posted yet."}
            action={isMe ? { label: "Post a snap", href: "/snap" } : undefined}
          />
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {posts.data.data.map((post) => (
              <Link
                key={post.id}
                href={`/snaps/${post.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container"
              >
                <RemoteImage
                  src={post.imageUrl}
                  alt={post.caption || "Snap"}
                  fill
                  sizes="(max-width: 767px) 33vw, 200px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                {post.campaign.status === "ENDED" && post.rank && post.rank <= 3 && (
                  <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-primary-container px-1.5 text-[10px] font-bold text-on-primary-container">
                    <Trophy size={10} />
                    {post.rank}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4 text-[10px] font-bold text-white">
                  <span className="flex items-center gap-0.5">
                    <Vote size={11} />
                    {compactNumber(post.voteCount)}
                  </span>
                  {post.rank && <span>#{post.rank}</span>}
                </span>
              </Link>
            ))}
          </div>
        )
      ) : campaigns.loading ? (
        <div className="flex flex-col gap-space-sm">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      ) : campaigns.error ? (
        <ErrorState message={campaigns.error} onRetry={campaigns.reload} />
      ) : !campaigns.data?.length ? (
        <EmptyState
          icon={tab === "hosted" ? <Megaphone size={24} /> : <Compass size={24} />}
          title={tab === "hosted" ? "No campaigns hosted" : "No campaigns joined"}
          action={
            isMe
              ? tab === "hosted"
                ? { label: "Create campaign", href: "/create" }
                : { label: "Explore", href: "/campaigns" }
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-space-sm">
          {campaigns.data.map((c) => (
            <CampaignRowCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="flex flex-col gap-4 px-4 pt-2">
      <div className="flex flex-col gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md">
        <div className="flex items-center gap-space-md">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-2/3 rounded-full" />
            <Skeleton className="h-4 w-1/3 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-full" />
      <GridSkeleton count={9} />
    </div>
  );
}
