import type { PublicUser } from "@/lib/types";

/** 1200 -> "1.2k", 950 -> "950" */
export function compactNumber(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })
    .format(n)
    .toLowerCase();
}

/** 12 -> "12", 12.5 -> "12.50" */
export function usdc(n: number) {
  return n.toLocaleString("en", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function shortAddress(address?: string | null) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Path segment used for /u/[handle] links. */
export function profileKey(user: Pick<PublicUser, "id" | "username">) {
  return user.username || user.id;
}

export function handleOf(user?: Pick<PublicUser, "username" | "walletAddress"> | null) {
  if (user?.username) return user.username;
  return shortAddress(user?.walletAddress) ?? "creator";
}

export function nameOf(user?: Pick<PublicUser, "displayName" | "username" | "walletAddress"> | null) {
  return user?.displayName || handleOf(user);
}

export function initialsOf(name: string) {
  return (
    name
      .split(/[\s_.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/** "Summer Vibes" -> "#SummerVibes" */
export function campaignTag(title: string) {
  const cleaned = title.replace(/^#/, "").replace(/[^\p{L}\p{N}]+/gu, "");
  return `#${cleaned.slice(0, 28) || "Challenge"}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

/** "3d 4h left", "5h left", "12m left" — or null once passed. */
export function timeLeft(endsAt: string | null | undefined) {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const mins = Math.floor(ms / 60_000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  if (days > 0) return hours > 0 ? `${days}d ${hours}h left` : `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return `${Math.max(1, mins)}m left`;
}

export function endsWithinHours(endsAt: string | null | undefined, hours: number) {
  if (!endsAt) return false;
  const ms = new Date(endsAt).getTime() - Date.now();
  return ms > 0 && ms <= hours * 3_600_000;
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
