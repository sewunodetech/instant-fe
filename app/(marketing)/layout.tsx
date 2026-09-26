import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "instant.fun — The Spontaneous Photo Arena | Win BNB on BNB Chain",
  description:
    "The spontaneous photo arena. Real moments, candid feeds, free community votes, and BNB prize pools on BNB Chain.",
};

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="scroll-smooth bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-fixed">
      {children}
    </div>
  );
}
