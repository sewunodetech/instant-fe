"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

type Props = {
  size?: number;
  className?: string;
};

function initials(name: string) {
  return name
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({ size = 32, className }: Props) {
  const { user } = useAuth();
  const href = user ? "/profile" : "/login";
  const src = user?.avatarUrl;
  const label = user?.displayName || user?.username || "You";

  return (
    <Link
      href={href}
      aria-label="Profile"
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-90 ${className ?? ""}`}
    >
      {src ? (
        <Image src={src} alt="" width={size} height={size} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <span
          className="flex items-center justify-center rounded-full bg-secondary-container text-label-sm text-on-secondary"
          style={{ width: size, height: size }}
        >
          {initials(label) || "?"}
        </span>
      )}
    </Link>
  );
}
