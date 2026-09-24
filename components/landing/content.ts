/**
 * Single source of truth for the marketing landing page content.
 * Keeping copy + data here (instead of inline in each section) keeps the
 * section components small, declarative, and easy to maintain.
 */

import type React from "react";
import type { LucideIcon } from "lucide-react";
import { Camera, Coins, Flame, Home, Sparkles, Trophy, Users, Vote, Zap } from "lucide-react";
import { DiscordIcon, TelegramIcon, XIcon } from "@/components/landing/social-icons";

/** Where the "Launch App" CTA and campaign CTAs send the visitor. */
export const APP_ENTRY_HREF = "/home";

export type NavLink = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "#what-is-it", icon: Sparkles, label: "What is it?" },
  { href: "#how-it-works", icon: Zap, label: "How it works" },
  { href: "#community", icon: Users, label: "Community" },
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Accent theme index into the shared toy palette (0-based). */
  theme: number;
};

/**
 * The three product pillars — the "what is instant.fun" explainer.
 * Drawn from the campaign flow: real live camera, gasless votes, on-chain payouts.
 */
export const features: Feature[] = [
  {
    icon: Camera,
    title: "Live camera only",
    body: "No gallery, no edits, no AI. Every entry is shot live in a 2-minute window, with hardware timestamps that lock out fakes.",
    theme: 0,
  },
  {
    icon: Vote,
    title: "Gasless USDC votes",
    body: "Back your favorite snaps with one-tap votes. Gas is fully sponsored, so it costs you $0 to help a moment rise.",
    theme: 1,
  },
  {
    icon: Coins,
    title: "Instant on-chain payouts",
    body: "When a drop ends, creators take 60% of the pool and the voters who backed them split 40% — settled on BNB Chain instantly.",
    theme: 3,
  },
];

export type Step = {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
};

export const steps: Step[] = [
  {
    icon: Zap,
    title: "Join a live campaign",
    body: "Pick a live drop like #SummerVibes or #CampusVibes. Free to enter, backed by a real USDC prize pool on BNB Chain.",
    tag: "Free to enter",
  },
  {
    icon: Camera,
    title: "Snap in the 2-minute window",
    body: "Live camera only. Hardware timestamps lock out gallery uploads, edits, and AI fakes — every entry is a real moment.",
    tag: "No gallery, no edits",
  },
  {
    icon: Vote,
    title: "The community votes",
    body: "Everyone backs their favorite snaps with one-tap gasless USDC votes. The most-loved moments rise to the top.",
    tag: "$0 gas, sponsored",
  },
  {
    icon: Coins,
    title: "Winners take the pool",
    body: "When the campaign ends, top creators take 60% of the prize pool and the voters who backed them split 40% — settled on-chain instantly.",
    tag: "60% creators · 40% voters",
  },
];

export type Campaign = {
  tag: string;
  image: string;
  imageAlt: string;
  pool: string;
  location: string;
  creators: string;
  daysLeft: string;
  title: string;
  body: string;
  voterShare: string;
  featured?: boolean;
};

export const campaigns: Campaign[] = [
  {
    tag: "#SummerVibes",
    image: "/mock/campaigns/summer-vibes.jpg",
    imageAlt: "Friends enjoying summer by the beach",
    pool: "250 USDC",
    location: "Malibu Beach Cafe",
    creators: "1.2k creators",
    daysLeft: "5 days left",
    title: "Sunshine, iced drinks & laughter",
    body: "Snap raw moments with friends outdoors enjoying the summer sun. Zero filters permitted.",
    voterShare: "~$38 USDC",
    featured: true,
  },
  {
    tag: "#CityLife",
    image: "/mock/campaigns/city-life.jpg",
    imageAlt: "Creator exploring the city",
    pool: "150 USDC",
    location: "Downtown Market",
    creators: "843 creators",
    daysLeft: "3 days left",
    title: "Street corner discoveries",
    body: "Unplanned city strolls, street food spots, and authentic candid city bustle.",
    voterShare: "~$22 USDC",
  },
  {
    tag: "#CampusVibes",
    image: "/mock/campaigns/best-friends.jpg",
    imageAlt: "Friends on campus at golden hour",
    pool: "300 USDC",
    location: "University Quad",
    creators: "1.4k creators",
    daysLeft: "7 days left",
    title: "Between classes & golden hour",
    body: "Post-lecture walks and sunset laughs with your favorite study buddy.",
    voterShare: "~$45 USDC",
  },
];

export type Rank = {
  place: number;
  avatar: string;
  handle: string;
  meta: string;
  amount: string;
};

/** Recent campaign winners (creators who won their drop's prize pool). */
export const leaderboard: Rank[] = [
  {
    place: 1,
    avatar: "/mock/leaderboard/avatar-1.jpg",
    handle: "@maya_beachlife",
    meta: "#SummerVibes · 342 votes",
    amount: "+80.00 USDC",
  },
  {
    place: 2,
    avatar: "/mock/leaderboard/avatar-2.jpg",
    handle: "@elena_glow",
    meta: "#BestFriends · 298 votes",
    amount: "+45.00 USDC",
  },
  {
    place: 3,
    avatar: "/mock/leaderboard/avatar-3.jpg",
    handle: "@kiran_vibe",
    meta: "#CityLife · 215 votes",
    amount: "+25.00 USDC",
  },
];

export type CommunityLink = {
  label: string;
  handle: string;
  href: string;
  theme: string;
  /** Brand glyph for the link. */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const communityLinks: CommunityLink[] = [
  { label: "Discord", handle: "Join the arena chat", href: "#", theme: "bg-[#5865F2]", icon: DiscordIcon },
  { label: "X / Twitter", handle: "@instantfun", href: "#", theme: "bg-[#1c1b1b]", icon: XIcon },
  { label: "Telegram", handle: "instant.fun community", href: "#", theme: "bg-[#229ED9]", icon: TelegramIcon },
];

export type FooterLink = { label: string; href: string };

export const footerLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "BNB Chain Contract", href: "#" },
  { label: "Safety Guidelines", href: "#" },
];

export const footerTabIcons: { icon: LucideIcon; title: string }[] = [
  { icon: Home, title: "Home feed" },
  { icon: Flame, title: "Campaigns" },
  { icon: Camera, title: "Instant camera" },
  { icon: Trophy, title: "Rewards" },
  { icon: Users, title: "Community" },
];
