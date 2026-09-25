import { Camera, Heart, Trophy } from "lucide-react";
import { rankPill } from "@/components/ui/rank";
import { ordinal, usdc } from "@/lib/format";

const steps = [
  {
    icon: Camera,
    iconBg: "bg-secondary-container text-on-secondary",
    title: "Snap live",
    body: "Capture a fresh photo with the in-app camera and post it to the campaign.",
  },
  {
    icon: Heart,
    iconBg: "bg-tertiary-fixed text-on-tertiary-fixed",
    title: "Get voted",
    body: "Everyone gets one free vote per snap. Supporters can also tip you USDC directly.",
  },
  {
    icon: Trophy,
    iconBg: "bg-primary-container text-on-primary-container",
    title: "Win the pool",
    body: "When the timer ends, the top 3 snaps by votes are announced as winners.",
  },
];

export function HowItWorks({
  rules,
  prizePool,
  prizeSplit,
  maxPostsPerUser,
}: {
  rules: string[];
  prizePool: number;
  prizeSplit: number[];
  maxPostsPerUser: number;
}) {
  return (
    <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
      <h3 className="mb-space-md text-headline-sm font-extrabold tracking-tight">How it works</h3>
      <ol className="flex flex-col gap-space-sm">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex items-start gap-space-md rounded-2xl bg-surface-container-low p-space-sm">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${step.iconBg}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-label-sm text-secondary">STEP {String(i + 1).padStart(2, "0")}</div>
                <h4 className="mb-0.5 text-[15px] leading-snug font-bold">{step.title}</h4>
                <p className="text-body-sm text-on-surface-variant">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {prizePool > 0 && (
        <div className="mt-space-md grid grid-cols-3 gap-space-xs">
          {prizeSplit.map((share, i) => (
            <div key={i} className={`flex flex-col items-center rounded-2xl p-2.5 text-center ${rankPill(i + 1)}`}>
              <span className="text-label-sm opacity-80">{ordinal(i + 1)}</span>
              <span className="text-label-lg font-extrabold tabular-nums">
                {usdc(Math.round(prizePool * share * 100) / 100)}
              </span>
              <span className="text-[10px] opacity-80">USDC</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-space-md rounded-2xl bg-surface-container-low p-space-sm">
        <p className="mb-1.5 text-label-md">Rules</p>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-on-surface-variant">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
          <li>
            Up to {maxPostsPerUser} {maxPostsPerUser === 1 ? "snap" : "snaps"} per creator.
          </li>
          <li>Ties are broken by whoever posted first.</li>
        </ul>
      </div>
    </section>
  );
}
