"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { currentUser } from "@/lib/mock-data";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-container/60 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="app-shell mx-auto flex h-16 items-center justify-between gap-4 px-margin sm:px-4">
        <Link
          href="/home"
          aria-label="instant.fun home"
          className="shrink-0 transition-opacity hover:opacity-80"
        >
          <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} priority className="h-8 w-auto" />
        </Link>

        <div className="flex shrink-0 items-center gap-space-xs">
          <Link
            href="/activity"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Bell size={24} />
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
