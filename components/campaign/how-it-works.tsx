import { Icon } from "@/components/icon";

const steps = [
  {
    icon: "waving_hand",
    iconBg: "bg-primary-fixed text-on-primary-fixed",
    stepColor: "text-on-primary-container",
    title: "Join the Campaign",
    body: "Tap Join and get your camera shutter primed.",
  },
  {
    icon: "photo_camera",
    iconBg: "bg-secondary-fixed text-on-secondary-fixed",
    stepColor: "text-secondary",
    title: "Create Content",
    body: "Take a fresh photo (instant capture only!) and submit instantly.",
  },
  {
    icon: "favorite",
    filled: true,
    iconBg: "bg-tertiary-fixed text-on-tertiary-fixed",
    stepColor: "text-tertiary",
    title: "Get Voted",
    body: "Users vote with micro-USDC. Top creator + voters win together!",
  },
];

export function HowItWorks() {
  return (
    <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="mb-space-md flex items-center justify-between">
        <h3 className="text-headline-sm">How it works</h3>
        <button className="flex items-center gap-0.5 text-label-sm text-secondary">
          Rules <Icon name="chevron_right" className="text-[14px]" />
        </button>
      </div>
      <ol className="flex flex-col gap-space-sm">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-space-md rounded-2xl bg-surface-container-low p-space-sm">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm ${step.iconBg}`}>
              <Icon name={step.icon} filled={step.filled} className="text-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={`mb-0.5 text-label-sm ${step.stepColor}`}>STEP {String(i + 1).padStart(2, "0")}</div>
              <h4 className="mb-0.5 text-[15px] leading-snug font-bold">{step.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
