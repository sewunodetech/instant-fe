import Image from "next/image";
import { cn } from "@/lib/utils";
import { DoodleField } from "@/components/landing/pixel-doodles";
import { footerLinks, footerTabIcons } from "@/components/landing/content";

/** Playful colored chips for the quick-nav icons, echoing the toy palette. */
const iconThemes = [
  "bg-secondary",
  "bg-[#4a90d9]",
  "bg-[#eb6f6f]",
  "bg-[#f2c94c] !text-[#3d3630]",
  "bg-[#6fcf70]",
];

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-black/5 bg-surface">
      <DoodleField
        items={[
          { name: "star", className: "left-[4%] top-[24%]", size: 34, rotate: -12, duration: 6 },
          { name: "controller", className: "right-[6%] top-[20%]", size: 36, rotate: 10, duration: 7, delay: 0.6 },
          { name: "coin", className: "right-[22%] bottom-[26%]", size: 30, rotate: 8, duration: 6.5, delay: 1 },
        ]}
        className="hidden lg:block"
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt="instant.fun"
              width={120}
              height={32}
              className="h-7 w-auto object-contain"
            />
            <span className="h-4 w-px bg-black/10" />
            <p className="max-w-xs text-body-sm font-medium text-on-surface-variant">
              The spontaneous photo arena. Built gasless on BNB Chain.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {footerTabIcons.map(({ icon: Icon, title }, i) => (
              <span
                key={title}
                title={title}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl text-white shadow-soft transition-transform hover:-translate-y-0.5 hover:rotate-6",
                  iconThemes[i % iconThemes.length],
                )}
              >
                <Icon className="size-4.5" strokeWidth={2.2} aria-hidden />
                <span className="sr-only">{title}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-6 text-body-sm text-on-surface-variant sm:flex-row sm:items-center">
          <p className="font-medium">
            © {new Date().getFullYear()} instant.fun · Live shutter only, zero gallery
            uploads.
          </p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-semibold transition-colors hover:text-secondary"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
