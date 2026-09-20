import { NumberTicker } from "@/components/ui/number-ticker";
import { FadeIn, Parallax, Stagger, StaggerItem } from "@/components/landing/motion-primitives";
import { stats } from "@/components/landing/content";

export function StatsSection() {
  return (
    <section className="border-y border-black/5 bg-surface-container-lowest px-4 py-16 sm:px-6 lg:px-8">
      <Parallax distance={40} className="mx-auto max-w-5xl">
        <FadeIn className="mx-auto mb-10 max-w-xl text-center">
          <p className="text-body-sm font-bold tracking-wider text-secondary uppercase">
            Real economic upside
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
            Numbers the community can verify on-chain
          </h2>
        </FadeIn>

        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <div className="flex items-baseline justify-center text-3xl font-black tracking-tight text-on-surface tabular-nums sm:text-4xl">
                {stat.prefix && <span>{stat.prefix}</span>}
                <NumberTicker
                  value={stat.value}
                  decimalPlaces={stat.decimals ?? 0}
                  className="text-on-surface"
                />
                {stat.suffix && <span>{stat.suffix}</span>}
              </div>
              <p className="mt-1.5 text-body-sm font-medium text-on-surface-variant">{stat.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Parallax>
    </section>
  );
}
