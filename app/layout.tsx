import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/auth-provider";

/**
 * Plus Jakarta Sans is the brand typeface — `--font-sans` in globals.css
 * resolves to it. The full 400–800 range is loaded so weights like
 * `font-semibold` (600) render as real cuts instead of being synthesized.
 * Note: this family has no 900, so `font-extrabold` (800) is the heaviest
 * weight available — avoid `font-black` in the UI.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Pixel accent, used sparingly for retro numerals and badges. */
const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "instant.fun",
  description: "Snap. Join. Get Voted.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fcf9f8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased", jakarta.variable, pressStart.variable)}>
      <body className="min-h-full bg-surface font-sans text-body-md text-on-surface selection:bg-primary-container">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
