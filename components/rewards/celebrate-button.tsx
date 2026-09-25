"use client";

import { PartyPopper } from "lucide-react";
import { ConfettiLayer, useConfetti } from "@/components/confetti";

/** Confetti over the reward card; bursts on tap. */
export function RewardConfetti() {
  const { particles, burst } = useConfetti();

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
