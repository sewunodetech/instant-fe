import Image from "next/image";
import { footerLinks, footerTabIcons } from "@/components/landing/content";

export function LandingFooter() {
  return (
    <footer id="download" className="border-t border-black/5 bg-surface-container-lowest">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 lg:px-8">
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
            <p className="max-w-xs text-body-sm text-on-surface-variant">
              The spontaneous photo arena. Built gasless on BNB Chain.
            </p>
          </div>

          <div className="flex items-center gap-4 text-on-surface-variant/70">
            {footerTabIcons.map(({ icon: Icon, title }) => (
              <span
                key={title}
                title={title}
                className="transition-colors hover:text-on-surface"
              >
                <Icon className="size-5" strokeWidth={2} aria-hidden />
                <span className="sr-only">{title}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-black/5 pt-6 text-body-sm text-on-surface-variant sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} instant.fun. Zero gallery uploads, guaranteed.</p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <a key={link.label} href={link.href} className="transition-colors hover:text-on-surface">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
