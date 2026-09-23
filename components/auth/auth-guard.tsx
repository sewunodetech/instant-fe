"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Icon } from "@/components/icon";

type Props = {
  children: ReactNode;
  /** Where to send signed-in users who still need to pick a username. */
  profileHref?: string;
};

/**
 * Client-side session gate for app pages.
 * While Privy is initializing (or the user is signed out) we hold a branded
 * splash and redirect unauthenticated visitors to /login.
 */
export function AuthGuard({ children, profileHref = "/login" }: Props) {
  const { ready, authenticated, needsProfile, isSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }
    if (needsProfile) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`${profileHref}${next}`);
    }
  }, [ready, authenticated, needsProfile, pathname, router, profileHref]);

  if (!ready || !authenticated || isSyncing || (authenticated && needsProfile)) {
    const status = !ready
      ? "Starting up…"
      : !authenticated
        ? "Redirecting to sign in…"
        : "Loading your session…";

    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-5 overflow-hidden bg-surface">
        {/* Soft brand glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-container/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 rounded-full bg-secondary-container/15 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-container text-on-primary-container shadow-pop-yellow">
              <Icon name="bolt" filled className="text-[32px]" />
            </div>
            <span
              aria-hidden
              className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-secondary-container ring-2 ring-surface"
            />
            <span
              aria-hidden
              className="absolute -bottom-0.5 -left-1 h-2.5 w-2.5 rounded-full bg-tertiary ring-2 ring-surface"
            />
          </div>

          <Image
            src="/brand/logo.png"
            alt="instant.fun"
            width={140}
            height={36}
            priority
            className="h-9 w-auto opacity-90"
          />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-container [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary-container [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-tertiary" />
          </div>

          <p className="text-label-md text-on-surface-variant">{status}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
