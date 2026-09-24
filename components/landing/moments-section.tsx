import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { FadeIn } from "@/components/landing/motion-primitives";
import {
  CircularGallery,
  type GalleryItem,
} from "@/components/ui/circular-gallery-2";
import { APP_ENTRY_HREF } from "@/components/landing/content";
import { cn } from "@/lib/utils";
import { eyebrow, sectionLead, sectionTitle } from "@/components/landing/typography";

/**
 * "Wall of real moments" — a draggable, curved 3D carousel (OGL/WebGL) of
 * candid snaps. It leads with the photos instead of describing them, which
 * fits instant.fun: the whole product is real, unedited moments.
 *
 * Uses the local mock snaps so the gallery shows actual on-brand imagery,
 * each captioned with the campaign it came from.
 */
const MOMENTS: GalleryItem[] = [
  { image: "/mock/leaderboard/snap-1.jpg", text: "" },
  { image: "/mock/leaderboard/snap-2.jpg", text: "" },
  { image: "/mock/leaderboard/snap-3.jpg", text: "" },
  { image: "/mock/leaderboard/snap-4.jpg", text: "" },
  { image: "/mock/leaderboard/snap-5.jpg", text: "" },
  { image: "/mock/leaderboard/snap-6.jpg", text: "" },
  { image: "/mock/leaderboard/snap-7.jpg", text: "" },
  { image: "/mock/leaderboard/snap-8.jpg", text: "" },
  { image: "/mock/leaderboard/snap-9.jpg", text: "" },
  { image: "/mock/leaderboard/snap-10.jpg", text: "" },
  { image: "/mock/campaigns/summer-vibes.jpg", text: "" },
  { image: "/mock/campaigns/best-friends.jpg", text: "" },
];

export function MomentsSection() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <span className={eyebrow}>
            <Camera className="size-3.5 text-secondary" strokeWidth={2.4} aria-hidden />
            Straight from the arena
          </span>
          <h2 className={cn(sectionTitle, "mt-5")}>A wall of real moments</h2>
          <p className={cn(sectionLead, "mx-auto max-w-lg")}>
            No stock, no filters, no AI. Every snap here was shot live in a
            2-minute window and voted up by the community.
          </p>
        </FadeIn>

        {/* Draggable curved gallery. Sits on the page surface; captions use
            the brand ink via fontClassName so getComputedStyle picks it up. */}
        <FadeIn delay={0.1} className="relative">
          <CircularGallery
            items={MOMENTS}
            bend={3}
            borderRadius={0.05}
            scrollEase={0.02}
            fontClassName="font-sans text-on-surface text-[26px] font-extrabold"
            className="h-[420px] w-full sm:h-[500px]"
          />

          {/* Side fades melt the canvas edges into the page surface. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface to-transparent sm:w-24"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface to-transparent sm:w-24"
          />

          {/* Hint + CTA below the gallery. */}
          <p className="mt-6 text-center text-body-sm font-medium text-on-surface-variant/70">
            Drag or scroll to explore the wall
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              href={APP_ENTRY_HREF}
              className="group inline-flex items-center gap-1.5 rounded-full bg-secondary px-6 py-3 text-[0.9375rem] font-bold tracking-[-0.01em] text-surface transition-transform hover:scale-[1.03] active:scale-95"
            >
              Snap your moment
              <ArrowUpRight
                className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={2.4}
                aria-hidden
              />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
