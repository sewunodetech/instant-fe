"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/icon";

export function LandingHero() {
  const zoneRef = useRef<HTMLElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const zone = zoneRef.current;
    const tilt = tiltRef.current;
    if (!zone || !tilt) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const parallaxEls = Array.from(zone.querySelectorAll<HTMLElement>("[data-parallax]"));
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = zone.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      targetX = ((e.clientY - rect.top - centerY) / centerY) * -5;
      targetY = ((e.clientX - rect.left - centerX) / centerX) * 5;
    };
    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      tilt.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      parallaxEls.forEach((el) => {
        const depth = parseFloat(el.dataset.parallax || "10");
        const px = (currentY / 5) * (depth / 3);
        const py = (currentX / 5) * (depth / 3);
        el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      });
      raf = requestAnimationFrame(render);
    };

    zone.addEventListener("mousemove", onMove);
    zone.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(render);

    return () => {
      zone.removeEventListener("mousemove", onMove);
      zone.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={zoneRef}
      id="hero-interactive-zone"
      className="hero-perspective-stage relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-b from-surface via-surface-container-low/40 to-surface px-4 pt-32 pb-20 sm:px-6 sm:pt-36 lg:px-8"
    >
      <div className="relative z-10 mx-auto max-w-6xl space-y-5 text-center">
        {/* Micro tag pills */}
        <div className="reveal-item inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-surface-container-lowest p-1.5 pr-2 pl-3 shadow-soft transition-all duration-300 hover:shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-slate-800">The Spontaneous Photo Arena</span>
          <span className="pulse-glow rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-extrabold text-on-primary-fixed">
            #SummerVibes LIVE
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#F0B90B] px-2 py-0.5 text-[10px] font-extrabold text-slate-900 transition-transform hover:scale-105">
            <span>🟡</span> BNB Chain
          </span>
        </div>

        <h1 className="reveal-item mx-auto max-w-4xl text-4xl leading-[1.1] font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
          Capture the moment. <br />
          <span className="text-[#F0B90B] underline decoration-primary-container decoration-wavy decoration-4 transition-all duration-300 hover:brightness-110">
            Win USDC on BNB Chain.
          </span>
        </h1>

        <p className="reveal-item mx-auto max-w-2xl text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
          Zero gallery uploads. Unfiltered 2-minute live drops. Micro-vote for real friends with gasless USDC
          and split daily community prize pools.
        </p>

        <div className="reveal-item flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/home"
            className="badge-shimmer flex items-center gap-2 rounded-full bg-primary-container px-6 py-3.5 text-sm font-extrabold text-on-primary-fixed shadow-pop-yellow transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-fixed active:scale-95"
          >
            <Icon name="add_a_photo" className="text-[20px]" />
            <span>Post Live Snap</span>
          </Link>
          <a
            href="#feed-preview"
            className="badge-shimmer flex items-center gap-2 rounded-full border border-slate-200/80 bg-surface-container-lowest px-6 py-3.5 text-sm font-bold text-slate-800 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface-container-low active:scale-95"
          >
            <Icon name="bolt" className="text-[20px] text-secondary-container" />
            <span>Explore Live Drops</span>
          </a>
        </div>

        {/* Streak & power bar */}
        <div className="reveal-item mx-auto mt-6 flex max-w-xl items-center justify-between rounded-2xl border border-slate-200/80 bg-surface-container-lowest p-3 text-left shadow-soft transition-all duration-300 hover:shadow-card">
          <div className="flex min-w-0 items-center gap-3">
            <div className="pulse-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container/30 text-primary">
              <Icon name="local_fire_department" filled className="text-[22px]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">5-Day Streak</span>
                <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-extrabold text-on-primary-fixed">
                  +10% Bonus
                </span>
              </div>
              <p className="truncate text-xs text-slate-500">Extra USDC dividend paid out on every vote today</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end pl-2">
            <span className="text-xs font-bold text-slate-800">8/10</span>
            <div className="power-glow mt-1 h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-4/5 rounded-full bg-secondary-container transition-all duration-700" />
            </div>
            <span className="mt-0.5 text-[9px] font-semibold text-slate-400">Power left</span>
          </div>
        </div>
      </div>

      {/* Device showcase */}
      <div ref={tiltRef} id="feed-preview" className="reveal-item hero-tilt-container relative mx-auto mt-14 max-w-6xl">
        <FloatingVoteWidget />
        <FloatingRewardWidget />

        <div className="absolute -bottom-6 left-12 z-20 hidden items-center gap-2.5 rounded-full border border-slate-700 bg-inverse-surface px-4 py-2.5 text-inverse-on-surface shadow-elevated transition-transform duration-300 hover:scale-105 lg:flex" data-parallax="15">
          <Icon name="verified_user" className="text-[18px] text-emerald-400" />
          <span className="text-xs font-bold">Live Shutter Only • Hardware Timestamp Verified</span>
        </div>

        <div className="mx-auto grid max-w-3xl grid-cols-1 items-center justify-center gap-8 md:grid-cols-2">
          <PhoneFeed />
          <PhoneCamera />
        </div>
      </div>
    </section>
  );
}

function FloatingVoteWidget() {
  return (
    <div
      className="animate-float-badge-left absolute top-12 left-0 z-20 hidden w-72 flex-col gap-3 rounded-3xl border border-slate-200/80 bg-surface-container-lowest p-4 shadow-elevated transition-transform duration-300 hover:-translate-y-2 lg:flex"
      data-parallax="25"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/mock/leaderboard/avatar-1.jpg" alt="Maya" width={32} height={32} className="h-8 w-8 rounded-full border border-slate-200 object-cover" />
          <div>
            <p className="text-xs leading-none font-bold text-slate-900">@maya_beachlife</p>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
              <Icon name="verified" className="text-[11px]" /> Live Shutter
            </span>
          </div>
        </div>
        <span className="rounded-full bg-primary-container px-2 py-0.5 text-[11px] font-extrabold text-on-primary-fixed">#1 Rank</span>
      </div>
      <div className="flex items-center gap-1.5 pt-1">
        <button className="flex flex-1 items-center justify-center gap-1 rounded-full bg-secondary-container px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-95">
          <Icon name="bolt" className="text-[15px]" /> Vote 1 USDC
        </button>
        <span className="cursor-pointer rounded-full bg-secondary-fixed px-2 py-1.5 text-xs font-bold text-on-secondary-fixed transition-transform hover:bg-blue-200 active:scale-95">+5</span>
        <span className="cursor-pointer rounded-full bg-secondary-fixed px-2 py-1.5 text-xs font-bold text-on-secondary-fixed transition-transform hover:bg-blue-200 active:scale-95">+10</span>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-2 text-[11px] text-slate-600">
        <span className="flex items-center gap-1 font-medium">
          <Icon name="savings" className="text-[14px] text-emerald-600" /> Top voters split 30%
        </span>
        <span className="font-bold text-secondary-container">~$38 USDC</span>
      </div>
    </div>
  );
}

function FloatingRewardWidget() {
  return (
    <div
      className="animate-float-badge-right absolute top-16 right-0 z-20 hidden w-72 flex-col gap-2.5 rounded-3xl border border-slate-200/80 bg-surface-container-lowest p-4 shadow-elevated transition-transform duration-300 hover:-translate-y-2 lg:flex"
      data-parallax="-25"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200/60 bg-amber-50">
          <Image src="/mock/trophy-champion.jpg" alt="Trophy" width={36} height={36} className="h-9 w-9 object-contain transition-transform duration-300 hover:rotate-6" />
        </div>
        <div>
          <span className="text-[10px] font-extrabold tracking-wide text-amber-600 uppercase">Daily Drop Champion</span>
          <h4 className="text-sm leading-tight font-extrabold text-slate-900">Maya won 1st Place!</h4>
          <p className="text-xs font-extrabold text-emerald-600">+80.00 USDC Settled</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-bold text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Instant BNB Chain Transfer
        </span>
        <span className="text-[#B8860B]">TX: 0x8a2...3f1</span>
      </div>
    </div>
  );
}

function PhoneFeed() {
  return (
    <div className="animate-float-1 mx-auto w-full max-w-[340px] transform rounded-[42px] border-4 border-slate-800/80 bg-slate-900 p-3 shadow-2xl transition-all duration-300 hover:scale-[1.01]">
      <div className="mx-auto mb-2 flex h-4 w-24 items-center justify-center rounded-full bg-slate-950">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
      </div>
      <div className="flex flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-surface shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3.5 pt-3 pb-2">
          <Image src="/brand/logo.png" alt="instant.fun" width={80} height={20} className="h-5 w-auto object-contain" />
          <div className="flex items-center gap-2">
            <Icon name="notifications" className="cursor-pointer text-[18px] text-slate-500 transition-colors hover:text-slate-900" />
            <Image src="/mock/avatar-me.jpg" alt="User" width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
          </div>
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold">
          <div className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-on-primary-fixed transition-transform hover:brightness-105 active:scale-95">
            <Icon name="add_a_photo" className="text-[13px]" />
            <span>Post Snap</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-slate-800">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary-container" />
            <span>#SummerVibes</span>
            <span className="text-primary">250 USDC</span>
          </div>
          <div className="shrink-0 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-slate-500">#CityLife 150 USDC</div>
        </div>
        <div className="space-y-2.5 bg-white p-3">
          <div className="group/feed relative aspect-[4/4.8] overflow-hidden rounded-2xl bg-slate-100">
            <Image src="/mock/snap-summer-cafe.jpg" alt="Maya matcha snap" fill sizes="320px" className="object-cover transition-transform duration-500 group-hover/feed:scale-105" />
            <div className="absolute inset-x-2 top-2 flex items-center justify-between">
              <div className="flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                <Icon name="stars" className="text-[12px] text-primary-container" />
                <span>#SummerVibes • 250 USDC</span>
              </div>
              <span className="rounded-full bg-primary-container px-2 py-0.5 text-[10px] font-bold text-on-primary-fixed">#1 342 votes</span>
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-container text-[10px] text-white">M</span>
              <span>@maya_beachlife</span>
              <span className="font-semibold text-emerald-400">• 2h ago</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:opacity-90 active:scale-95">
                  <Icon name="bolt" className="text-[14px]" /> Vote 1 USDC
                </button>
                <span className="cursor-pointer rounded-full bg-secondary-fixed px-2 py-1 text-[11px] font-bold text-on-secondary-fixed transition-transform active:scale-95">+5</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-0.5"><Icon name="mode_comment" className="text-[16px]" /> 18</span>
                <Icon name="share" className="cursor-pointer text-[16px] transition-colors hover:text-slate-800" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-[10px] font-medium text-slate-600">
              <span className="flex items-center gap-1"><Icon name="savings" className="text-[12px] text-emerald-600" /> Top voters split 30% pool</span>
              <span className="font-bold text-secondary-container">342 Votes</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-around border-t border-slate-100 bg-white px-4 py-2 text-slate-400">
          <Icon name="home" className="text-[20px] text-secondary-container" />
          <Icon name="explore" className="cursor-pointer text-[20px] transition-colors hover:text-slate-700" />
          <div className="-mt-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-secondary-container text-white shadow-pop-blue transition-transform active:scale-90">
            <Icon name="photo_camera" className="text-[20px]" />
          </div>
          <Icon name="emoji_events" className="cursor-pointer text-[20px] transition-colors hover:text-slate-700" />
          <Icon name="person" className="cursor-pointer text-[20px] transition-colors hover:text-slate-700" />
        </div>
      </div>
    </div>
  );
}

function PhoneCamera() {
  return (
    <div className="animate-float-2 mx-auto w-full max-w-[340px] transform rounded-[42px] border-4 border-slate-800/80 bg-slate-900 p-3 shadow-2xl transition-all duration-300 hover:scale-[1.01]">
      <div className="mx-auto mb-2 flex h-4 w-24 items-center justify-center rounded-full bg-slate-950">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-800" />
      </div>
      <div className="relative flex aspect-[9/16] flex-col justify-between overflow-hidden rounded-[32px] border border-slate-800 bg-black p-3.5">
        <Image src="/mock/snap-summer-beach.jpg" alt="Friends beach viewfinder" fill sizes="320px" className="object-cover brightness-90" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

        <div className="relative z-10 flex items-center justify-between text-white">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-transform active:scale-90">
            <Icon name="close" className="text-[16px]" />
          </button>
          <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
            <span>#SummerVibes</span>
            <span className="text-primary-container">250 USDC</span>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-transform active:scale-90">
            <Icon name="flash_auto" className="text-[16px]" />
          </button>
        </div>

        <div className="relative z-10 my-auto flex flex-col items-center">
          <div className="mb-4 flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            <Icon name="verified_user" className="text-[13px] text-emerald-400" />
            <span>Live Capture Only • Anti-Spoof</span>
          </div>
          <div className="relative flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-white/40">
            <div className="h-3 w-3 animate-ping rounded-full bg-white/60" />
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="flex w-full items-center justify-around">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-90">
              <Icon name="flip_camera_ios" className="text-[20px]" />
            </button>
            <div className="group flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white p-1 shadow-lg transition-transform active:scale-90">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary-container text-white transition-transform group-hover:scale-95">
                <Icon name="photo_camera" className="text-[24px]" />
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-90">
              <Icon name="timer" className="text-[20px]" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-white/90 drop-shadow">Tap shutter to capture &amp; enter challenge</p>
        </div>
      </div>
    </div>
  );
}
