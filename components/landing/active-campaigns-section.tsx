import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Timer, Users } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import { FadeIn, Parallax, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { APP_ENTRY_HREF, campaigns } from "@/components/landing/content";

/** Staggered scroll drift; the middle card leads so the row feels layered. */
const cardDrift = [50, 90, 30];

export function ActiveCampaignsSection() {
  return (
    <section id="campaigns" className="scroll-mt-24 bg-surface-container-low/40 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-body-sm font-bold tracking-wider text-secondary uppercase">Live drop vaults</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
              Active campaigns &amp; drops
            </h2>
            <p className="mt-4 text-base text-pretty text-on-surface-variant sm:text-lg">
              Join a timed challenge or vote to take a share of the community pool.
            </p>
          </div>
          <Link
            href={APP_ENTRY_HREF}
            className="group inline-flex items-center gap-1.5 self-start rounded-full border border-black/10 bg-surface-container-lowest px-5 py-2.5 text-body-sm font-bold shadow-soft transition-all hover:-translate-y-0.5 md:self-auto"
          >
            Browse all drops
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} aria-hidden />
          </Link>
        </FadeIn>

        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {campaigns.map((campaign, i) => (
            <StaggerItem key={campaign.tag}>
             <Parallax distance={cardDrift[i] ?? 40} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-surface-container-lowest p-3 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
                {campaign.featured && (
                  <BorderBeam
                    size={90}
                    duration={7}
                    colorFrom="#f0b90b"
                    colorTo="#106df4"
                    className="opacity-80"
                  />
                )}

                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-container">
                  <Image
                    src={campaign.image}
                    alt={campaign.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full bg-on-surface/70 px-3 py-1 text-body-sm font-bold text-surface backdrop-blur-md">
                      <span className="size-2 rounded-full bg-tertiary" />
                      {campaign.tag}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-body-sm font-extrabold shadow-sm",
                        campaign.featured
                          ? "bg-primary-container text-on-primary-fixed"
                          : "bg-secondary-fixed text-on-secondary-fixed",
                      )}
                    >
                      {campaign.pool}
                    </span>
                  </div>
                  <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-on-surface/70 px-2.5 py-1 text-[11px] font-bold text-surface backdrop-blur-md">
                    <MapPin className="size-3" strokeWidth={2.4} aria-hidden />
                    {campaign.location}
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-2 pt-4">
                  <div className="flex items-center justify-between text-body-sm font-semibold">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <Users className="size-4 text-secondary" strokeWidth={2.2} aria-hidden />
                      {campaign.creators}
                    </span>
                    <span className="flex items-center gap-1.5 text-bnb-dim">
                      <Timer className="size-4" strokeWidth={2.2} aria-hidden />
                      {campaign.daysLeft}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-extrabold tracking-tight text-on-surface">{campaign.title}</h3>
                  <p className="mt-1.5 text-body-sm leading-relaxed text-on-surface-variant">{campaign.body}</p>

                  <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
                    <p className="text-[11px] font-medium text-on-surface-variant">
                      Top voter share <span className="font-bold text-tertiary">{campaign.voterShare}</span>
                    </p>
                    <Link
                      href={APP_ENTRY_HREF}
                      className={cn(
                        "rounded-full px-4 py-2 text-body-sm font-bold transition-transform hover:scale-[1.03] active:scale-95",
                        campaign.featured
                          ? "bg-on-surface text-surface"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high",
                      )}
                    >
                      Join
                    </Link>
                  </div>
                </div>
              </article>
             </Parallax>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
