import Image from "next/image";
import { Icon } from "@/components/icon";

const tabIcons = [
  { icon: "home", title: "Home Feed" },
  { icon: "local_fire_department", title: "Campaigns" },
  { icon: "photo_camera", title: "Instant Camera" },
  { icon: "emoji_events", title: "Rewards" },
  { icon: "person", title: "Profile" },
];

const footerLinks = ["Privacy Policy", "Terms of Service", "BSC Smart Contract", "Safety Guidelines"];

export function LandingFooter() {
  return (
    <footer id="download" className="border-t border-slate-200/80 bg-surface-container-lowest pt-12 pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-slate-200/60 pb-8 md:flex-row">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="instant.fun" width={120} height={32} className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold text-slate-400">|</span>
            <p className="text-xs font-medium text-slate-600">Spontaneous photo arena • Built gasless on BNB Chain</p>
          </div>
          <div className="flex items-center gap-5 text-slate-400">
            {tabIcons.map((t) => (
              <Icon key={t.title} name={t.icon} className="cursor-pointer text-[20px] transition-colors hover:text-secondary" />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs font-medium text-slate-500 sm:flex-row">
          <p>© 2025 instant.fun. All rights reserved. Zero gallery uploads guaranteed.</p>
          <div className="flex items-center gap-6">
            {footerLinks.map((label) => (
              <a key={label} href="#" className="transition-colors hover:text-slate-900">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
