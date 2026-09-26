"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Rocket, Sparkles, Trophy, X } from "lucide-react";
import { ScreenHeader } from "@/components/layout/screen-header";
import { createCampaign, errorMessage, generateCampaignDraft, uploadFile } from "@/lib/api-client";
import { compressImage } from "@/lib/image";
import { campaignTag } from "@/lib/format";
import { AMOUNT_STEP, COIN, amount, roundAmount } from "@/lib/currency";

const CATEGORIES = ["lifestyle", "food", "travel", "fashion", "pets", "sports", "art", "nature", "city", "friends"];
const DURATIONS = [1, 3, 7, 14];
const PRIZE_SPLIT = [0.5, 0.3, 0.2];

const inputClass =
  "h-12 w-full rounded-2xl bg-surface-container-low px-4 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("lifestyle");
  const [rules, setRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [prizePool, setPrizePool] = useState("");
  const [maxPosts, setMaxPosts] = useState(3);
  const [cover, setCover] = useState<{ blob: Blob; url: string } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);

  const prize = Number(prizePool) || 0;
  const canPublish = title.trim().length >= 3 && !publishing;

  async function draft() {
    if (idea.trim().length < 8 || drafting) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const d = await generateCampaignDraft(idea.trim());
      setTitle(d.title);
      setDescription(d.description);
      if (CATEGORIES.includes(d.category)) setCategory(d.category);
      setRules(d.rules);
      setDurationDays(DURATIONS.reduce((best, x) => (Math.abs(x - d.durationDays) < Math.abs(best - d.durationDays) ? x : best)));
    } catch (e) {
      setDraftError(errorMessage(e));
    } finally {
      setDrafting(false);
    }
  }

  function addRule() {
    const rule = ruleInput.trim();
    if (!rule || rules.length >= 10) return;
    setRules((r) => [...r, rule.slice(0, 140)]);
    setRuleInput("");
  }

  async function pickCover(file: File | undefined) {
    if (!file) return;
    try {
      const blob = await compressImage(file, 1600);
      if (cover) URL.revokeObjectURL(cover.url);
      setCover({ blob, url: URL.createObjectURL(blob) });
    } catch {
      setError("That image couldn't be read.");
    }
  }

  async function publish() {
    if (!canPublish) return;
    setPublishing(true);
    setError(null);
    try {
      const coverImageUrl = cover ? (await uploadFile(cover.blob, "covers")).url : undefined;
      const campaign = await createCampaign({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        rules,
        coverImageUrl,
        prizePool: prize,
        maxPostsPerUser: maxPosts,
        durationDays,
      });
      navigator.vibrate?.([25, 50, 25]);
      router.replace(`/campaigns/${campaign.id}`);
    } catch (e) {
      setError(errorMessage(e, "Couldn't publish the campaign."));
      setPublishing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-safe pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
      <ScreenHeader back="/campaigns" title="Host a campaign" subtitle="Free to launch · goes live instantly" />
      <div className="flex flex-col gap-4 px-4">

      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div className="mb-space-sm flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary shadow-sm">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-label-lg font-extrabold">Draft with AI</h2>
            <p className="text-body-sm text-on-surface-variant">Optional — describe an idea and we&apos;ll fill the form.</p>
          </div>
        </div>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value.slice(0, 400))}
          rows={3}
          placeholder="e.g. Rainy neon nights in the city, street photography"
          className="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40"
        />
        {draftError && <p className="mt-1 text-body-sm text-error">{draftError}</p>}
        <button
          type="button"
          onClick={draft}
          disabled={idea.trim().length < 8 || drafting}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-label-md text-white transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {drafting ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {drafting ? "Drafting…" : "Generate draft"}
        </button>
      </section>

      <section className="flex flex-col gap-space-sm rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low text-on-surface-variant"
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={cover.url} alt="Cover preview" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-label-md">
              <ImagePlus size={28} />
              Add cover (optional)
            </span>
          )}
          {title && (
            <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-3 py-1 text-label-md text-white">
              {campaignTag(title)}
            </span>
          )}
        </button>
        <input
          ref={coverInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void pickCover(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">Name</span>
          <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 60))} placeholder="Golden Hour" className={inputClass} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">What should people snap?</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
            rows={3}
            placeholder="Describe the challenge"
            className="w-full resize-none rounded-2xl bg-surface-container-low p-3 text-body-md outline-none ring-2 ring-transparent focus:ring-secondary/40"
          />
        </label>

        <div>
          <p className="mb-1.5 text-label-sm text-on-surface-variant">Category</p>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
                className={`h-9 shrink-0 rounded-full px-3.5 text-label-sm capitalize transition-all ${
                  category === c ? "bg-secondary-container text-on-secondary" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-label-sm text-on-surface-variant">Rules</p>
          {rules.length > 0 && (
            <ul className="mb-2 flex flex-col gap-1.5">
              {rules.map((rule, i) => (
                <li key={`${rule}-${i}`} className="flex items-start gap-2 rounded-xl bg-surface-container-low px-3 py-2 text-body-sm">
                  <span className="flex-1">{rule}</span>
                  <button
                    type="button"
                    aria-label="Remove rule"
                    onClick={() => setRules((r) => r.filter((_, j) => j !== i))}
                    className="text-on-surface-variant"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRule();
                }
              }}
              placeholder="e.g. No filters"
              className={inputClass}
            />
            <button
              type="button"
              aria-label="Add rule"
              onClick={addRule}
              disabled={!ruleInput.trim() || rules.length >= 10}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-space-sm rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div>
          <p className="mb-1.5 text-label-sm text-on-surface-variant">Duration</p>
          <div className="grid grid-cols-4 gap-space-xs">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={durationDays === d}
                onClick={() => setDurationDays(d)}
                className={`h-11 rounded-full text-label-md transition-all ${
                  durationDays === d ? "bg-secondary-container text-on-secondary shadow-sm" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-label-sm text-on-surface-variant">Snaps per creator</p>
          <div className="grid grid-cols-4 gap-space-xs">
            {[1, 2, 3, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={maxPosts === n}
                onClick={() => setMaxPosts(n)}
                className={`h-11 rounded-full text-label-md transition-all ${
                  maxPosts === n ? "bg-secondary-container text-on-secondary shadow-sm" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">Prize pool ({COIN}, optional)</span>
          <div className="relative">
            <Trophy size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-tertiary" />
            <input
              inputMode="decimal"
              type="number"
              min={0}
              step={AMOUNT_STEP}
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="0"
              className={`${inputClass} pl-10`}
            />
          </div>
        </label>
        {prize > 0 && (
          <p className="rounded-2xl bg-surface-container-low px-3 py-2 text-body-sm text-on-surface-variant">
            Winners get {PRIZE_SPLIT.map((s) => `${amount(roundAmount(prize * s))}`).join(" / ")} {COIN}. As host you
            send prizes to the winners&apos; wallets after the campaign ends.
          </p>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-body-sm text-error">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={publish}
        disabled={!canPublish}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-headline-sm text-on-secondary shadow-shutter transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {publishing ? <Loader2 size={22} className="animate-spin" /> : <Rocket size={22} />}
        {publishing ? "Publishing…" : "Publish campaign"}
      </button>
      </div>
    </div>
  );
}
