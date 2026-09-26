import { cn } from "@/lib/utils";
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { DoodleField } from "@/components/landing/pixel-doodles";
import { features } from "@/components/landing/content";
import {
  cardBody,
  cardTitle,
  eyebrow,
  sectionLead,
  sectionTitle,
} from "@/components/landing/typography";

/**
 * "What is instant.fun?" — the explainer band that answers the first-time
 * visitor's core question right after the hero. Three product pillars
 * (live camera, gasless votes, on-chain payouts) presented as on-brand cards.
 *
 * Themes echo the toy-3D palette shared with the how-it-works steps so the
 * whole page reads as one visual set.
 */
const pillarThemes = [
  { tile: "bg-[#ff6b6b]", ring: "ring-[#ff6b6b]/20" },
  { tile: "bg-[#106df4]", ring: "ring-[#106df4]/20" },
  { tile: "bg-[#f0b90b]", ring: "ring-[#f0b90b]/25" },
  { tile: "bg-[#006d32]", ring: "ring-[#006d32]/20" },
];

export function WhatIsSection() {
  return (
    <section
      id="what-is-it"
      className="relative scroll-mt-24 overflow-hidden bg-surface px-4 py-24 sm:px-6 lg:px-8"
    >
      <DoodleField
        items={[
          { name: "camera", className: "left-[5%] top-[14%]", size: 42, rotate: -10, duration: 6.5 },
          { name: "coin", className: "right-[6%] top-[12%]", size: 40, rotate: 12, duration: 7, delay: 0.5 },
          { name: "heart", className: "left-[8%] bottom-[16%]", size: 36, rotate: 8, duration: 6, delay: 1 },
        ]}
        className="hidden md:block"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <span className={eyebrow}>What is instant.fun?</span>
          <h2 className={cn(sectionTitle, "mt-5")}>
            A spontaneous photo arena with real stakes
          </h2>
          <p className={cn(sectionLead, "mx-auto max-w-lg")}>
            instant.fun turns unedited, in-the-moment snaps into a game. Enter a live
            drop, get backed by the community, and win a real BNB prize pool.
          </p>
        </FadeIn>

        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const theme = pillarThemes[feature.theme] ?? pillarThemes[0];
            return (
              <StaggerItem key={feature.title} className="h-full">
                <article
                  className={cn(
                    "group flex h-full flex-col rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-6 shadow-soft ring-4 transition-transform duration-300 hover:-translate-y-1.5",
                    theme.ring,
                  )}
                >
                  <div
                    className={cn(
                      "mb-5 flex size-12 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
                      theme.tile,
                    )}
                  >
                    <feature.icon className="size-6" strokeWidth={2.2} aria-hidden />
                  </div>

                  <h3 className={cardTitle}>{feature.title}</h3>
                  <p className={cn(cardBody, "mt-2 flex-1")}>{feature.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
