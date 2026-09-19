import { Icon } from "@/components/icon";

type Step = {
  step: string;
  icon: string;
  title: string;
  body: string;
  footerIcon?: string;
  footerDot?: boolean;
  footerLabel: string;
  footerIconClass?: string;
  iconBg: string;
};

const steps: Step[] = [
  {
    step: "Step 01",
    icon: "bolt",
    title: "Join The Campaign",
    body: "Explore active drops like #SummerVibes or #CampusVibes. Free to enter for everyone, backed by verified USDC vaults on BNB Chain.",
    footerDot: true,
    footerLabel: "Instant Free Entry",
    iconBg: "bg-primary-container text-on-primary-fixed",
  },
  {
    step: "Step 02",
    icon: "photo_camera",
    title: "2-Minute Shutter Window",
    body: "Live camera captures only. Hardware timestamps lock out gallery uploads, photoshopped images, and AI deepfakes forever.",
    footerIcon: "lock",
    footerIconClass: "text-secondary-container",
    footerLabel: "Zero Gallery Imports",
    iconBg: "bg-secondary-container text-white",
  },
  {
    step: "Step 03",
    icon: "how_to_vote",
    title: "Community Micro-Vote",
    body: "Back favorite moments with 1-tap gasless USDC voting pills. Your vote power renews daily with active streak bonuses.",
    footerIcon: "electric_bolt",
    footerIconClass: "text-emerald-600",
    footerLabel: "0.00 Gas Sponsored",
    iconBg: "bg-primary-container text-on-primary-fixed",
  },
  {
    step: "Step 04",
    icon: "savings",
    title: "Win & Split USDC Pools",
    body: "Winners take 60% of the vault while community voters split 40%. Smart contracts disburse funds directly to your BNB Chain wallet.",
    footerIcon: "trophy",
    footerIconClass: "text-amber-500",
    footerLabel: "60% Creator / 40% Voter",
    iconBg: "bg-emerald-500 text-white",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-slate-200/60 bg-surface-container-lowest py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-item mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-3 inline-block rounded-full bg-primary-container px-3.5 py-1.5 text-xs font-extrabold tracking-wider text-on-primary-fixed uppercase shadow-soft">
            Simple, Fair &amp; Gasless
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">How instant.fun Works</h2>
          <p className="mt-3 text-base font-medium text-slate-600 sm:text-lg">
            Experience the same transparent 4-step loop as after opening the mobile app.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="reveal-item interactive-card group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-surface p-6 shadow-soft transition-all hover:shadow-card"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">{s.step}</span>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl font-black transition-transform duration-300 group-hover:scale-110 ${s.iconBg}`}>
                    <Icon name={s.icon} className="text-[22px]" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-extrabold text-slate-900">{s.title}</h3>
                <p className="text-xs leading-relaxed font-medium text-slate-600 sm:text-sm">{s.body}</p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 border-t border-slate-200/60 pt-3 text-[11px] font-bold text-slate-500">
                {s.footerDot ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                ) : (
                  <Icon name={s.footerIcon!} className={`text-[14px] ${s.footerIconClass}`} />
                )}
                <span>{s.footerLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
