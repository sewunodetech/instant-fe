import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { compactNumber } from "@/lib/format";
import { activeCampaigns } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Welcome · instant.fun" };

const features = [
  { icon: "bolt", label: "Instant Camera", className: "text-secondary-container" },
  { icon: "favorite", label: "Community Votes", className: "text-error", filled: true },
  { icon: "emoji_events", label: "USDC Rewards", className: "text-tertiary", filled: true },
];

export default function OnboardingPage() {
  const live = activeCampaigns[0];

  return (
    <>
      <header className="flex h-16 items-center px-space-md pt-safe">
        <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
      </header>

      <main className="flex flex-1 flex-col px-space-md pb-8">
        <div className="mt-2 flex flex-col items-center px-space-xs text-center">
          <div className="relative mb-space-sm inline-flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/40 text-primary">
              <Icon name="auto_awesome" filled className="text-[24px]" />
            </div>
            <svg aria-hidden className="absolute -top-3 -right-3 h-6 w-6 rotate-12 text-primary-fixed drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
            </svg>
          </div>
          <h1 className="max-w-[340px] text-headline-xl-mobile leading-tight">
            Turn Your Moments Into{" "}
            <span className="relative mt-1 inline-block">
              <span className="relative z-10 inline-block -rotate-1 rounded-2xl bg-primary-container px-3 py-0.5 font-extrabold text-on-primary-container shadow-sm">
                Rewards
              </span>
              <svg aria-hidden className="absolute -bottom-2 left-0 h-3 w-full text-secondary-container opacity-80" fill="none" preserveAspectRatio="none" viewBox="0 0 100 12">
                <path d="M2 8.5C30 2 70 2 98 9.5" stroke="currentColor" strokeLinecap="round" strokeWidth="3.5" />
              </svg>
            </span>
          </h1>
          <p className="mt-space-sm max-w-[290px] leading-relaxed text-on-surface-variant">
            Join campaigns, create content, get voted, and win together!
          </p>
        </div>

        {/* Decorative sample snap */}
        <div aria-hidden className="relative my-space-lg flex w-full items-center justify-center select-none">
          <div className="absolute -top-3 left-4 z-20 flex -rotate-6 animate-pulse items-center gap-1 rounded-full bg-surface-container-lowest px-3 py-1.5 shadow-[0_4px_20px_rgba(17,17,17,0.08)]">
            <Icon name="bolt" className="text-[18px] text-secondary" />
            <span className="text-label-sm">Trending Snap</span>
          </div>
          <div className="absolute -top-4 right-5 z-20 flex rotate-12 items-center gap-1 rounded-full bg-tertiary-container px-3 py-1.5 text-label-md text-on-tertiary-container shadow-md">
            <Icon name="monetization_on" filled className="text-[16px]" />
            +50 USDC
          </div>

          <div className="relative w-full max-w-[330px]">
            <div className="absolute inset-0 scale-[0.97] -rotate-3 rounded-3xl bg-secondary-fixed/50" />
            <div className="relative rotate-1 rounded-3xl bg-surface-container-lowest p-3 pb-5 shadow-card transition-transform duration-300 hover:rotate-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-surface-container">
                <Image src="/mock/onboarding-hero.jpg" alt="" fill priority sizes="306px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-label-sm text-white backdrop-blur-md">
                    <Icon name="location_on" filled className="text-[15px] text-primary-container" />
                    Salt &amp; Sea Cafe
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-label-sm text-white backdrop-blur-md">
                    <Icon name="favorite" filled className="text-[15px] text-error" />
                    1.8k
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container text-label-sm text-on-secondary">
                    SC
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-label-md leading-none">Summer Chill &apos;25</span>
                    <span className="text-body-sm leading-tight text-on-surface-variant">By @beachcrew</span>
                  </div>
                </div>
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm">Rank #1</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -left-2 z-20 flex -rotate-12 items-center gap-1 rounded-2xl bg-surface-container-lowest px-2.5 py-1.5 shadow-sm">
              <span className="text-base leading-none">✨</span>
              <span className="text-label-sm">Voted by 840+</span>
            </div>
            <div className="absolute right-4 -bottom-2 z-20 rotate-6 rounded-full bg-primary-container p-2 text-on-primary-container shadow-md">
              <Icon name="sentiment_very_satisfied" filled className="block text-[20px]" />
            </div>
          </div>
        </div>

        <ul className="no-scrollbar -mx-space-md my-space-sm flex items-center gap-2 overflow-x-auto px-space-md">
          {features.map((f) => (
            <li key={f.label} className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-2 shadow-sm">
              <Icon name={f.icon} filled={f.filled} className={`text-[18px] ${f.className}`} />
              <span className="text-label-sm">{f.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-space-md flex flex-col gap-space-sm px-space-xs">
          <Link
            href="/"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-container shadow-card transition-all hover:bg-primary-fixed active:scale-[0.98]"
          >
            Get Started
            <Icon name="arrow_forward" className="text-[20px]" />
          </Link>
          <p className="flex items-center justify-center gap-1.5 py-1">
            <span className="text-on-surface-variant">Already have an account?</span>
            <Link href="/" className="text-label-md text-secondary hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {live && (
          <Link
            href={`/campaigns/${live.id}`}
            className="mt-space-lg block rounded-3xl bg-surface-container-lowest p-space-md shadow-[0_4px_20px_rgba(17,17,17,0.04)] transition-shadow hover:shadow-card"
          >
            <div className="mb-space-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
                </span>
                <span className="text-label-md">Live Campaign Snapshot</span>
              </span>
              <span className="text-label-sm text-secondary-container">View Campaign</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <Icon name="local_cafe" className="text-[24px]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-label-lg">{live.tag}</span>
                <span className="truncate text-body-sm text-on-surface-variant">
                  Pool ends in {live.daysLeft}d • ${live.poolUsdc} Prize Pot
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-label-md text-tertiary">Active</span>
                <span className="text-body-sm text-on-surface-variant">{compactNumber(live.creators)} Creators</span>
              </div>
            </div>
          </Link>
        )}
      </main>
    </>
  );
}
