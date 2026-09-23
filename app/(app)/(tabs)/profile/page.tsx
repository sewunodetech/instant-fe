"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { BackButton } from "@/components/layout/back-button";
import { compactNumber } from "@/lib/format";
import { currentUser, profileSnaps, profileStats } from "@/lib/mock-data";

const tabs = [
  { id: "snaps", label: "Snaps", icon: "photo_camera" },
  { id: "saved", label: "Saved", icon: "bookmark" },
  { id: "about", label: "About", icon: "info" },
] as const;

export default function ProfilePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("snaps");
  const [following, setFollowing] = useState(false);

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <div className="flex items-center justify-between pt-3">
        <BackButton fallbackHref="/home" />
        <div className="flex items-center gap-1">
          <Link
            href="/wallet"
            aria-label="Wallet"
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="account_balance_wallet" className="text-[22px]" />
          </Link>
          <Link
            href="/activity"
            aria-label="Activity"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="notifications" className="text-[22px]" />
            {currentUser.hasUnread && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
            )}
          </Link>
          <Link
            href="/create"
            aria-label="Create campaign"
            className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="add_circle_outline" className="text-[22px]" />
          </Link>
        </div>
      </div>

      <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
        <div className="flex items-start gap-space-md">
          <div className="relative">
            <div className="h-22 w-22 overflow-hidden rounded-full bg-surface-container ring-3 ring-primary-container">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={96}
                height={96}
                priority
                className="h-full w-full object-cover"
              />
            </div>
            <span className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white ring-2 ring-surface">
              <Icon name="verified" filled className="text-[14px]" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate text-headline-sm tracking-tight">{currentUser.name}</h1>
                <p className="truncate text-body-sm text-on-surface-variant">@{currentUser.handle}</p>
              </div>
              <button
                type="button"
                onClick={() => setFollowing((f) => !f)}
                className={`h-9 shrink-0 rounded-full px-4 text-label-sm transition-transform active:scale-95 ${
                  following
                    ? "bg-surface-container text-on-surface-variant"
                    : "bg-secondary-container text-white shadow-sm"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-label-sm text-on-surface-variant">
                <Icon name="public" className="text-[13px] text-secondary" />
                Base
              </span>
              <span className="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-label-sm text-on-surface-variant">
                <Icon name="account_balance_wallet" className="text-[13px] text-secondary" />
                {currentUser.wallet.address}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-primary-container/40 px-2.5 py-1 text-label-sm text-on-primary-container">
                <Icon name="local_fire_department" filled className="text-[13px] text-primary" />
                {currentUser.streakDays}d streak
              </span>
            </div>
          </div>
        </div>

        <dl className="mt-space-md grid grid-cols-4 gap-space-xs">
          {[
            { label: "Snaps", value: String(profileStats.snaps) },
            { label: "Followers", value: profileStats.followers },
            { label: "Following", value: String(profileStats.following) },
            { label: "Earned", value: `${profileStats.totalEarnedUsdc}` },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl bg-surface-container-low p-2">
              <dd className="text-label-lg font-extrabold tabular-nums">{s.value}</dd>
              <dt className="mt-0.5 text-[10px] text-on-surface-variant">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-space-sm grid grid-cols-3 gap-space-xs">
          <Link
            href="/rewards"
            className="flex items-center justify-center gap-1 rounded-full bg-primary-container py-2 text-label-sm text-on-primary-fixed"
          >
            <Icon name="emoji_events" className="text-[14px]" />
            Rewards
          </Link>
          <Link
            href="/wallet"
            className="flex items-center justify-center gap-1 rounded-full bg-secondary-fixed py-2 text-label-sm text-on-secondary-fixed"
          >
            <Icon name="account_balance_wallet" className="text-[14px]" />
            Wallet
          </Link>
          <Link
            href="/create"
            className="flex items-center justify-center gap-1 rounded-full bg-surface-container py-2 text-label-sm text-on-surface"
          >
            <Icon name="add" className="text-[14px]" />
            Campaign
          </Link>
        </div>
      </section>

      <div role="tablist" className="flex items-center gap-space-xs rounded-full bg-surface-container-low p-1">
        {tabs.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-label-md transition-all ${
                active
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon name={t.icon} filled={active} className="text-[16px]" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "snaps" && (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
          {profileSnaps.map((snap) => (
            <Link
              key={snap.id}
              href={["snap-1", "snap-2"].includes(snap.id) ? `/snaps/${snap.id}` : `/campaigns/${snap.campaignId}`}
              className="group relative aspect-square overflow-hidden rounded-xl bg-surface-container"
            >
              <Image
                src={snap.image}
                alt={snap.imageAlt}
                fill
                sizes="(max-width: 767px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4 text-[10px] font-bold text-white">
                <span className="flex items-center gap-0.5">
                  <Icon name="how_to_vote" className="text-[11px]" />
                  {compactNumber(snap.votes)}
                </span>
                <span>#{snap.rank}</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-surface-container-lowest p-8 text-center shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
            <Icon name="bookmark" className="text-[24px] text-on-surface-variant" />
          </div>
          <p className="text-headline-sm">No saved snaps yet</p>
          <p className="max-w-[240px] text-body-sm text-on-surface-variant">
            Tap the bookmark on any snap to keep it here.
          </p>
          <Link
            href="/home"
            className="mt-1 rounded-full bg-secondary px-5 py-2 text-label-md text-white shadow-sm"
          >
            Browse feed
          </Link>
        </div>
      )}

      {tab === "about" && (
        <section className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
              <Icon name="auto_awesome" className="text-[20px] text-on-primary-fixed" />
            </div>
            <div>
              <h2 className="text-label-lg">Creator bio</h2>
              <p className="mt-0.5 text-body-sm text-on-surface-variant">
                Chasing golden sunsets, tide pools, and iced matchas. Join my drops on instant.fun.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-space-xs pt-1">
            {[
              { label: "Win rate", value: profileStats.winRate, icon: "workspace_premium" },
              { label: "Best rank", value: `#${profileStats.bestRank}`, icon: "leaderboard" },
              { label: "Earned", value: `${profileStats.totalEarnedUsdc} USDC`, icon: "payments" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 rounded-2xl bg-surface-container-low p-2.5 text-center">
                <Icon name={s.icon} className="text-[18px] text-secondary" />
                <span className="text-label-sm font-bold tabular-nums">{s.value}</span>
                <span className="text-[10px] text-on-surface-variant">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
