import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
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
    <html lang="en" className={cn("h-full", "antialiased", jakarta.variable, "font-sans", geist.variable, pressStart.variable)}>
      <head>
      </head>
      <body className="min-h-full bg-surface font-sans text-body-md text-on-surface selection:bg-primary-container">
        {children}
      </body>
    </html>
  );
}
