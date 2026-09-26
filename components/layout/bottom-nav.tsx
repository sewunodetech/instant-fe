"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Bell, Camera, Compass, House, UserRound, type LucideIcon } from "lucide-react";

type Tab = { href: string; label: string; icon: LucideIcon; match?: string[] };

const left: Tab[] = [
  { href: "/home", label: "Home", icon: House, match: ["/snaps"] },
  { href: "/campaigns", label: "Explore", icon: Compass },
];
const right: Tab[] = [
  { href: "/activity", label: "Activity", icon: Bell },
  { href: "/profile", label: "Me", icon: UserRound, match: ["/wallet"] },
];

function isActive(pathname: string, tab: Tab) {
  return [tab.href, ...(tab.match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className="group relative isolate flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors active:bg-on-surface/5"
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          aria-hidden
          className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-2xl bg-secondary-container/12"
          transition={{ type: "spring", stiffness: 480, damping: 34 }}
        />
      )}
      <Icon
        size={24}
        strokeWidth={active ? 2.4 : 2}
        className={`transition-all duration-200 ${active ? "-translate-y-0.5 text-secondary" : "text-on-surface-variant"}`}
      />
      <span
        className={`text-[11px] leading-none transition-colors ${active ? "font-bold text-secondary" : "font-semibold text-on-surface-variant"}`}
      >
        {tab.label}
      </span>
    </Link>
  );
}

/** Floating dock with a raised shutter — the app's primary action. */
export function BottomNav() {
  const pathname = usePathname();
  const snapActive = pathname === "/snap";

  return (
    <nav
      aria-label="Main"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.625rem)]"
    >
      <div className="app-shell pointer-events-auto relative flex items-center rounded-[1.75rem] bg-surface-container-lowest/90 px-1.5 shadow-[0_10px_30px_-6px_rgba(15,23,42,0.22)] ring-1 ring-on-surface/[0.06] backdrop-blur-xl">
        {left.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}

        <div className="flex flex-1 justify-center">
          <Link
            href="/snap"
            aria-label="Post a snap"
            aria-current={snapActive ? "page" : undefined}
            className="relative isolate -mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary shadow-shutter ring-[5px] ring-surface transition-transform active:scale-90"
          >
            {!snapActive && (
              <span aria-hidden className="animate-ping-soft absolute inset-0 -z-10 rounded-full bg-secondary-container" />
            )}
            <span aria-hidden className="absolute inset-1.5 rounded-full border-2 border-white/35" />
            <Camera size={26} strokeWidth={2.4} />
          </Link>
        </div>

        {right.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab)} />
        ))}
      </div>
    </nav>
  );
}
