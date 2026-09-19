import type { Metadata } from "next";
import { ScrollRevealProvider } from "@/components/landing/scroll-reveal-provider";

export const metadata: Metadata = {
  title: "instant.fun — The Spontaneous Photo Arena | Win USDC on Base",
  description:
    "The spontaneous photo arena. Real moments, candid feeds, and gasless community USDC rewards on Base.",
};

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <ScrollRevealProvider>
      <div className="scroll-smooth bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-fixed">
        {children}
      </div>
    </ScrollRevealProvider>
  );
}
