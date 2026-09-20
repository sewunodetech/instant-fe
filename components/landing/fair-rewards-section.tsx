import Image from "next/image";
import { ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { FadeIn, Parallax } from "@/components/landing/motion-primitives";
import { CountdownTimer } from "@/components/landing/countdown-timer";
import { leaderboard } from "@/components/landing/content";

const auditRows = [
  { label: "Network", value: "BNB Chain", accent: true },
  { label: "Transaction", value: "0x4a9…8e21", mono: true },
  { label: "Gas fee", value: "$0.00 sponsored", tertiary: true },
];

const placeStyles: Record<number, string> = {
  1: "bg-primary-container text-on-primary-fixed",
  2: "bg-surface-container-high text-on-surface-variant",
  3: "bg-bnb/20 text-bnb-dim",
};

export function FairRewardsSection() {
  return (
    <section id="rewards" className="scroll-mt-24 bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-body-sm font-bold tracking-wider text-tertiary uppercase">On-chain transparency</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Fair rewards, settled instantly
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-pretty text-on-surface-variant sm:text-lg">
            Every vote and payout runs gasless and verifiable on BNB Chain.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Champion card */}
          <FadeIn direction="right" className="lg:col-span-5">
           <Parallax distance={48}>
            <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-b from-bnb/10 to-surface-container-lowest p-8 text-center shadow-card">
              <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-bnb/20 blur-2xl" />
              <div className="relative">
                <div className="mx-auto flex size-28 items-center justify-center">
                  <Image src="/mock/trophy-champion.jpg" alt="Grand champion trophy" width={112} height={112} className="size-full object-contain drop-shadow-md" />
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1 text-body-sm font-extrabold tracking-wide text-on-primary-fixed uppercase">
                  <Trophy className="size-3.5" strokeWidth={2.4} aria-hidden />
                  1st place winner
                </span>
                <h3 className="mt-4 text-2xl font-extrabold tracking-tight">Grand champion settlement</h3>
                <div className="mt-1 flex items-baseline justify-center gap-1 text-4xl font-black tracking-tight tabular-nums">
                  +<NumberTicker value={80} decimalPlaces={2} className="text-on-surface" />
                  <span className="text-2xl font-bold text-secondary">USDC</span>
                </div>
                <p className="mx-auto mt-2 max-w-xs text-body-sm text-on-surface-variant">
                  Transferred straight to the creator&apos;s wallet with $0.00 in gas fees.
                </p>

                <dl className="mt-6 space-y-2 rounded-2xl border border-black/5 bg-surface-container-lowest p-4 text-left text-body-sm shadow-soft">
                  {auditRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <dt className="text-on-surface-variant">{row.label}</dt>
                      <dd
                        className={cn(
                          "font-bold",
                          row.accent && "flex items-center gap-1 text-bnb-dim",
                          row.mono && "font-mono text-on-surface",
                          row.tertiary && "text-tertiary",
                        )}
                      >
                        {row.accent && <span className="size-1.5 rounded-full bg-bnb" />}
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
           </Parallax>
          </FadeIn>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-7">
            {/* 60 / 40 split */}
            <FadeIn direction="left" className="rounded-3xl border border-black/5 bg-surface-container-lowest p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-tertiary" strokeWidth={2.2} aria-hidden />
                  <h3 className="text-lg font-extrabold tracking-tight">The 60% / 40% split</h3>
                </div>
                <span className="rounded-full bg-secondary-fixed px-3 py-1 text-[11px] font-bold text-on-secondary-fixed">
                  Active vault · $24,500
                </span>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SplitCard
                  label="Podium creators"
                  badge="60% vault"
                  badgeClass="bg-primary-container text-on-primary-fixed"
                  value={14700}
                  note="Distributed to the top 3 daily ranked snapshots"
                />
                <SplitCard
                  label="Voter community"
                  badge="40% vault"
                  badgeClass="bg-tertiary-container text-on-tertiary-container"
                  value={9800}
                  note="Pro-rata payout to members who backed the winners"
                  valueClass="text-tertiary"
                />
              </div>
            </FadeIn>

            {/* Leaderboard */}
            <FadeIn direction="left" delay={0.05} className="rounded-3xl border border-black/5 bg-surface-container-lowest p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold tracking-tight">Today&apos;s live leaderboard</h3>
                <span className="flex items-center gap-1.5 text-body-sm font-bold text-on-surface-variant">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-tertiary/70" />
                    <span className="relative inline-flex size-2 rounded-full bg-tertiary" />
                  </span>
                  Ends in <CountdownTimer />
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {leaderboard.map((rank) => (
                  <li
                    key={rank.place}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-surface p-3 transition-colors hover:bg-surface-container-low"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("flex size-7 items-center justify-center rounded-full text-xs font-black", placeStyles[rank.place])}>
                        {rank.place}
                      </span>
                      <Image src={rank.avatar} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
                      <div>
                        <p className="text-body-sm font-extrabold">{rank.handle}</p>
                        <span className="text-[11px] font-medium text-on-surface-variant">{rank.meta}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-tertiary-container/50 px-2.5 py-1 text-body-sm font-extrabold text-tertiary">
                      {rank.amount}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-medium text-on-surface-variant">
                <ShieldCheck className="size-3.5 text-tertiary" strokeWidth={2.2} aria-hidden />
                Payouts audited &amp; verifiable on BNB Chain
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

function SplitCard({
  label,
  badge,
  badgeClass,
  value,
  note,
  valueClass,
}: {
  label: string;
  badge: string;
  badgeClass: string;
  value: number;
  note: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-bold text-on-surface-variant">{label}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", badgeClass)}>{badge}</span>
      </div>
      <div className={cn("mt-1 flex items-baseline text-2xl font-black tracking-tight tabular-nums", valueClass ?? "text-on-surface")}>
        $<NumberTicker value={value} className={valueClass ?? "text-on-surface"} />
      </div>
      <p className="mt-1 text-[11px] text-on-surface-variant">{note}</p>
    </div>
  );
}
