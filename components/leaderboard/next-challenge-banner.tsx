import Link from "next/link";
import { ArrowRight, Sunrise, Timer } from "lucide-react";
import { upcomingCampaign } from "@/lib/mock-data";

export function NextChallengeBanner() {
  const c = upcomingCampaign;

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border-2 border-white/15 bg-secondary p-space-md text-on-secondary shadow-[0_8px_24px_rgba(0,86,198,0.22)]">
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-label-sm backdrop-blur-md">
            <Timer size={14} />
            Starts in {c.startsIn}
          </span>
          <h2 className="text-headline-sm font-extrabold tracking-tight">{c.tag}</h2>
          <p className="mt-0.5 text-body-sm text-secondary-fixed">
            ${c.poolUsdc} USDC Prize Pool • {c.theme}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
          <Sunrise size={28} />
        </div>
      </div>
      <Link
        href={`/snap?campaign=${c.id}`}
        className="relative z-10 mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-surface text-label-lg font-extrabold text-secondary shadow-md transition-transform active:scale-[0.98]"
      >
        Join Next Challenge
        <ArrowRight size={20} />
      </Link>
    </section>
  );
}
