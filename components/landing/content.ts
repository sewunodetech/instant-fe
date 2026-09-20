/**
 * Single source of truth for the marketing landing page content.
 * Keeping copy + data here (instead of inline in each section) keeps the
 * section components small, declarative, and easy to maintain.
 */

import type { LucideIcon } from "lucide-react";
import {
  Camera,
  Coins,
  Flame,
  HelpCircle,
  Home,
  Lock,
  Sparkles,
  Timer,
  Trophy,
  Users,
  Vote,
  Zap,
} from "lucide-react";

/** Where the "Launch App" CTA and campaign CTAs send the visitor. */
export const APP_ENTRY_HREF = "/home";

export type NavLink = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "#how-it-works", icon: HelpCircle, label: "How it works" },
  { href: "#campaigns", icon: Flame, label: "Live drops" },
  { href: "#rewards", icon: Trophy, label: "Rewards" },
];

export type Stat = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export const stats: Stat[] = [
  { label: "USDC paid to creators", value: 128000, prefix: "$", suffix: "+" },
  { label: "Verified creators", value: 42000, suffix: "+" },
  { label: "Live campaigns", value: 36 },
  { label: "Gas paid by you", value: 0, prefix: "$" },
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
    title: "Join a campaign",
    body: "Explore live drops like #SummerVibes or #CampusVibes. Free to enter, backed by verified USDC vaults on BNB Chain.",
    tag: "Instant free entry",
  },
  {
    icon: Camera,
    title: "2-minute shutter window",
    body: "Live camera captures only. Hardware timestamps lock out gallery uploads, edited photos, and AI deepfakes.",
    tag: "Zero gallery imports",
  },
  {
    icon: Vote,
    title: "Community micro-vote",
    body: "Back your favorite moments with one-tap gasless USDC votes. Your vote power renews daily with streak bonuses.",
    tag: "$0.00 gas, sponsored",
  },
  {
    icon: Coins,
    title: "Win & split the pool",
    body: "Winners take 60% of the vault while voters split 40%. Smart contracts settle straight to your BNB Chain wallet.",
    tag: "60% creator · 40% voter",
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

/** Icons re-exported for sections that need a couple of extras. */
export const icons = {
  Sparkles,
  Timer,
  Lock,
  Trophy,
  Zap,
  Coins,
  Users,
  Flame,
  Camera,
  Vote,
};
