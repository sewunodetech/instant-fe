"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight, Bolt, Camera, Flame, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { FloatLoop, WordReveal } from "@/components/landing/motion-primitives";
import { APP_ENTRY_HREF } from "@/components/landing/content";

const easeOut = [0.16, 1, 0.3, 1] as const;

/** Shared entrance transition for the stacked hero copy. */
function heroItem(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: easeOut },
  };
}

export function LandingHero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-driven parallax across the whole hero.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  // Pointer-driven 3D tilt for the device stage.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });
  const transform = useMotionTemplate`perspective(1400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handlePointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-surface px-4 pt-28 pb-16 sm:px-6 sm:pt-36 lg:px-8"
    >
      {/* Animated ambient background */}
      <motion.div style={reduce ? undefined : { y: gridY }} className="absolute inset-0">
        <DotPattern
          width={26}
          height={26}
          cr={1.1}
          className={cn(
            "text-on-surface/[0.07]",
            "[mask-image:radial-gradient(650px_circle_at_center,white,transparent)]",
          )}
        />
      </motion.div>
      <AuroraBlobs y={glowY} reduce={reduce} />

      {/* Copy */}
      <motion.div
        style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <motion.div {...heroItem(0)} className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-surface-container-lowest/80 px-3 py-1.5 text-body-sm font-semibold shadow-soft backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-tertiary/70" />
              <span className="relative inline-flex size-2 rounded-full bg-tertiary" />
            </span>
            The spontaneous photo arena
            <span className="flex items-center gap-1 rounded-full bg-bnb/15 px-2 py-0.5 text-[11px] font-bold text-bnb-dim">
              <span className="size-1.5 rounded-full bg-bnb" />
              BNB Chain
            </span>
          </span>
        </motion.div>

        <h1
          className="mt-6 text-4xl font-extrabold tracking-tight text-balance text-on-surface sm:text-6xl lg:text-7xl"
          style={{ lineHeight: 1.05 }}
        >
          <WordReveal text="Capture the moment." className="block" />
          <span className="mt-1 block">
            <WordReveal text="Win" delay={0.15} />{" "}
            <AuroraText colors={["#f0b90b", "#ffd400", "#ffe33b", "#e2c600"]} className="font-extrabold">
              USDC
            </AuroraText>{" "}
            <WordReveal text="on BNB Chain." delay={0.28} />
          </span>
        </h1>

        <motion.p
          {...heroItem(0.5)}
          className="mx-auto mt-6 max-w-xl text-base text-pretty text-on-surface-variant sm:text-lg"
        >
          Zero gallery uploads. Unfiltered 2-minute live drops. Micro-vote for real
          friends with gasless USDC and split daily community prize pools.
        </motion.p>

        <motion.div
          {...heroItem(0.6)}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href={APP_ENTRY_HREF} className="w-full sm:w-auto">
            <ShimmerButton
              background="var(--color-on-surface)"
              shimmerColor="#ffe33b"
              className="w-full px-7 py-3.5 text-sm font-bold shadow-lg sm:w-auto"
            >
              <Camera className="mr-2 size-5" strokeWidth={2.2} aria-hidden />
              Post a live snap
            </ShimmerButton>
          </Link>
          <a
            href="#how-it-works"
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-surface-container-lowest px-7 py-3.5 text-sm font-bold text-on-surface shadow-soft transition-all hover:-translate-y-0.5 hover:border-black/20 active:scale-95 sm:w-auto"
          >
            <Zap className="size-5 text-secondary" strokeWidth={2.2} aria-hidden />
            See how it works
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} aria-hidden />
          </a>
        </motion.div>

        <motion.p
          {...heroItem(0.7)}
          className="mt-5 flex items-center justify-center gap-2 text-body-sm font-medium text-on-surface-variant"
        >
          <ShieldCheck className="size-4 text-tertiary" strokeWidth={2.2} aria-hidden />
          Live shutter only · hardware timestamp verified
        </motion.p>
      </motion.div>

      {/* Device stage */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.45, ease: easeOut }}
        style={reduce ? undefined : { y: stageY }}
        className="relative z-10 mx-auto mt-16 flex max-w-3xl justify-center"
      >
        <div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative"
        >
          <motion.div style={reduce ? undefined : { transform }} className="relative">
            <FloatLoop amount={14} duration={7}>
              <PhoneMockup />
            </FloatLoop>

            <div className="absolute -top-6 -left-6 hidden sm:-left-24 sm:block lg:-left-32">
              <FloatingCard delay={0.85}>
                <FloatLoop amount={16} duration={6} delay={0.4}>
                  <VoteCard />
                </FloatLoop>
              </FloatingCard>
            </div>

            <div className="absolute -right-6 bottom-16 hidden sm:-right-24 sm:block lg:-right-32">
              <FloatingCard delay={1.05}>
                <FloatLoop amount={18} duration={8} delay={1.1}>
                  <RewardCard />
                </FloatLoop>
              </FloatingCard>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function AuroraBlobs({ y, reduce }: { y: MotionValue<number>; reduce: boolean | null }) {
  return (
    <motion.div
      aria-hidden
      style={reduce ? undefined : { y }}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary-container/25 blur-[120px]"
        animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-10 -left-20 size-72 rounded-full bg-secondary-container/20 blur-[100px]"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-24 -right-16 size-64 rounded-full bg-bnb/20 blur-[100px]"
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function FloatingCard({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
      className={className}
      style={{ transform: "translateZ(60px)" }}
    >
      {children}
    </motion.div>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-[280px] rounded-[44px] border border-black/10 bg-on-surface p-2.5 shadow-elevated sm:w-[320px]">
      <div className="overflow-hidden rounded-[36px] bg-surface">
        {/* Status / header */}
        <div className="flex items-center justify-between bg-surface-container-lowest px-4 pt-4 pb-3">
          <Image src="/brand/logo.png" alt="instant.fun" width={84} height={20} className="h-5 w-auto object-contain" />
          <div className="flex items-center gap-1.5 rounded-full bg-bnb/15 px-2 py-1 text-[10px] font-bold text-bnb-dim">
            <span className="size-1.5 rounded-full bg-bnb" />
            #SummerVibes
          </div>
        </div>

        {/* Snap */}
        <div className="p-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-container">
            <Image
              src="/mock/snap-summer-cafe.jpg"
              alt="Creator snap in the feed"
              fill
              sizes="320px"
              className="object-cover"
            />
            <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1 rounded-full bg-on-surface/70 px-2.5 py-1 text-[10px] font-bold text-surface backdrop-blur-md">
                <Flame className="size-3 text-bnb" strokeWidth={2.4} aria-hidden />
                250 USDC pool
              </span>
              <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-extrabold text-on-primary-fixed">
                #1
              </span>
            </div>
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-on-surface/70 px-2 py-1 text-[10px] font-bold text-surface backdrop-blur-md">
              <span className="flex size-4 items-center justify-center rounded-full bg-secondary-container text-[9px] text-white">M</span>
              @maya_beachlife
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button className="flex items-center gap-1.5 rounded-full bg-secondary-container px-3.5 py-2 text-xs font-bold text-white shadow-sm">
              <Bolt className="size-4" strokeWidth={2.4} aria-hidden />
              Vote 1 USDC
            </button>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-secondary-fixed px-2.5 py-1.5 text-[11px] font-bold text-on-secondary-fixed">+5</span>
              <span className="rounded-full bg-secondary-fixed px-2.5 py-1.5 text-[11px] font-bold text-on-secondary-fixed">+10</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-around border-t border-black/5 bg-surface-container-lowest px-4 py-3 text-on-surface-variant/50">
          {[Flame, Sparkles, Camera].map((Icon, i) => (
            <Icon
              key={i}
              className={cn("size-5", i === 2 && "text-secondary-container")}
              strokeWidth={2}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VoteCard() {
  return (
    <div className="w-56 rounded-3xl border border-black/5 bg-surface-container-lowest/95 p-4 shadow-elevated backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/mock/leaderboard/avatar-1.jpg" alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
          <div>
            <p className="text-xs leading-none font-bold">@maya_beachlife</p>
            <span className="text-[10px] font-semibold text-tertiary">Live shutter</span>
          </div>
        </div>
        <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-extrabold text-on-primary-fixed">#1</span>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-surface-container-low px-3 py-2 text-[11px] font-medium text-on-surface-variant">
        Top voters split 30%
        <span className="font-bold text-secondary">~$38</span>
      </div>
    </div>
  );
}

function RewardCard() {
  return (
    <div className="w-56 rounded-3xl border border-black/5 bg-surface-container-lowest/95 p-4 shadow-elevated backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-bnb/15">
          <Image src="/mock/trophy-champion.jpg" alt="" width={32} height={32} className="size-8 object-contain" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold tracking-wide text-bnb-dim uppercase">Daily champion</span>
          <p className="text-sm leading-tight font-extrabold">+80.00 USDC</p>
          <p className="text-[10px] font-semibold text-tertiary">Settled instantly</p>
        </div>
      </div>
    </div>
  );
}
