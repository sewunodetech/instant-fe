"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_ENTRY_HREF, navLinks } from "@/components/landing/content";

export function LandingNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-4 sm:px-6"
    >
      <nav
        className={cn(
          "pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full px-3 py-2 transition-all duration-300 sm:px-4",
          scrolled
            ? "border border-black/5 bg-surface-container-lowest/80 shadow-soft backdrop-blur-xl"
            : "border border-transparent bg-transparent",
        )}
      >
        <Link
          href="/"
          aria-label="instant.fun home"
          className="group flex shrink-0 items-center rounded-full px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
        >
          <Image
            src="/brand/logo.png"
            alt="instant.fun"
            width={120}
            height={32}
            priority
            className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            >
              <Icon className="size-4" strokeWidth={2.2} aria-hidden />
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={APP_ENTRY_HREF}
            className="group flex items-center gap-1.5 rounded-full bg-on-surface px-4 py-2 text-[13px] font-bold text-surface transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            Launch App
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2.4}
              aria-hidden
            />
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
