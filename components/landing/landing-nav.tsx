import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";

const navLinks = [
  { href: "#feed-preview", icon: "home", label: "Home Feed" },
  { href: "#campaigns", icon: "local_fire_department", label: "Active Drops" },
  { href: "#rewards", icon: "emoji_events", label: "Leaderboard" },
  { href: "#rewards", icon: "savings", label: "Rewards Pool" },
  { href: "#how-it-works", icon: "help_outline", label: "How It Works" },
];

export function LandingNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
      <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-slate-200/80 bg-surface-container-lowest/90 px-4 py-2.5 shadow-card backdrop-blur-xl transition-all sm:px-6">
        <Link href="/" aria-label="instant.fun home" className="group flex shrink-0 items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt="instant.fun"
            width={120}
            height={32}
            priority
            className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-[13px] font-bold text-slate-600 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 transition-colors duration-200 hover:text-secondary"
            >
              <Icon name={item.icon} className="text-[18px]" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="badge-shimmer group flex items-center gap-2 rounded-full bg-primary-container px-4 py-2 text-xs font-bold text-on-primary-fixed shadow-sm transition-all duration-200 hover:bg-primary-fixed hover:shadow-pop-yellow active:scale-95"
          >
            <span className="hidden sm:inline">Launch App</span>
            <Icon
              name="arrow_forward"
              className="text-[16px] transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
