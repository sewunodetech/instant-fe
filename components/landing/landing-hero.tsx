"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ChevronDown } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

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
  const reduce = useReducedMotion();
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
      <div className="sticky top-0 flex h-screen flex-col items-center overflow-hidden bg-surface px-4 pt-28 text-center sm:px-6 sm:pt-32 lg:px-8">
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

        {/* Copy — anchored to the top */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Label — what instant.fun is, in one line */}
          <motion.p
            {...heroItem(0.1)}
            className="mt-6 text-base font-semibold text-on-surface-variant sm:text-lg"
          >
            Snap live, get voted, win{" "}
            <span className="text-secondary">real USDC</span> — on BNB Chain
          </motion.p>

          {/* Big number — total rewards paid to creators */}
          <motion.h1
            {...heroItem(0.15)}
            className="mt-2 flex items-center justify-center text-6xl font-extrabold tracking-tight text-on-surface drop-shadow-sm sm:text-7xl lg:text-8xl"
            style={{ lineHeight: 1 }}
          >
            <span className="text-on-surface/40">$</span>
            <NumberTicker value={1000000} className="text-on-surface" />
          </motion.h1>

          <motion.p
            {...heroItem(0.22)}
            className="mt-3 text-body-sm font-medium tracking-wide text-on-surface-variant/90 uppercase"
          >
            Paid out to creators &amp; voters
          </motion.p>

          {/* CTA + chevron */}
          <motion.div {...heroItem(0.3)} className="mt-7 flex flex-col items-center">
            <motion.div
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1 text-secondary"
            >
              <ChevronDown className="size-6" strokeWidth={2.6} aria-hidden />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
