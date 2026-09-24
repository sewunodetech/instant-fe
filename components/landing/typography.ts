/**
 * Shared typography scale for the marketing landing page.
 *
 * Every section imports these instead of hand-writing size/weight/tracking
 * combos, so the rhythm stays identical from the hero down to the footer.
 *
 * Type is set in Plus Jakarta Sans (see app/layout.tsx). The family tops out
 * at 800, so `font-extrabold` is the heaviest weight — never use `font-black`,
 * which the browser would have to synthesize.
 *
 * Scale (desktop): display 60 → h2 44 → h3 20 → lead 18 → body 15 → eyebrow 11.
 * Tracking tightens as size grows, which keeps large headings optically even.
 */

/** Small uppercase label that sits above a section heading. */
export const eyebrow =
  "inline-flex items-center gap-2 rounded-full border border-on-surface/10 bg-surface-container-lowest px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-on-surface-variant uppercase";

/** Section heading (h2). One step below the hero display size. */
export const sectionTitle =
  "text-[1.75rem] leading-[1.1] font-extrabold tracking-[-0.02em] text-balance text-on-surface sm:text-4xl lg:text-[2.75rem]";

/** Supporting paragraph directly under a section heading. */
export const sectionLead =
  "mt-4 text-base leading-relaxed font-medium text-pretty text-on-surface-variant sm:text-lg";

/** Card / row heading (h3). */
export const cardTitle =
  "text-lg leading-snug font-bold tracking-[-0.01em] text-on-surface sm:text-xl";

/** Card / row body copy. */
export const cardBody =
  "text-[0.9375rem] leading-relaxed font-medium text-on-surface-variant";

/** Small pill used for step tags and metadata chips. */
export const tagPill =
  "inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.02em]";
