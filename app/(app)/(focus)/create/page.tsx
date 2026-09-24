"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  CircleCheck,
  Eye,
  Hourglass,
  Loader2,
  Rocket,
  Sparkles,
  User,
  Users,
  Vote,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LucideIcon } from "@/components/lucide-icon";
import { BackButton } from "@/components/layout/back-button";
import { activeCampaigns, currentUser } from "@/lib/mock-data";

const themes = [
  { id: "summer", label: "Summer", icon: "wb_sunny" },
  { id: "city", label: "City", icon: "location_city" },
  { id: "food", label: "Food", icon: "restaurant" },
  { id: "friends", label: "Friends", icon: "group" },
] as const;

const coverOptions = [
  "/mock/campaigns/summer-vibes.jpg",
  "/mock/campaigns/city-life.jpg",
  "/mock/campaigns/foodie-moment.jpg",
  "/mock/campaigns/best-friends.jpg",
  "/mock/campaign-summer-hero.jpg",
  "/mock/onboarding-hero.jpg",
];

const steps = [
  { id: "brief", label: "Brief", icon: "edit_note" },
  { id: "style", label: "Style", icon: "palette" },
  { id: "rules", label: "Rules", icon: "tune" },
] as const;

type StepId = (typeof steps)[number]["id"];

export default function CreateCampaignPage() {
  return (
    <AuthGuard>
      <CreateCampaignFlow />
    </AuthGuard>
  );
}

function CreateCampaignFlow() {
  const [step, setStep] = useState<StepId>("brief");
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [theme, setTheme] = useState<(typeof themes)[number]["id"]>("summer");
  const [cover, setCover] = useState(coverOptions[0]);
  const [days, setDays] = useState(7);
  const [entry, setEntry] = useState<"photo" | "photo_video">("photo");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const canGenerate = idea.trim().length >= 8 && !generating;
  const canPublish = Boolean(name.trim() && tagline.trim() && !publishing);

  const preview = useMemo(
    () => ({
      tag: name ? `#${name.replace(/\s+/g, "")}` : "#YourChallenge",
      tagline: tagline || "One-line pitch for your challenge...",
      creators: 0,
      poolUsdc: 0,
      daysLeft: days,
      cover,
    }),
    [name, tagline, days, cover],
  );

  function generate() {
    if (!canGenerate) return;
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      const seed = idea.toLowerCase();
      if (seed.includes("city") || seed.includes("street")) {
        setName("City Lights");
        setTagline("Capture the metro after dark — neon, rain, and motion");
        setTheme("city");
        setCover(coverOptions[1]);
      } else if (seed.includes("food") || seed.includes("cook") || seed.includes("eat")) {
        setName("First Bite");
        setTagline("Snap the plate before the first delicious bite");
        setTheme("food");
        setCover(coverOptions[2]);
      } else if (seed.includes("friend") || seed.includes("crew") || seed.includes("duo")) {
        setName("Ride or Die");
        setTagline("Unfiltered duo moments that prove the friendship");
        setTheme("friends");
        setCover(coverOptions[3]);
      } else {
        setName("Golden Moment");
        setTagline("Your warmest lifestyle moment of the week");
        setTheme("summer");
        setCover(coverOptions[0]);
      }
      setGenerating(false);
      setGenerated(true);
      setStep("style");
    }, 1200);
  }

  function publish() {
    if (!canPublish) return;
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
      navigator.vibrate?.([25, 50, 25]);
    }, 1100);
  }

  return (
    <div className="flex flex-col gap-space-md px-space-md pt-2 pb-8 sm:px-0">
      <div className="flex items-center justify-between">
        <BackButton fallbackHref="/campaigns" />
        <div className="flex flex-col items-center">
          <h1 className="text-headline-sm tracking-tight">{published ? "Published" : "New Campaign"}</h1>
          <p className="text-label-sm text-on-surface-variant">Create with AI · free to launch</p>
        </div>
        <Link
          href="/campaigns"
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <X size={22} />
        </Link>
      </div>

      <div role="tablist" className="flex items-center gap-space-xs rounded-full bg-surface-container-low p-1">
        {steps.map((s) => {
          const active = s.id === step;
          const idx = steps.findIndex((x) => x.id === s.id);
          const curIdx = steps.findIndex((x) => x.id === step);
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              disabled={s.id !== "brief" && !generated && curIdx < idx}
              onClick={() => setStep(s.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-label-md transition-all ${
                active
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              } disabled:opacity-40`}
            >
              <LucideIcon name={s.icon} size={16} />
              {s.label}
            </button>
          );
        })}
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-surface-container-lowest shadow-card">
        <div className="relative aspect-[16/9] w-full">
          <Image src={preview.cover} alt="" fill sizes="(max-width: 767px) 100vw, 720px" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary-container px-3 py-1 text-label-md shadow-sm">
            <Eye size={14} />
            Preview
          </span>
          <div className="absolute inset-x-3 bottom-3 text-white">
            <p className="text-headline-sm drop-shadow">{preview.tag}</p>
            <p className="text-body-sm text-white/85">{preview.tagline}</p>
            <div className="mt-1.5 flex items-center gap-3 text-label-sm text-white/90">
              <span className="flex items-center gap-1">
                <Users size={14} />0 creators
              </span>
              <span className="flex items-center gap-1">
                <Hourglass size={14} />
                {days}d left
              </span>
              <span className="flex items-center gap-1">
                <Camera size={14} />
                {entry === "photo" ? "Photos" : "Photos & video"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {step === "brief" && (
        <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
          <div className="mb-space-sm flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container">
              <Sparkles size={20} className="text-on-primary-fixed" />
            </div>
            <div>
              <h2 className="text-label-lg">Describe your challenge</h2>
              <p className="text-body-sm text-on-surface-variant">AI drafts name, pitch, cover, and rules.</p>
            </div>
          </div>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={4}
            maxLength={400}
            placeholder="e.g. Street photography challenge for rainy neon nights in Tokyo..."
            className="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40"
          />
          <div className="mt-1 mb-3 flex items-center justify-between text-label-sm text-on-surface-variant">
            <span>{idea.length}/400</span>
            <span>Min 8 characters</span>
          </div>
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-secondary text-label-lg text-white shadow-shutter transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {generating ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Sparkles size={22} />
            )}
            {generating ? "Generating with AI..." : "Generate campaign"}
          </button>
        </section>
      )}

      {step === "style" && (
        <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
          <div className="mb-space-sm flex items-center justify-between">
            <h2 className="text-label-lg">Name &amp; pitch</h2>
            <span className="flex items-center gap-1 rounded-full bg-tertiary-container/50 px-2 py-0.5 text-label-sm text-on-tertiary-container">
              <Check size={12} />
              AI ready
            </span>
          </div>
          <label className="mb-1 block text-label-sm text-on-surface-variant" htmlFor="c-name">
            Campaign name
          </label>
          <input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Golden Hour"
            className="mb-3 h-12 w-full rounded-full bg-surface-container-low px-4 text-body-md outline-none ring-2 ring-transparent focus:ring-secondary/40"
          />
          <label className="mb-1 block text-label-sm text-on-surface-variant" htmlFor="c-tagline">
            Tagline
          </label>
          <input
            id="c-tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="One line pitch"
            className="h-12 w-full rounded-full bg-surface-container-low px-4 text-body-md outline-none ring-2 ring-transparent focus:ring-secondary/40"
          />

          <p className="mt-space-md mb-2 text-label-sm tracking-wider text-on-surface-variant uppercase">Theme</p>
          <div className="grid grid-cols-4 gap-space-xs">
            {themes.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 text-label-sm transition-all ${
                    active ? "bg-secondary-fixed text-on-secondary-fixed shadow-sm" : "bg-surface-container hover:bg-surface-container-high"
                  }`}
                >
                  <LucideIcon name={t.icon} size={20} className={active ? "text-secondary" : ""} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <p className="mt-space-md mb-2 text-label-sm tracking-wider text-on-surface-variant uppercase">Cover</p>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {coverOptions.map((src) => {
              const active = cover === src;
              return (
                <button
                  key={src}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCover(src)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl transition-all ${
                    active ? "ring-3 ring-secondary ring-offset-2" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image src={src} alt="" fill sizes="112px" className="object-cover" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep("rules")}
            className="mt-space-md flex h-13 w-full items-center justify-center gap-2 rounded-full bg-secondary text-label-lg text-white shadow-shutter active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={20} />
          </button>
        </section>
      )}

      {step === "rules" && (
        <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
          <h2 className="mb-space-sm text-label-lg">Rules</h2>

          <p className="mb-2 text-label-sm text-on-surface-variant">Duration</p>
          <div className="grid grid-cols-4 gap-space-xs">
            {[3, 5, 7, 14].map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={days === d}
                onClick={() => setDays(d)}
                className={`h-11 rounded-full text-label-md transition-all ${
                  days === d ? "bg-secondary text-white shadow-sm" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <p className="mt-space-md mb-2 text-label-sm text-on-surface-variant">Entry type</p>
          <div className="grid grid-cols-2 gap-space-xs">
            {(
              [
                { id: "photo", label: "Photo only", icon: "photo_camera" },
                { id: "photo_video", label: "Photo + video", icon: "videocam" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={entry === opt.id}
                onClick={() => setEntry(opt.id)}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-label-md transition-all ${
                  entry === opt.id ? "bg-secondary-fixed text-on-secondary-fixed shadow-sm" : "bg-surface-container"
                }`}
              >
                <LucideIcon name={opt.icon} size={18} />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-space-md flex items-start gap-3 rounded-2xl bg-surface-container-low p-3 text-on-surface-variant">
            <Vote size={18} className="mt-0.5 shrink-0 text-secondary" />
            <p className="text-body-sm leading-snug">
              Community votes free. Optional USDC support goes 100% to top creators when the challenge ends.
            </p>
          </div>

          <div className="mt-space-md rounded-2xl bg-surface-container-low p-3">
            <div className="flex items-center gap-2 text-label-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container">
                <User size={16} />
              </span>
              Host · @{currentUser.handle}
            </div>
          </div>

          {published ? (
            <div className="mt-space-md flex flex-col items-center gap-space-sm rounded-3xl bg-tertiary-container/40 p-space-md text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tertiary text-white">
                <CircleCheck size={28} fill="currentColor" />
              </div>
              <p className="text-headline-sm">Campaign live</p>
              <p className="text-body-sm text-on-surface-variant">Creators can join and post snaps right away.</p>
              <Link
                href="/campaigns"
                className="rounded-full bg-on-surface px-5 py-2 text-label-md text-surface"
              >
                View in Explore
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={publish}
              disabled={!canPublish}
              className="mt-space-md flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-fixed shadow-shutter transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Rocket size={22} />
              )}
              {publishing ? "Publishing..." : "Publish campaign"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
