"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type NavigatorConnection = { saveData?: boolean; effectiveType?: string };

/**
 * The landing scene, placed in the flow between the headline and the auth
 * sheet so it flexes with screen height and never collides with text. The
 * still frame renders instantly; the (heavy) loop only plays on fast
 * connections without reduced-motion or data-saver.
 */
export function AuthScene() {
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
    <div aria-hidden className="pointer-events-none relative -mb-8 min-h-44 flex-1 overflow-hidden">
      <Image src="/marketing/hero.jpg" alt="" fill priority sizes="480px" className="object-cover object-[50%_80%]" />
      <video
        ref={videoRef}
        src="/marketing/landing-scrub.mp4"
        muted
        loop
        playsInline
        preload="none"
        onPlaying={() => setPlaying(true)}
        className={`absolute inset-0 size-full object-cover object-[50%_80%] transition-opacity duration-700 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Blends the photo's wall into the page so there's no visible seam. */}
      <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-surface to-transparent" />
    </div>
  );
}
