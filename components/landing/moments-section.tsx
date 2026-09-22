import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { FadeIn } from "@/components/landing/motion-primitives";
import {
  ImageStreamHero,
  type StreamImage,
} from "@/components/ui/image-stream-hero";
import { APP_ENTRY_HREF } from "@/components/landing/content";

/**
 * "Wall of real moments" — a 3D corridor of candid snaps rushing toward the
 * viewer. It leads with the photos instead of describing them, which fits
 * instant.fun: the whole product is real, unedited moments. Sits after the
 * winners section as visual proof before the community CTA.
 *
 * Uses the local mock snaps so the corridor shows actual on-brand imagery
 * rather than placeholder stock.
 */
const MOMENTS: StreamImage[] = [
  { src: "/mock/leaderboard/snap-1.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-2.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-3.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-4.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-5.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-6.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-7.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-8.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-9.jpg", alt: "" },
  { src: "/mock/leaderboard/snap-10.jpg", alt: "" },
  { src: "/mock/campaigns/summer-vibes.jpg", alt: "" },
  { src: "/mock/campaigns/best-friends.jpg", alt: "" },
];

export function MomentsSection() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-on-surface/10 bg-surface-container-lowest px-3.5 py-1 text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">
            <Camera className="size-3.5 text-secondary" strokeWidth={2.4} aria-hidden />
            Straight from the arena
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance text-on-surface sm:text-5xl">
            A wall of real moments
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-pretty text-on-surface-variant sm:text-lg">
            No stock, no filters, no AI. Every snap here was shot live in a
            2-minute window and voted up by the community.
          </p>
        </FadeIn>

        {/* The corridor sits on the page's own light surface. Soft white
            edge-fades melt the photos into the background so it reads as a
            clean, floating ribbon of images rather than a boxed-in panel. */}
        <FadeIn delay={0.1} className="relative">
          <ImageStreamHero
            images={MOMENTS}
            cards={9}
            speed={20}
            className="h-[420px] w-full sm:h-[500px]"
          >
            {/* Feather the four edges into the surface color. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface/90 via-transparent to-surface/90"
            />
          </ImageStreamHero>

          {/* CTA lives below the ribbon on clean surface — no text over the
              moving images, keeping it legible and minimal. */}
          <div className="mt-8 flex justify-center">
            <Link
              href={APP_ENTRY_HREF}
              className="group inline-flex items-center gap-1.5 rounded-full bg-secondary px-6 py-3 text-body-md font-bold text-surface transition-transform hover:scale-[1.03] active:scale-95"
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
