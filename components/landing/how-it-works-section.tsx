import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { DoodleField } from "@/components/landing/pixel-doodles";
import { steps } from "@/components/landing/content";

/** Playful per-step color themes, echoing the toy-3D hero palette. */
const stepThemes = [
  { tile: "bg-[#ff6b6b]", ring: "ring-[#ff6b6b]/20", tag: "bg-[#ff6b6b]/10 text-[#d23a3a]" },
  { tile: "bg-[#106df4]", ring: "ring-[#106df4]/20", tag: "bg-[#106df4]/10 text-[#0056c6]" },
  { tile: "bg-[#f0b90b]", ring: "ring-[#f0b90b]/25", tag: "bg-[#f0b90b]/15 text-[#8a7500]" },
  { tile: "bg-[#006d32]", ring: "ring-[#006d32]/20", tag: "bg-[#006d32]/10 text-[#006d32]" },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden bg-surface px-4 py-24 sm:px-6 lg:px-8"
    >
      <DoodleField
        items={[
          { name: "star", className: "left-[4%] top-[14%]", size: 44, rotate: -12, duration: 6 },
          { name: "bolt", className: "right-[6%] top-[10%]", size: 40, rotate: 10, duration: 7, delay: 0.5 },
          { name: "camera", className: "left-[7%] bottom-[16%]", size: 42, rotate: 8, duration: 6.5, delay: 1 },
          { name: "coin", className: "right-[5%] bottom-[20%]", size: 40, rotate: -8, duration: 7.5, delay: 0.3 },
        ]}
        className="hidden md:block"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-balance text-on-surface sm:text-5xl">
            From a live moment to a real prize
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-pretty text-on-surface-variant sm:text-lg">
            Join a campaign, snap something real, and let the community decide. Win the
            drop and the prize pool is yours — no uploads, no edits, no gas.
          </p>
        </FadeIn>

        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const theme = stepThemes[i] ?? stepThemes[0];
            return (
              <StaggerItem key={step.title} className="h-full">
                <article
                  className={cn(
                    "group relative flex h-full flex-col rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-6 shadow-soft ring-4 transition-transform duration-300 hover:-translate-y-1.5",
                    theme.ring,
                  )}
                >
                  {/* Connector arrow on desktop */}
                  {i < steps.length - 1 && (
                    <span className="pointer-events-none absolute top-9 -right-3 z-10 hidden size-6 items-center justify-center rounded-full border-2 border-on-surface/10 bg-surface-container-lowest text-on-surface-variant/50 lg:flex">
                      <ArrowRight className="size-3.5" strokeWidth={2.6} aria-hidden />
                    </span>
                  )}

                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-3xl font-extrabold tracking-tight text-on-surface/15">
                      0{i + 1}
                    </span>
                    <div
                      className={cn(
                        "flex size-12 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
                        theme.tile,
                      )}
                    >
                      <step.icon className="size-6" strokeWidth={2.2} aria-hidden />
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold tracking-tight text-on-surface">
                    {step.title}
                  </h3>
                  <p className="mt-2 flex-1 text-body-md leading-relaxed text-on-surface-variant">
                    {step.body}
                  </p>

                  <span
                    className={cn(
                      "mt-6 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-extrabold",
                      theme.tag,
                    )}
                  >
                    {step.tag}
                  </span>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
