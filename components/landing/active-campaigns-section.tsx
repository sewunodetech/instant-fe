import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";

type CampaignCard = {
  tag: string;
  image: string;
  imageAlt: string;
  dotClass: string;
  poolLabel: string;
  poolClass: string;
  location: string;
  creators: string;
  daysLeft: string;
  title: string;
  body: string;
  voterShare: string;
  ctaClass: string;
};

const campaigns: CampaignCard[] = [
  {
    tag: "#SummerVibes",
    image: "/mock/campaigns/summer-vibes.jpg",
    imageAlt: "#SummerVibes friends",
    dotClass: "bg-emerald-400 animate-pulse",
    poolLabel: "250 USDC Pool",
    poolClass: "bg-primary-container text-on-primary-fixed",
    location: "📍 Malibu Beach Cafe",
    creators: "1.2k creators",
    daysLeft: "5 Days Left",
    title: "Sunshine, Iced Drinks & Laughter",
    body: "Snap raw moments with friends outdoors enjoying the summer sun. Zero filters permitted.",
    voterShare: "~$38 USDC",
    ctaClass: "bg-primary-container hover:bg-primary-fixed text-on-primary-fixed hover:shadow-pop-yellow",
  },
  {
    tag: "#CityLife",
    image: "/mock/campaigns/city-life.jpg",
    imageAlt: "#CityLife creator",
    dotClass: "bg-secondary-container",
    poolLabel: "150 USDC Pool",
    poolClass: "bg-secondary-fixed text-on-secondary-fixed",
    location: "📍 Downtown Market",
    creators: "843 creators",
    daysLeft: "3 Days Left",
    title: "Street Corner Discoveries",
    body: "Unplanned city strolls, street food spots, and authentic candid city bustle.",
    voterShare: "~$22 USDC",
    ctaClass: "bg-surface-container-low hover:bg-slate-200 text-slate-900",
  },
  {
    tag: "#CampusVibes",
    image: "/mock/campaigns/best-friends.jpg",
    imageAlt: "#CampusVibes friends",
    dotClass: "bg-emerald-500",
    poolLabel: "300 USDC Pool",
    poolClass: "bg-primary-container text-on-primary-fixed",
    location: "📍 University Quad",
    creators: "1.4k creators",
    daysLeft: "7 Days Left",
    title: "Between Classes & Golden Hour",
    body: "Post-lecture walks and sunset laughs with your favorite study buddy.",
    voterShare: "~$45 USDC",
    ctaClass: "bg-surface-container-low hover:bg-slate-200 text-slate-900",
  },
];

export function ActiveCampaignsSection() {
  return (
    <section id="campaigns" className="border-b border-slate-200/60 bg-surface py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-item mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-3 inline-block rounded-full bg-primary-container px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-on-primary-fixed uppercase shadow-soft">
              Live Drop Vaults
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Active Campaigns &amp; Drops</h2>
            <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
              Participate in current timed challenges or vote to take a share of the community pool.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-secondary px-4 py-2 text-xs font-bold text-white shadow-soft transition-all active:scale-95">
              All Drops
            </button>
            <button className="rounded-full border border-slate-200/80 bg-surface-container-lowest px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-surface-container-low active:scale-95">
              Ending Soon ⏳
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {campaigns.map((c) => (
            <article
              key={c.tag}
              className="reveal-item interactive-card group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-surface-container-lowest p-3.5 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                  <Image src={c.image} alt={c.imageAlt} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    <span className={`h-2 w-2 rounded-full ${c.dotClass}`} />
                    <span>{c.tag}</span>
                  </div>
                  <div className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-xs font-extrabold shadow-sm ${c.poolClass}`}>{c.poolLabel}</div>
                  <div className="absolute bottom-2.5 left-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">{c.location}</div>
                </div>
                <div className="space-y-1 px-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      <Icon name="group" className="text-[16px] text-secondary-container" /> {c.creators}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Icon name="timer" className="text-[15px]" /> {c.daysLeft}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{c.title}</h3>
                  <p className="text-xs leading-relaxed font-medium text-slate-500">{c.body}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="text-[11px] font-medium text-slate-600">
                  Top voter share: <strong className="text-emerald-600">{c.voterShare}</strong>
                </div>
                <Link href="/home" className={`badge-shimmer rounded-full px-4 py-2 text-xs font-extrabold shadow-sm transition-all active:scale-95 ${c.ctaClass}`}>
                  Join Campaign
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
