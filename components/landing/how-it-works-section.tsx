import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, Parallax, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { steps } from "@/components/landing/content";

/** Alternating scroll drift so the four cards don't move in lockstep. */
const cardDrift = [70, 30, 55, 20];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-body-sm font-bold tracking-wider text-secondary uppercase">
            Simple, fair &amp; gasless
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Four steps from moment to reward
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-pretty text-on-surface-variant sm:text-lg">
            The same transparent loop you get the moment you open the app.
          </p>
        </FadeIn>

        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <StaggerItem key={step.title} className={cn(i === 0 && "md:col-span-2 lg:col-span-1")}>
              <Parallax distance={cardDrift[i] ?? 40} className="h-full">
                <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-black/5 bg-surface-container-lowest p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-body-sm font-extrabold text-on-surface-variant/50">0{i + 1}</span>
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-container/70 text-on-primary-fixed transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <step.icon className="size-5" strokeWidth={2.2} aria-hidden />
                      </div>
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight text-on-surface">{step.title}</h3>
                    <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">{step.body}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 border-t border-black/5 pt-4 text-body-sm font-bold text-tertiary">
                    <CheckCircle2 className="size-4" strokeWidth={2.4} aria-hidden />
                    {step.tag}
                  </div>
                </article>
              </Parallax>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
