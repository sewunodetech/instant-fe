import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { DoodleField } from "@/components/landing/pixel-doodles";
import { communityLinks } from "@/components/landing/content";
import { sectionLead, sectionTitle } from "@/components/landing/typography";

export function CommunitySection() {
  return (
    <section id="community" className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
      <FadeIn className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-gradient-to-b from-[#8fd0ff] to-[#c9ecff] px-6 py-16 sm:px-12">
        {/* Pixel clouds + doodles */}
        <DoodleField
          items={[
            { name: "star", className: "left-[6%] top-[18%]", size: 40, rotate: -12, duration: 6 },
            { name: "heart", className: "right-[8%] top-[14%]", size: 36, rotate: 10, duration: 7, delay: 0.5 },
            { name: "camera", className: "left-[10%] bottom-[16%]", size: 42, rotate: 6, duration: 6.5, delay: 1 },
            { name: "ghost", className: "right-[6%] bottom-[20%]", size: 42, rotate: -8, duration: 7.5, delay: 0.3 },
          ]}
        />
        {/* Chunky pixel clouds */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-[30%] h-6 w-24 rounded-full bg-white/70" />
          <div className="absolute right-[14%] top-[45%] h-5 w-20 rounded-full bg-white/60" />
          <div className="absolute left-[40%] bottom-[12%] h-5 w-28 rounded-full bg-white/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          {/* Same scale as the other section headings, recolored for the
              blue-sky panel instead of the default on-surface ink. */}
          <h2 className={cn(sectionTitle, "text-[#0b3b66]")}>
            Join the instant.fun community
          </h2>
          <p className={cn(sectionLead, "mx-auto max-w-lg text-[#0b3b66]/70")}>
            Get drop alerts, swap tips with creators, and stay first in line for new BNB
            campaigns.
          </p>

          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {communityLinks.map((c) => (
              <StaggerItem key={c.label}>
                <a
                  href={c.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-5 py-4 text-left text-white shadow-card transition-transform hover:-translate-y-1 active:scale-95",
                    c.theme,
                  )}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <c.icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.9375rem] font-bold tracking-[-0.01em]">{c.label}</p>
                    <p className="truncate text-[12px] font-medium text-white/80">{c.handle}</p>
                  </div>
                  <ArrowUpRight
                    className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    strokeWidth={2.4}
                    aria-hidden
                  />
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </FadeIn>
    </section>
  );
}
