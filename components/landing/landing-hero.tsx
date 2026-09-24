"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Shared entrance transition for the stacked hero copy. */
function heroItem(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: easeOut },
  };
}

export function LandingHero() {
  const trackRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  // Scroll progress across the tall track (0 at top → 1 when scrolled past).
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Smooth out the raw scroll so frame scrubbing feels fluid, not jumpy.
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 150,
    mass: 0.2,
  });

  // Map 0→1 progress onto the video timeline.
  const currentTime = useTransform(smoothProgress, [0, 1], [0, duration || 1]);

  // Read the video's real duration once metadata is available.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => setDuration(video.duration || 0);
    if (video.readyState >= 1) onMeta();
    video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, []);

  // Drive the video frame from scroll position on every animation frame.
  // Using rAF (instead of reacting to every value change) avoids piling up
  // seeks and keeps scrubbing smooth on an all-keyframe video.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !duration) return;

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (video.seeking) return;
      const target = Math.min(Math.max(currentTime.get(), 0), duration);
      // One frame ≈ 1/24s; only seek when the change is worth a repaint.
      if (Math.abs(video.currentTime - target) > 1 / 48) {
        video.currentTime = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentTime, duration]);

  return (
    // Tall track: gives us scroll distance to scrub the video through.
    <section ref={trackRef} className="relative h-[300vh]">
      {/* Sticky viewport: video stays pinned while the page scrolls. */}
      <div className="sticky top-0 flex h-screen flex-col items-center overflow-hidden bg-surface px-4 pt-24 text-center sm:px-6 sm:pt-28 lg:px-8">
        {/* Full-bleed scroll-scrubbed video */}
        <video
          ref={videoRef}
          className="absolute inset-0 -z-0 size-full object-cover"
          src="/marketing/landing-scrub.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden
        />

        {/* Soft readability scrim keeps the headline legible without hiding
            the toy scene that carries the visual story. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[54%] bg-gradient-to-b from-surface via-surface/85 to-transparent"
        />

        {/* Brand message — two elements only, so it stays clear of the artwork. */}
        <div className="relative z-10 md:top-10 flex w-full max-w-4xl flex-col items-center">
          {/* Display size sits one step above the section headings. Tracking is
              only slightly negative — Plus Jakarta Sans gets cramped and uneven
              if it's pulled in as tightly as a tighter grotesque would allow. */}
          <motion.h1
            {...heroItem(0.12)}
            className="mt-4 text-[2.25rem] leading-[1.05] font-extrabold tracking-[-0.025em] text-balance text-on-surface sm:text-5xl lg:text-[3.75rem]"
          >
            Snap now. <span className="text-secondary">Win the moment.</span>
          </motion.h1>

          {/* Sits closer to the headline than the headline does to the nav, so
              the two read as one unit rather than two stacked blocks. */}
          <motion.p
            {...heroItem(0.2)}
            className="mt-4 max-w-xl text-base leading-relaxed font-medium text-balance text-on-surface-variant sm:text-lg"
          >
            Shoot live in 2 minutes. The community votes. Winners split a real{" "}
            <span className="font-bold text-secondary">USDC</span> prize pool on{" "}
            <span className="font-bold text-bnb">BNB Chain</span>.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
