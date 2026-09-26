"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, ImagePlus, Loader2, Lock, Plus, Save, Trophy, X } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { CampaignCover } from "@/components/campaign/campaign-cover";
import { ScreenHeader } from "@/components/layout/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { errorMessage, getCampaign, updateCampaign, uploadFile } from "@/lib/api-client";
import { compressImage } from "@/lib/image";
import { timeLeft } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { ApiCampaign } from "@/lib/types";
import { AMOUNT_STEP, COIN, coin } from "@/lib/currency";

const CATEGORIES = ["lifestyle", "food", "travel", "fashion", "pets", "sports", "art", "nature", "city", "friends"];
const EXTEND = [0, 1, 3, 7];
const inputClass =
  "h-12 w-full rounded-2xl bg-surface-container-low px-4 text-body-md outline-none ring-2 ring-transparent transition placeholder:text-on-surface-variant/60 focus:ring-secondary/40";

export default function EditCampaignPage({ params }: PageProps<"/campaigns/[id]/edit">) {
  const { id } = use(params);
  const { user } = useAuth();
  const campaign = useApi(() => getCampaign(id), [id]);

  let body: React.ReactNode;
  if (campaign.loading && !campaign.data) {
    body = (
      <div className="flex flex-col gap-4 px-4">
        <Skeleton className="aspect-[16/9] w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  } else if (!campaign.data) {
    body = (
      <div className="px-4">
        <ErrorState message={campaign.error ?? "Campaign not found"} onRetry={campaign.reload} />
      </div>
    );
  } else if (campaign.data.creator?.id !== user?.id) {
    body = (
      <div className="px-4">
        <ErrorState message="Only the host can edit this campaign." />
      </div>
    );
  } else if (campaign.data.status !== "ACTIVE") {
    body = (
      <div className="px-4">
        <ErrorState message="This campaign has ended — results are final and it can't be edited." />
      </div>
    );
  } else {
    body = <EditForm key={campaign.data.id} campaign={campaign.data} />;
  }

  return (
    <div className="flex flex-col gap-4 pt-safe pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]">
      <ScreenHeader back={`/campaigns/${id}`} title="Edit campaign" subtitle="Changes go live right away" />
      {body}
    </div>
  );
}

function EditForm({ campaign }: { campaign: ApiCampaign }) {
  const router = useRouter();
  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description ?? "");
  const [category, setCategory] = useState(campaign.category ?? "");
  const [rules, setRules] = useState<string[]>(campaign.rules);
  const [ruleInput, setRuleInput] = useState("");
  const [prizePool, setPrizePool] = useState(String(campaign.prizePool || ""));
  const [maxPosts, setMaxPosts] = useState(campaign.maxPostsPerUser);
  const [extendDays, setExtendDays] = useState(0);
  const [cover, setCover] = useState<{ blob: Blob; url: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement | null>(null);

  const prize = Number(prizePool) || 0;
  const prizeTooLow = prize < campaign.prizePool;
  const snapOptions = [1, 2, 3, 5, 10].filter((n) => n >= campaign.maxPostsPerUser);
  const canSave = title.trim().length >= 3 && !prizeTooLow && !saving;

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

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const coverImageUrl = cover ? (await uploadFile(cover.blob, "covers")).url : undefined;
      await updateCampaign(campaign.id, {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        rules,
        prizePool: prize,
        maxPostsPerUser: maxPosts,
        ...(coverImageUrl ? { coverImageUrl } : {}),
        ...(extendDays ? { extendDays } : {}),
      });
      navigator.vibrate?.(30);
      router.replace(`/campaigns/${campaign.id}`);
    } catch (e) {
      setError(errorMessage(e, "Couldn't save changes."));
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <section className="flex flex-col gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-container-low"
        >
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={cover.url} alt="New cover" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <CampaignCover campaign={campaign} sizes="480px" />
          )}
          <span className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-label-sm text-white backdrop-blur-md">
            <ImagePlus size={14} />
            Change cover
          </span>
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
          <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 60))} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">What should people snap?</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
            rows={3}
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
              placeholder="Add a rule"
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

      <section className="flex flex-col gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <p className="flex items-start gap-2 rounded-2xl bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
          <Lock size={16} className="mt-0.5 shrink-0 text-secondary" />
          To keep it fair for people who already joined, these can only go up.
        </p>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-label-sm text-on-surface-variant">
            <CalendarPlus size={14} />
            Extend duration · currently {timeLeft(campaign.endsAt) ?? "ending"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {EXTEND.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={extendDays === d}
                onClick={() => setExtendDays(d)}
                className={`h-11 rounded-full text-label-md transition-all ${
                  extendDays === d ? "bg-secondary-container text-on-secondary shadow-sm" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {d === 0 ? "Keep" : `+${d}d`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-label-sm text-on-surface-variant">Snaps per creator</p>
          <div className="grid grid-cols-5 gap-2">
            {snapOptions.map((n) => (
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
          <span className="text-label-sm text-on-surface-variant">Prize pool ({COIN})</span>
          <div className="relative">
            <Trophy size={18} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-tertiary" />
            <input
              inputMode="decimal"
              type="number"
              min={campaign.prizePool}
              step={AMOUNT_STEP}
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="0"
              aria-invalid={prizeTooLow}
              className={`${inputClass} pl-10 ${prizeTooLow ? "ring-error/50" : ""}`}
            />
          </div>
          {prizeTooLow && (
            <span className="text-body-sm text-error">Can&apos;t go below the current {coin(campaign.prizePool)}.</span>
          )}
        </label>
      </section>

      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-4 py-3 text-body-sm text-error">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-headline-sm text-on-secondary shadow-shutter transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? <Loader2 size={22} className="animate-spin" /> : <Save size={22} />}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
