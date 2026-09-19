import Link from "next/link";

function AppleIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 1.01-2.84-.89.04-1.98.6-2.61 1.34-.56.64-1.05 1.7-1.01 2.72 1 .08 2-.47 2.61-1.22z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M3.609 1.814L13.793 12 3.61 22.186a2.036 2.036 0 0 1-.362-1.187V3.001c0-.448.13-.865.361-1.187zm11.233 11.234l2.545-2.545-12.78-7.378 10.235 9.923zm0 1.895L4.607 24.871l12.78-7.378-2.545-2.549zm1.049-1.05l3.203-1.85a1.536 1.536 0 0 0 0-2.658l-3.203-1.85-1.748 1.749 1.748 1.749z" />
    </svg>
  );
}

export function FinalCtaSection() {
  return (
    <section className="bg-surface px-4 py-20 sm:px-6 lg:px-8">
      <div className="reveal-item mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-primary-fixed via-primary-container to-primary-fixed p-8 text-on-primary-fixed shadow-card sm:p-12 md:flex-row">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-extrabold tracking-wider text-slate-900 uppercase shadow-soft">
            Ready to Snap?
          </span>
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Join the Spontaneous Photo Arena.</h3>
          <p className="max-w-md text-sm font-semibold opacity-90">
            Launch instant.fun, catch tomorrow&apos;s random 2-minute drop, and win your first USDC pool split.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-3">
          <Link
            href="/home"
            className="badge-shimmer flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 active:scale-95"
          >
            <AppleIcon />
            <div className="text-left leading-tight">
              <p className="text-[8px] font-bold tracking-wider text-slate-300 uppercase">Download on</p>
              <p className="text-xs font-extrabold">App Store</p>
            </div>
          </Link>
          <Link
            href="/home"
            className="badge-shimmer flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-900 active:scale-95"
          >
            <PlayIcon />
            <div className="text-left leading-tight">
              <p className="text-[8px] font-bold tracking-wider text-slate-300 uppercase">Get it on</p>
              <p className="text-xs font-extrabold">Google Play</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
