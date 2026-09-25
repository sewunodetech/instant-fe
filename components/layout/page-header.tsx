import type { ReactNode } from "react";
import { BackButton } from "@/components/layout/back-button";

/**
 * Floating back/actions over an immersive (edge-to-edge) screen — no bar,
 * just glass buttons that sit on top of the hero.
 */
export function PageHeader({ actions, backHref }: { actions?: ReactNode; backHref?: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-safe">
      <div className="app-shell flex items-center justify-between px-3 pt-3">
        <div className="pointer-events-auto rounded-full bg-surface-container-lowest/85 shadow-soft backdrop-blur-md">
          <BackButton fallbackHref={backHref} />
        </div>
        {actions && (
          <div className="pointer-events-auto flex items-center gap-2 [&>*]:rounded-full [&>*]:bg-surface-container-lowest/85 [&>*]:shadow-soft [&>*]:backdrop-blur-md">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function HeaderIconButton({ label, children, onClick }: { label: string; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-transform active:scale-90"
    >
      {children}
    </button>
  );
}
