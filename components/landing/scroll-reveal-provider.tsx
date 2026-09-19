"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/components/landing/use-scroll-reveal";

export function ScrollRevealProvider({ children }: { children: ReactNode }) {
  useScrollReveal();
  return <>{children}</>;
}
