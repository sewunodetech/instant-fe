"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type NavigatorConnection = { saveData?: boolean; effectiveType?: string };

/**
 * Full-bleed landing scene behind the auth screens. The still frame renders
 * instantly; the (heavy) loop only plays on fast connections without
 * reduced-motion or data-saver, so mobile users never wait on it.
 */
export function AuthBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const conn = (navigator as Navigator & { connection?: NavigatorConnection }).connection;
    const slow = conn?.saveData || /(^|-)2g|3g/.test(conn?.effectiveType ?? "");
    if (slow || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video.preload = "auto";
    video.play().catch(() => {});
  }, []);

  return (
    // Scene fills the band above the sheet so the toys sit between headline and buttons.
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[68dvh] overflow-hidden bg-surface">
      <Image src="/marketing/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[50%_85%]" />
      <video
        ref={videoRef}
        src="/marketing/landing-scrub.mp4"
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 size-full object-cover object-[50%_85%] transition-opacity duration-700 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Keeps the headline legible on the white wall and grounds the sheet. */}
      <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-surface via-surface/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-on-surface/30 to-transparent" />
    </div>
  );
}
