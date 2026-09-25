"use client";

import { motion, useReducedMotion } from "motion/react";

const COLORS = ["#FFE000", "#106DF4", "#71FB96", "#ff3d68", "#D9E2FF"];

// Deterministic spread (no Math.random in render) — looks random enough.
const PIECES = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2 + (i % 3) * 0.35;
  const distance = 70 + ((i * 37) % 60);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 20,
    rotate: (i * 67) % 360,
    size: 6 + (i % 4) * 2,
    color: COLORS[i % COLORS.length],
    round: i % 3 === 0,
    delay: (i % 5) * 0.02,
  };
});

/** One-shot confetti burst from the centre of its (positioned) parent. */
export function SuccessBurst({ className = "top-1/3" }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span aria-hidden className={`pointer-events-none absolute left-1/2 z-0 ${className}`}>
      {PIECES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{ width: p.size, height: p.size * (p.round ? 1 : 0.6), backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 60], opacity: [1, 1, 0], scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.1, delay: p.delay, ease: [0.16, 1, 0.3, 1], times: [0, 0.55, 1] }}
        />
      ))}
    </span>
  );
}
