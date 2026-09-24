import { Flame } from "lucide-react";

type Props = {
  days: number;
  bonusPct: number;
  power: { left: number; max: number };
};

export function StreakBanner({ days, bonusPct, power }: Props) {
  const pct = Math.round((power.left / power.max) * 100);

  return (
    <div className="flex items-center justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex min-w-0 items-center gap-space-sm">
        <div className="flex h-11 w-11 shrink-0 animate-pulse-glow items-center justify-center rounded-full bg-primary-container/30 text-primary">
          <Flame size={26} fill="currentColor" />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-headline-sm">{days}-Day Streak</span>
            <span className="rounded-full bg-primary-container px-1.5 py-0.5 text-[10px] font-bold text-on-primary-fixed">
              +{bonusPct}% Bonus
            </span>
          </div>
          <p className="truncate text-body-sm text-on-surface-variant">
            Extra USDC dividend on every vote today
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end pl-2">
        <span className="text-label-sm tabular-nums">
          {power.left}/{power.max}
        </span>
        <div
          role="meter"
          aria-label="Vote power left"
          aria-valuenow={power.left}
          aria-valuemin={0}
          aria-valuemax={power.max}
          className="mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-surface-container"
        >
          <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
        </div>
        <span className="mt-0.5 text-[9px] font-bold text-on-surface-variant">Power left</span>
      </div>
    </div>
  );
}
