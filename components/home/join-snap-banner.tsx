import Link from "next/link";
import { Camera } from "lucide-react";

export function JoinSnapBanner({ title, poolUsdc }: { title: string; poolUsdc: number }) {
  return (
    <aside className="flex w-full items-center justify-between gap-3 rounded-3xl border-2 border-on-surface/10 bg-gradient-to-r from-primary-fixed via-primary-container to-primary-fixed p-4 text-on-primary-fixed shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm">
          <Camera size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-headline-sm leading-tight font-extrabold tracking-tight">{title}</span>
          <span className="text-body-sm opacity-90">Snap now &amp; compete for {poolUsdc} USDC.</span>
        </div>
      </div>
      <Link
        href="/snap"
        className="shrink-0 rounded-full bg-on-surface px-4 py-2.5 text-label-sm font-bold text-surface shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
      >
        Join Snap
      </Link>
    </aside>
  );
}
