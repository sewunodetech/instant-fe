import type { ReactNode } from "react";
import { BackButton } from "@/components/layout/back-button";

/**
 * In-flow screen title (scrolls with content — no fixed top bar).
 * Large title on top-level tabs; pass `back` for pushed screens.
 */
export function ScreenHeader({
  title,
  subtitle,
  back,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Fallback href for the back button; omit on top-level tabs. */
  back?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-2 px-4 pt-4 pb-1">
      {back && (
        <div className="-ml-2">
          <BackButton fallbackHref={back} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h1
          className={`truncate font-extrabold tracking-[-0.02em] text-on-surface ${
            back ? "text-[1.375rem] leading-tight" : "text-[1.75rem] leading-[1.1]"
          }`}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 truncate text-body-sm text-on-surface-variant">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}

export const headerIconButton =
  "flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition-transform active:scale-90";
