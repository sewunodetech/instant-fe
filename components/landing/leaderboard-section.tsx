import Image from "next/image";
import { Crown, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { DoodleField } from "@/components/landing/pixel-doodles";
import { CountdownTimer } from "@/components/landing/countdown-timer";
import { leaderboard } from "@/components/landing/content";

/** Podium visual order: 2nd, 1st (center, tallest), 3rd. */
const podiumOrder = [2, 1, 3];

const podiumTheme: Record<number, { card: string; badge: string; score: string }> = {
  1: { card: "bg-[#ffe000] border-[#e2c600]", badge: "bg-on-primary-fixed text-[#ffe000]", score: "text-on-primary-fixed" },
  2: { card: "bg-[#ff6b6b] border-[#e04a4a]", badge: "bg-white text-[#e04a4a]", score: "text-white" },
  3: { card: "bg-[#106df4] border-[#0056c6]", badge: "bg-white text-[#0056c6]", score: "text-white" },
};

// More recent winners for the payout table.
const recentWinners = [
  { handle: "@noah_frames", campaign: "#CityLife", payout: "+18.00 USDC" },
  { handle: "@sora_snaps", campaign: "#CampusVibes", payout: "+15.50 USDC" },
  { handle: "@lia_golden", campaign: "#SummerVibes", payout: "+12.00 USDC" },
  { handle: "@dev_candid", campaign: "#CityLife", payout: "+9.75 USDC" },
  { handle: "@mika_live", campaign: "#BestFriends", payout: "+8.20 USDC" },
];

export function LeaderboardSection() {
  const byPlace = Object.fromEntries(leaderboard.map((r) => [r.place, r]));

  return (
    <section id="winners" className="relative scroll-mt-24 overflow-hidden bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <DoodleField
        items={[
          { name: "star", className: "left-[6%] top-[22%]", size: 44, rotate: 14, duration: 6 },
          { name: "controller", className: "right-[5%] top-[16%]", size: 44, rotate: -10, duration: 7, delay: 0.5 },
          { name: "bolt", className: "left-[3%] bottom-[24%]", size: 40, rotate: 8, duration: 6.5, delay: 1 },
        ]}
        className="hidden md:block"
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeIn className="mx-auto mb-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-on-surface sm:text-5xl">
            Real creators, real payouts
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-on-surface-variant sm:text-lg">
            When a campaign ends, the most-voted snaps win the pool. Here are the creators
            who took home USDC from the latest drops.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-on-surface/10 bg-surface-container-lowest px-4 py-1.5 text-body-sm font-bold text-on-surface shadow-soft">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-tertiary/70" />
              <span className="relative inline-flex size-2 rounded-full bg-tertiary" />
            </span>
            Next drop settles in <CountdownTimer />
          </span>
        </FadeIn>

        {/* Podium */}
        <div className="mt-12 grid grid-cols-3 items-end gap-3 sm:gap-5">
          {podiumOrder.map((place) => {
            const r = byPlace[place];
            if (!r) return null;
            const theme = podiumTheme[place];
            const isFirst = place === 1;
            return (
              <FadeIn
                key={place}
                delay={place === 1 ? 0 : 0.12}
                className={cn("flex flex-col items-center", isFirst && "-mt-6")}
              >
                <div
                  className={cn(
                    "relative w-full rounded-3xl border-2 p-4 text-center shadow-card",
                    theme.card,
                  )}
                >
                  {isFirst && (
                    <Crown
                      className="absolute -top-8 left-1/2 size-8 -translate-x-1/2 text-[#e2c600] drop-shadow"
                      fill="#ffe000"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold",
                      theme.badge,
                    )}
                  >
                    TOP {place}
                  </span>
                  <div className="mx-auto mt-3 size-14 overflow-hidden rounded-2xl border-2 border-white/60 sm:size-16">
                    <Image src={r.avatar} alt="" width={64} height={64} className="size-full object-cover" />
                  </div>
                  <p className={cn("mt-2 flex items-center justify-center gap-1 text-sm font-extrabold", theme.score)}>
                    <Flame className="size-3.5" strokeWidth={2.6} aria-hidden />
                    {r.meta.split("·")[1]?.trim() ?? r.meta}
                  </p>
                  <p className={cn("truncate text-[11px] font-bold opacity-90", theme.score)}>{r.handle}</p>
                  <p className={cn("mt-1 rounded-xl bg-white/25 py-1 text-sm font-extrabold", theme.score)}>{r.amount}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Recent winners table */}
        <FadeIn delay={0.1} className="mt-8 overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest shadow-soft">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-black/5 px-5 py-3 text-[11px] font-extrabold tracking-wider text-on-surface-variant/60 uppercase">
            <span>Winner</span>
            <span>Payout</span>
          </div>
          <Stagger>
            {recentWinners.map((row) => (
              <StaggerItem key={row.handle}>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-black/5 px-5 py-3 transition-colors last:border-0 hover:bg-surface-container-low">
                  <div className="min-w-0">
                    <p className="truncate text-body-sm font-extrabold text-on-surface">{row.handle}</p>
                    <span className="text-[11px] font-medium text-on-surface-variant">
                      Won {row.campaign}
                    </span>
                  </div>
                  <span className="rounded-full bg-tertiary-container/50 px-3 py-1 font-extrabold tabular-nums text-tertiary">
                    {row.payout}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      </div>
    </section>
  );
}
