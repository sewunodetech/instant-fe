import Image from "next/image";
import { CountdownTimer } from "@/components/landing/countdown-timer";

type Rank = {
  place: string;
  placeClass: string;
  avatar: string;
  handle: string;
  meta: string;
  amount: string;
};

const ranks: Rank[] = [
  {
    place: "1",
    placeClass: "bg-primary-container text-on-primary-fixed",
    avatar: "/mock/leaderboard/avatar-1.jpg",
    handle: "@maya_beachlife",
    meta: "#SummerVibes • 342 votes",
    amount: "+80.00 USDC",
  },
  {
    place: "2",
    placeClass: "bg-slate-200 text-slate-700",
    avatar: "/mock/leaderboard/avatar-2.jpg",
    handle: "@elena_glow",
    meta: "#BestFriends • 298 votes",
    amount: "+45.00 USDC",
  },
  {
    place: "3",
    placeClass: "bg-amber-100 text-amber-800",
    avatar: "/mock/leaderboard/avatar-3.jpg",
    handle: "@kiran_vibe",
    meta: "#CityLife • 215 votes",
    amount: "+25.00 USDC",
  },
];

export function FairRewardsSection() {
  return (
    <section id="rewards" className="border-b border-slate-200/60 bg-surface-container-lowest py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-item mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-emerald-800 uppercase shadow-soft">
            On-Chain Transparency
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Fair Rewards &amp; Real Economic Upside</h2>
          <p className="mt-3 text-base font-medium text-slate-600 sm:text-lg">
            Every vote and payout is executed gasless and verified on BNB Smart Chain.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Grand champion card */}
          <div className="reveal-item interactive-card group relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-surface-container-lowest p-8 text-center shadow-card transition-all hover:shadow-card-hover lg:col-span-5">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl transition-transform duration-700 group-hover:scale-125" />
            <div className="relative z-10 space-y-4">
              <div className="relative mx-auto flex h-32 w-32 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Image src="/mock/trophy-champion.jpg" alt="Grand champion trophy" width={128} height={128} className="h-full w-full object-contain drop-shadow-md" />
              </div>
              <div className="inline-block rounded-full bg-primary-container px-3 py-1 text-xs font-extrabold tracking-wider text-on-primary-fixed uppercase">
                1st Place Winner
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">Grand Champion Settlement</h3>
              <div className="text-4xl font-black tracking-tight text-slate-900">
                +80.00 <span className="text-2xl font-bold text-secondary">USDC</span>
              </div>
              <p className="mx-auto max-w-xs text-xs font-medium text-slate-600">
                Automatically transferred to creator wallet on BNB Chain with $0.00 in gas fees.
              </p>
              <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left text-xs font-semibold text-slate-700 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Network:</span>
                  <span className="flex items-center gap-1 font-extrabold text-[#B8860B]">🟡 BNB Chain</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-900">0x4a9...8e21</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Gas Fee:</span>
                  <span className="font-extrabold text-emerald-600">0.00 (Sponsored)</span>
                </div>
              </div>
              <button className="badge-shimmer w-full rounded-full bg-secondary-container py-3 text-xs font-extrabold text-white shadow-soft transition-all hover:bg-secondary active:scale-95">
                View Verified Smart Contract
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-7">
            <div className="reveal-item space-y-4 rounded-3xl border border-slate-200/80 bg-surface p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-ping rounded-full bg-emerald-500" />
                  <h4 className="text-base font-extrabold text-slate-900">The 60% / 40% Transparent Split</h4>
                </div>
                <span className="rounded-full bg-secondary-fixed px-2.5 py-1 text-[11px] font-bold text-on-secondary-fixed">
                  Active Vault: $24,500 USDC
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="interactive-card space-y-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Podium Creators</span>
                    <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-extrabold text-on-primary-fixed">60% Vault</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">$14,700 USDC</div>
                  <p className="text-[11px] text-slate-500">Distributed to Top 3 daily ranked snapshots</p>
                </div>
                <div className="interactive-card space-y-1 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Voter Community</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">40% Vault</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">$9,800 USDC</div>
                  <p className="text-[11px] text-slate-500">Pro-rata payout to members who backed the winners</p>
                </div>
              </div>
            </div>

            <div className="reveal-item space-y-3 rounded-3xl border border-slate-200/80 bg-surface p-6 shadow-soft">
              <h4 className="flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Today&apos;s Live Leaderboard</span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  Ends in <CountdownTimer />
                </span>
              </h4>
              <div className="space-y-2">
                {ranks.map((r) => (
                  <div key={r.place} className="interactive-card flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${r.placeClass}`}>{r.place}</span>
                      <Image src={r.avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full border border-slate-200 object-cover" />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">{r.handle}</p>
                        <span className="text-[10px] font-semibold text-slate-500">{r.meta}</span>
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-600">{r.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
