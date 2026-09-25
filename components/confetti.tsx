"use client";

import { useCallback, useState, type CSSProperties } from "react";

const colors = ["#FFE000", "#106DF4", "#71FB96", "#D9E2FF", "#54E07F"];

type Particle = { id: number; style: CSSProperties };

function makeBurst(seed: number, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const size = Math.floor(Math.random() * 8) + 6;
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 120 + 50;
    return {
      id: seed * 100 + i,
      style: {
        width: size,
        height: size * 0.8,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        "--dx": `${Math.cos(angle) * velocity}px`,
        "--dy": `${Math.sin(angle) * velocity + 40}px`,
        "--rot": `${Math.random() * 360}deg`,
      } as CSSProperties,
    };
  });
}

/** Particle burst state; render `<ConfettiLayer particles={...} />` inside a positioned container. */
export function useConfetti(count = 24) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = useCallback(() => {
    const seed = Date.now();
    setParticles((p) => [...p, ...makeBurst(seed, count)]);
    setTimeout(() => setParticles((p) => p.filter((x) => x.id < seed * 100)), 1050);
  }, [count]);

  return { particles, burst };
}

export function ConfettiLayer({ particles }: { particles: Particle[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span key={p.id} className="absolute top-[40%] left-1/2 animate-confetti rounded-sm" style={p.style} />
      ))}
    </div>
  );
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
