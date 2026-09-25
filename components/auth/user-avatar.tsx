"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { RemoteImage } from "@/components/ui/remote-image";
import { initialsOf, nameOf } from "@/lib/format";
import type { PublicUser } from "@/lib/types";

type AvatarUser = Pick<PublicUser, "avatarUrl" | "displayName" | "username" | "walletAddress">;

/** Round avatar for any user: uploaded photo, else initials on the brand gradient. */
export function Avatar({
  user,
  size = 32,
  className = "",
}: {
  user: AvatarUser | null | undefined;
  size?: number;
  className?: string;
}) {
  if (user?.avatarUrl) {
    return (
      <RemoteImage
        src={user.avatarUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full bg-surface-container object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary-container to-secondary font-bold text-on-secondary ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {initialsOf(nameOf(user))}
    </span>
  );
}

/** Signed-in user's avatar linking to their profile. */
export function UserAvatar({ size = 32, className }: { size?: number; className?: string }) {
  const { user } = useAuth();
  return (
    <Link
      href={user ? "/profile" : "/login"}
      aria-label={user ? "Your profile" : "Sign in"}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 ${className ?? ""}`}
    >
      <Avatar user={user} size={size} className="ring-2 ring-secondary-container/40" />
    </Link>
  );
}
