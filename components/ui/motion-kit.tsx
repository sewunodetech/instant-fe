"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useRef } from "react";

/** Shared rhythm: one ease-out curve, one spring, 40ms list stagger. */
export const easeOut = [0.16, 1, 0.3, 1] as const;
export const pop = { type: "spring", stiffness: 420, damping: 22 } as const;

/** List whose children rise in one after another (40ms apart). */
export function Stagger({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Fades/lifts content in the first time it scrolls into view (feed cards). */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/** Number that counts up from 0 when it scrolls into view (and tweens on change). */
export function CountUp({
  value,
  format = (n: number) => Math.round(n).toLocaleString("en"),
  className = "",
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, format);

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, value, { duration: 0.9, ease: easeOut });
    return () => controls.stop();
  }, [inView, value, reduce, mv]);

  return (
    <motion.span ref={ref} className={`tabular-nums ${className}`}>
      {text}
    </motion.span>
  );
}

function remaining(endsAt: string) {
  const ms = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return { done: ms === 0, d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function FlipDigit({ value }: { value: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-flex h-[1.15em] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "100%", opacity: 0 }}
          transition={{ duration: 0.25, ease: easeOut }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Ticking "6d 21h 04m 12s" countdown. Seconds flip each tick; shows only the
 * three most significant units so it stays compact on phones.
 */
export function LiveCountdown({ endsAt, className = "", onDone }: { endsAt: string; className?: string; onDone?: () => void }) {
  const [t, setT] = useState(() => remaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => {
      const next = remaining(endsAt);
      setT(next);
      if (next.done) {
        clearInterval(id);
        onDone?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt, onDone]);

  if (t.done) return <span className={className}>Closing…</span>;

  const parts: [string, string][] = t.d > 0
    ? [[String(t.d), "d"], [String(t.h).padStart(2, "0"), "h"], [String(t.m).padStart(2, "0"), "m"]]
    : [[String(t.h).padStart(2, "0"), "h"], [String(t.m).padStart(2, "0"), "m"], [String(t.s).padStart(2, "0"), "s"]];

  return (
    <span className={`inline-flex items-baseline gap-1 font-bold tabular-nums ${className}`} aria-label={`${t.d} days ${t.h} hours ${t.m} minutes left`}>
      {parts.map(([v, unit]) => (
        <span key={unit} className="inline-flex items-baseline">
          {v.split("").map((ch, i) => (
            <FlipDigit key={`${unit}-${i}`} value={ch} />
          ))}
          <span className="ml-px text-[0.8em] opacity-70">{unit}</span>
        </span>
      ))}
    </span>
  );
}

/** Diagonal light sweep across a pill/card; parent needs `relative overflow-hidden`. */
export function Shine({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}>
      <span className="animate-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </span>
  );
}
