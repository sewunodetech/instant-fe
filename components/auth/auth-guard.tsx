"use client";

import { useEffect, type ReactNode } from "react";
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
 * While Privy is initializing (or the user is signed out) we hold a neutral
 * loading state and redirect unauthenticated visitors to /login.
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
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon name="bolt" filled className="text-[24px]" />
        </div>
        <p className="text-label-md text-on-surface-variant">
          {!ready ? "Starting…" : !authenticated ? "Redirecting…" : "Loading your session…"}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
