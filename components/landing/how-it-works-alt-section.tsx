import { cn } from "@/lib/utils";
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { DoodleField, type DoodleName } from "@/components/landing/pixel-doodles";
import { steps } from "@/components/landing/content";
import {
  cardBody,
  cardTitle,
  eyebrow,
  sectionLead,
  sectionTitle,
  tagPill,
} from "@/components/landing/typography";

/**
 * "How it works" — a fresh editorial, alternating-rows layout (distinct from
 * the compact 4-card grid). Each step pairs a block of copy with a large
 * pixel-doodle illustration tile, alternating sides down the page so it reads
 * as a story: join → snap → vote → win.
 *
 * Colors and doodles stay on the shared toy-3D palette so it matches the rest
 * of the landing page.
 */
type RowTheme = {
  /** Illustration tile background gradient. */
  tile: string;
  /** Number + tag accent. */
  accent: string;
  tag: string;
  /** The doodle that headlines the illustration tile. */
  doodle: DoodleName;
  /** Extra scattered doodles inside the tile. */
  scatter: DoodleName[];
};

const rowThemes: RowTheme[] = [
  {
    tile: "from-[#ffd0d0] to-[#ffe9e9]",
    accent: "text-[#d23a3a]",
    tag: "bg-[#ff6b6b]/10 text-[#d23a3a]",
    doodle: "bolt",
    scatter: ["star", "heart"],
  },
  {
    tile: "from-[#cfe3ff] to-[#e7f1ff]",
    accent: "text-[#0056c6]",
    tag: "bg-[#106df4]/10 text-[#0056c6]",
    doodle: "camera",
    scatter: ["controller", "star"],
  },
  {
    tile: "from-[#fff0c2] to-[#fff8e0]",
    accent: "text-[#8a7500]",
    tag: "bg-[#f0b90b]/15 text-[#8a7500]",
    doodle: "heart",
    scatter: ["star", "ghost"],
  },
  {
    tile: "from-[#c9f0d6] to-[#e6f7ec]",
    accent: "text-[#006d32]",
    tag: "bg-[#006d32]/10 text-[#006d32]",
    doodle: "coin",
    scatter: ["star", "controller"],
  },
];

export function HowItWorksAltSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden bg-surface-container-low/50 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="relative z-10 mx-auto max-w-5xl">
        <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
          <span className={eyebrow}>How it works</span>
          <h2 className={cn(sectionTitle, "mt-5")}>From a live moment to a real prize</h2>
          <p className={cn(sectionLead, "mx-auto max-w-lg")}>
            Join a campaign, snap something real, and let the community decide. Win the
            drop and the prize pool is yours — no uploads, no edits, no gas.
          </p>
        </FadeIn>

        <Stagger className="flex flex-col gap-6 sm:gap-8">
          {steps.map((step, i) => {
            const theme = rowThemes[i] ?? rowThemes[0];
            const reversed = i % 2 === 1;
            return (
              <StaggerItem key={step.title}>
                <article
                  className={cn(
                    "flex flex-col items-stretch gap-5 overflow-hidden rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-4 shadow-soft sm:gap-8 sm:p-5 md:flex-row md:items-center",
                    reversed && "md:flex-row-reverse",
                  )}
                >
                  {/* Illustration tile */}
                  <div
                    className={cn(
                      "relative flex aspect-[16/10] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br md:aspect-square md:w-56 lg:w-64",
                      theme.tile,
                    )}
                  >
                    {/* The headline doodle is centered with grid placement
                        rather than translate utilities — DoodleField animates
                        `transform`, which would override a Tailwind translate. */}
                    <DoodleField
                      items={[
                        { name: theme.doodle, className: "inset-0 grid place-items-center", size: 128, rotate: reversed ? 6 : -6, duration: 6.5 },
                        { name: theme.scatter[0], className: "left-[10%] top-[12%]", size: 34, rotate: -12, duration: 6, delay: 0.4 },
                        { name: theme.scatter[1], className: "right-[10%] bottom-[12%]", size: 32, rotate: 10, duration: 7, delay: 0.9 },
                      ]}
                    />
                  </div>

                  {/* Copy */}
                  <div className="flex flex-1 flex-col px-1 sm:px-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "font-pixel text-xs tabular-nums sm:text-sm",
                          theme.accent,
                        )}
                      >
                        0{i + 1}
                      </span>
                      <span className="h-px flex-1 bg-on-surface/10" />
                      <span className="flex size-9 items-center justify-center rounded-xl bg-surface-container text-on-surface">
                        <step.icon className="size-5" strokeWidth={2.2} aria-hidden />
                      </span>
                    </div>

                    <h3 className={cn(cardTitle, "mt-4 sm:text-2xl")}>{step.title}</h3>
                    <p className={cn(cardBody, "mt-2")}>{step.body}</p>

                    <span className={cn(tagPill, "mt-5", theme.tag)}>{step.tag}</span>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
