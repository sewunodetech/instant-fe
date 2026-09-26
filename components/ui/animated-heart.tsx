"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart } from "lucide-react";

const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle), color: i % 2 ? "#ff5a7a" : "#ffc933" };
});

/**
 * The vote glyph used everywhere: outline heart → filled heart. Turning on
 * pops the heart with a spring and throws a small ring of sparks; turning
 * off just deflates. Reduced-motion users get the state change only.
 */
export function AnimatedHeart({ active, size = 20, className = "" }: { active: boolean; size?: number; className?: string }) {
  const reduce = useReducedMotion();

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* initial={false}: no pop/burst for snaps that were already voted on load. */}
      <AnimatePresence initial={false}>
        <motion.span
          key={active ? "on" : "off"}
          initial={reduce ? false : active ? { scale: 0.4 } : { scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={active ? { type: "spring", stiffness: 520, damping: 14 } : { duration: 0.18, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Heart
            size={size}
            strokeWidth={2.2}
            fill={active ? "currentColor" : "none"}
            className={active ? "text-vote" : "text-current"}
          />
        </motion.span>
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {active && !reduce && (
          <motion.span key="burst" aria-hidden className="pointer-events-none absolute inset-0" initial="start" animate="end" exit={{ opacity: 0 }}>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-vote"
              variants={{ start: { scale: 0.3, opacity: 0.9 }, end: { scale: 2.2, opacity: 0 } }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
            {PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: p.color }}
                variants={{
                  start: { x: 0, y: 0, scale: 1, opacity: 1 },
                  end: { x: p.x * size * 1.1, y: p.y * size * 1.1, scale: 0, opacity: 0 },
                }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/** Vote count that rolls up/down when it changes. */
export function RollingCount({ value, className = "" }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "-70%", opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {value.toLocaleString("en")}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
