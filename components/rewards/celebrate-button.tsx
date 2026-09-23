"use client";

import { useEffect } from "react";
import { PartyPopper } from "lucide-react";
import { ConfettiLayer, prefersReducedMotion, useConfetti } from "@/components/confetti";

/** Confetti over the reward card; bursts once on mount and again on each tap. */
export function RewardConfetti() {
  const { particles, burst } = useConfetti();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setTimeout(burst, 400);
    return () => clearTimeout(t);
  }, [burst]);

  return (
    <>
      <ConfettiLayer particles={particles} />
      <button
        aria-label="Pop confetti"
        onClick={burst}
        className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-transform hover:bg-surface-container-high active:scale-90"
      >
        <PartyPopper size={20} />
      </button>
    </>
  );
}
