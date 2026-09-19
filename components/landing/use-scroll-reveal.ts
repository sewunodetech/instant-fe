"use client";

import { useEffect } from "react";

/**
 * Staggered scroll reveal for elements carrying the `.reveal-item` class.
 * Mirrors the IntersectionObserver behaviour from the original landing mockup.
 */
export function useScrollReveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal-item"));
    if (items.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      items.forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            window.setTimeout(() => el.classList.add("revealed"), index * 80);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
