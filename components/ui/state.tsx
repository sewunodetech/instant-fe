import Link from "next/link";
import type { ReactNode } from "react";
import { CloudOff, RefreshCw } from "lucide-react";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  const actionClass =
    "mt-1 rounded-full bg-on-surface px-5 py-2.5 text-label-md font-bold text-surface shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95";
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-8 text-center shadow-soft">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container text-on-surface-variant">
        {icon}
      </div>
      <p className="text-headline-sm font-extrabold tracking-tight">{title}</p>
      {body && <p className="max-w-[260px] text-body-sm text-on-surface-variant">{body}</p>}
      {action &&
        (action.href ? (
          <Link href={action.href} className={actionClass}>
            {action.label}
          </Link>
        ) : (
          <button type="button" onClick={action.onClick} className={actionClass}>
            {action.label}
          </button>
        ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-3xl border-2 border-error/20 bg-error-container/30 p-6 text-center"
    >
      <CloudOff size={24} className="text-error" />
      <p className="text-body-sm text-on-surface">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-4 py-2 text-label-sm shadow-sm active:scale-95"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadMore({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="mx-auto flex h-11 items-center gap-2 rounded-full bg-surface-container-lowest px-5 text-label-md shadow-soft transition-transform active:scale-95 disabled:opacity-60"
    >
      {loading && <RefreshCw size={16} className="animate-spin" />}
      {loading ? "Loading…" : "Load more"}
    </button>
  );
}
