"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart } from "lucide-react";

const DOUBLE_TAP_MS = 280;

/**
 * Photo surface with Instagram-style gestures: double-tap votes (never
 * un-votes) and flashes a big heart; a single tap runs `onTap` once the
 * double-tap window has passed.
 */
export function DoubleTapVote({
  canVote,
  hasVoted,
  onVote,
  onTap,
  label,
  children,
}: {
  canVote: boolean;
  hasVoted: boolean;
  onVote: () => void;
  onTap?: () => void;
  label: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const lastTap = useRef(0);
  const singleTap = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (singleTap.current) clearTimeout(singleTap.current);
  }, []);

  function handleTap() {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (singleTap.current) clearTimeout(singleTap.current);
      if (!canVote) return;
      setBurst((n) => n + 1);
      if (!hasVoted) onVote();
      return;
    }
    lastTap.current = now;
    if (onTap) singleTap.current = setTimeout(onTap, DOUBLE_TAP_MS);
  }

  return (
    <div className="absolute inset-0">
      {children}
      <button
        type="button"
        aria-label={label}
        onClick={handleTap}
        className="absolute inset-0 cursor-pointer touch-manipulation select-none"
      />
      <AnimatePresence>
        {burst > 0 && (
          <motion.span
            key={burst}
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.2 }}
            animate={{ opacity: [0, 1, 1, 0], scale: reduce ? 1 : [0.2, 1.25, 1, 1.1], rotate: reduce ? 0 : [-12, 6, 0, 0] }}
            transition={{ duration: 0.9, times: [0, 0.3, 0.7, 1], ease: "easeOut" }}
            onAnimationComplete={() => setBurst(0)}
          >
            <Heart size={96} fill="currentColor" strokeWidth={0} className="text-white drop-shadow-[0_6px_24px_rgba(255,61,104,0.65)]" />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
