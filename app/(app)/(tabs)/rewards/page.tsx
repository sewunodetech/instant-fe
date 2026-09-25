import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, X } from "lucide-react";
import { LucideIcon } from "@/components/lucide-icon";
import { RewardConfetti } from "@/components/rewards/celebrate-button";
import { ClaimPanel } from "@/components/rewards/claim-panel";
import { currentUser, getCampaign, pendingReward, type RewardLine } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Rewards · instant.fun" };

const toneClass: Record<RewardLine["tone"], string> = {
  primary: "bg-primary-container/40 text-on-primary-container",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  neutral: "bg-surface-container text-on-surface-variant",
};

function ordinal(n: number) {
  const suffix = new Intl.PluralRules("en", { type: "ordinal" }).select(n);
  return `${n}${{ one: "st", two: "nd", few: "rd" }[suffix as string] ?? "th"}`;
}
const usd = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RewardsPage() {
  const campaign = getCampaign(pendingReward.campaignId);
  if (!campaign) notFound();

  const total = pendingReward.lines.reduce((sum, l) => sum + l.amountUsdc, 0);

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <div className="flex items-center justify-between pt-space-xs">
        <Link
          href="/home"
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-transform hover:bg-surface-container-high active:scale-95"
        >
          <X size={20} />
        </Link>
        <span className="flex items-center gap-1.5 rounded-full bg-tertiary-container px-3 py-1 text-label-sm text-on-tertiary-container">
          <BadgeCheck size={16} fill="currentColor" />
          Audited &amp; Verified
        </span>
        <span className="h-10 w-10" aria-hidden />
      </div>

      <div className="text-center">
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3.5 py-1 text-label-sm text-on-primary-container shadow-sm">
          <Award size={15} fill="currentColor" />
          CAMPAIGN VICTOR
        </span>
        <h1 className="text-headline-lg-mobile font-extrabold tracking-tight">Congratulations, {currentUser.name}!</h1>
        <p className="mt-0.5 text-on-surface-variant">
          Your snap took <span className="font-bold text-primary">{ordinal(pendingReward.place)} Place</span> in{" "}
          <Link href={`/campaigns/${campaign.id}/leaderboard`} className="hover:underline">
            {campaign.tag}
          </Link>
        </p>
      </div>

      <section className="relative overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft ring-4 ring-primary-container/20">
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary-container/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-secondary-fixed/30 blur-2xl" />
        <RewardConfetti />
        <div className="relative flex flex-col items-center text-center">
          <div className="relative my-1 flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-2 animate-pulse rounded-full bg-primary-container/20" />
            <Image
              src="/mock/reward-coin.jpg"
              alt=""
              width={512}
              height={279}
              priority
              className="relative z-10 w-full rounded-sm object-contain drop-shadow-md"
            />
          </div>
          <span className="mb-1 text-label-md tracking-wider text-on-surface-variant uppercase">Claimable Reward</span>
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-headline-xl-mobile font-black tabular-nums">{usd(total)}</span>
            <span className="flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1 text-label-sm text-on-secondary-container shadow-sm">
              <span className="h-2 w-2 rounded-full bg-on-secondary-container" />
              USDC
            </span>
          </div>
          <p className="text-body-sm font-bold text-on-surface-variant">≈ ${usd(total)} USD • Instant Settlement</p>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div className="mb-space-sm flex items-center justify-between pb-space-sm">
          <h2 className="text-label-lg font-extrabold">Prize Breakdown</h2>
          <span className="text-label-sm text-secondary">BSC Testnet USDC</span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {pendingReward.lines.map((line) => (
            <li key={line.label} className="flex items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toneClass[line.tone]}`}>
                  <LucideIcon name={line.icon} size={16} />
                </div>
                <div className="flex flex-col">
                  <span>{line.label}</span>
                  {line.note && <span className="text-label-sm text-on-surface-variant">{line.note}</span>}
                </div>
              </div>
              <span
                className={`shrink-0 text-label-lg whitespace-nowrap tabular-nums ${
                  line.bonus || line.amountUsdc === 0 ? "text-tertiary" : ""
                }`}
              >
                {line.bonus && "+"}
                {usd(line.amountUsdc)} USDC
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ClaimPanel
        totalUsdc={total}
        wallet={currentUser.wallet}
        shareText={`I just won ${usd(total)} USDC in ${campaign.tag} on instant.fun!`}
      />
    </div>
  );
}
