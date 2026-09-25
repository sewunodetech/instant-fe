"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

type Props = {
  size?: number;
  className?: string;
  /** Hide the link chrome (use just the face). */
  bare?: boolean;
};

function initials(name: string) {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({ size = 32, className, bare }: Props) {
  const { user } = useAuth();
  const href = user ? "/profile" : "/login";
  const src = user?.avatarUrl;
  const label = user?.displayName || user?.username || "You";
  const px = size;

  const face = src ? (
    <Image
      src={src}
      alt=""
      width={px}
      height={px}
      className="rounded-full object-cover ring-2 ring-secondary-container/50"
      style={{ width: px, height: px }}
    />
  ) : (
    <span
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-secondary-container to-secondary font-bold text-on-secondary shadow-sm ring-2 ring-secondary-container/40"
      style={{ width: px, height: px, fontSize: Math.max(11, px * 0.34) }}
    >
      {initials(label) || <User size={18} />}
    </span>
  );

  if (bare) {
    return <span className={`inline-flex ${className ?? ""}`}>{face}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={user ? "Profile" : "Sign in"}
      className={`group flex h-11 w-11 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 ${className ?? ""}`}
    >
      {face}
    </Link>
  );
}
