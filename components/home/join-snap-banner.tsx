import Link from "next/link";
import { Camera } from "lucide-react";

export function JoinSnapBanner({ title, poolUsdc }: { title: string; poolUsdc: number }) {
  return (
    <aside className="flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-primary-fixed via-primary-container to-primary-fixed p-4 text-on-primary-fixed shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-xs">
          <Camera size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-headline-sm leading-tight">{title}</span>
          <span className="text-body-sm opacity-90">Snap now &amp; compete for {poolUsdc} USDC.</span>
        </div>
      </div>
      <Link
        href="/snap"
        className="shrink-0 rounded-full bg-on-primary-fixed px-4 py-2 text-label-sm text-primary-fixed shadow-sm transition-transform active:scale-95"
      >
        Join Snap
      </Link>
    </aside>
  );
}
