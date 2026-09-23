"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { UserAvatar } from "@/components/auth/user-avatar";
import { currentUser } from "@/lib/mock-data";

const navItems = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/campaigns", label: "Explore", icon: "explore" },
  { href: "/snap", label: "Create", icon: "photo_camera" },
  { href: "/activity", label: "Activity", icon: "notifications" },
  { href: "/profile", label: "Profile", icon: "person" },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-container/60 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="app-shell mx-auto flex h-16 items-center justify-between gap-4 px-margin sm:px-4 lg:px-6">
        <Link
          href="/home"
          aria-label="instant.fun home"
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
        </Link>

        <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(`${item.href}/`));
            const isCreate = item.href === "/snap";

            if (isCreate) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`ml-1 flex h-10 items-center gap-1.5 rounded-full px-4 text-label-md shadow-sm transition-all hover:brightness-105 active:scale-95 ${
                    active
                      ? "bg-secondary-container text-white"
                      : "bg-primary-container text-on-primary-fixed"
                  }`}
                >
                  <Icon name={item.icon} className="text-[18px]" />
                  {item.label}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center gap-1.5 rounded-full px-3.5 text-label-md transition-colors ${
                  active
                    ? "bg-primary-container/30 text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon name={item.icon} filled={active} className={`text-[18px] ${active ? "text-primary" : ""}`} />
                {item.label}
                {item.href === "/activity" && currentUser.hasUnread && !active && (
                  <span className="ml-0.5 h-2 w-2 rounded-full bg-error" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-space-xs">
          <Link
            href="/activity"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:hidden"
          >
            <Icon name="notifications" className="text-[24px]" />
            {currentUser.hasUnread && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-surface" />
            )}
          </Link>
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
