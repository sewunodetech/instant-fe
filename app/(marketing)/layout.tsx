import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "instant.fun — The Spontaneous Photo Arena | Win USDC on BNB Chain",
  description:
    "The spontaneous photo arena. Real moments, candid feeds, and gasless community USDC rewards on BNB Chain.",
};

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="scroll-smooth bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-fixed">
      {children}
    </div>
  );
}
