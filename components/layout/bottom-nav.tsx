"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Camera, Compass, Home, User, type LucideIcon } from "lucide-react";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
  shutter?: boolean;
};

const tabs: Tab[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/campaigns", label: "Explore", icon: Compass },
  { href: "/snap", label: "Create", icon: Camera, shutter: true },
  { href: "/activity", label: "Activity", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-container/60 bg-surface/90 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
    >
      <div className="app-shell mx-auto">
        <div className="relative flex h-20 items-center justify-around px-space-xs">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const TabIcon = tab.icon;

            if (tab.shutter) {
              return (
                <div key={tab.href} className="relative -top-5 flex flex-col items-center">
                  <Link
                    href={tab.href}
                    aria-label={tab.label}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary shadow-shutter ring-4 ring-surface transition-transform hover:brightness-105 active:scale-95"
                  >
                    <TabIcon size={28} />
                  </Link>
                  <span className="mt-1 text-label-sm text-on-surface-variant">{tab.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-2xl transition-all ${
                  active
                    ? "bg-primary-container/25 text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container/70 hover:text-on-surface"
                }`}
              >
                <TabIcon
                  size={24}
                  fill={active ? "currentColor" : "none"}
                  className={active ? "text-primary" : ""}
                />
                <span className="text-label-sm">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
