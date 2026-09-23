"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { supportTiers, type SupportTier } from "@/lib/mock-data";

type Status = "idle" | "confirming" | "success";

type Props = {
  creatorName: string;
  balance: number;
  tiers?: SupportTier[];
  onSupported: (usdc: number) => void;
};

const usd = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function SupportPanel({ creatorName, balance, tiers = supportTiers, onSupported }: Props) {
  const [voted, setVoted] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const amount = useCustom ? Number(custom) || 0 : (selection ?? 0);
  const insufficient = amount > balance;
  const canSupport = status === "idle" && amount >= 1 && !insufficient;

  function voteFree() {
    if (voted) return;
    setVoted(true);
    navigator.vibrate?.([25, 50, 25]);
  }

  function submitSupport() {
    if (!canSupport) return;
    setStatus("confirming");
    setTimeout(() => {
      setStatus("success");
      setVoted(true);
      onSupported(amount);
      navigator.vibrate?.([25, 50, 25]);
      setTimeout(() => setStatus("idle"), 2200);
    }, 900);
  }

  const supportLabel =
    status === "confirming"
      ? "Confirming on Base..."
      : status === "success"
        ? "Support sent!"
        : amount < 1
          ? "Choose a support amount"
          : insufficient
            ? "Insufficient USDC balance"
            : `Support ${amount} USDC · 100% to ${creatorName}`;

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
          <Icon name="how_to_vote" className="text-[22px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-headline-sm font-extrabold tracking-tight">Vote &amp; Support</h2>
            <Icon name="auto_awesome" className="text-[18px] text-secondary-container" />
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            Vote free once · optional USDC support goes 100% to {creatorName}.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={voteFree}
        disabled={voted}
        aria-pressed={voted}
        className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-label-lg transition-all active:scale-95 disabled:cursor-default ${
          voted
            ? "bg-tertiary-container text-on-tertiary-container"
            : "bg-secondary-container text-on-secondary shadow-shutter hover:bg-secondary"
        }`}
      >
        <Icon name={voted ? "check_circle" : "how_to_vote"} filled className="text-[22px]" />
        <span className="font-bold tracking-tight">{voted ? "Vote counted — free" : "Vote free"}</span>
      </button>

      <fieldset className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <legend className="text-label-sm tracking-wider text-on-surface-variant uppercase">Optional support</legend>
          <span className="text-label-sm text-secondary">To creator wallet</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tiers.map((tier) => {
            const active = !useCustom && selection === tier.usdc;
            return (
              <button
                key={tier.usdc}
                type="button"
                aria-pressed={active}
                disabled={status !== "idle"}
                onClick={() => {
                  setUseCustom(false);
                  setSelection(tier.usdc);
                }}
                className={`relative flex flex-col items-start rounded-2xl p-3 text-left transition-all ${
                  active
                    ? "bg-secondary-fixed text-on-secondary-fixed shadow-sm"
                    : "bg-surface-container hover:bg-surface-container-high"
                }`}
              >
                <span className="flex w-full items-center justify-between">
                  <span className={`text-label-lg ${active ? "font-extrabold text-secondary" : ""}`}>
                    {tier.usdc} USDC
                  </span>
                  <Icon
                    name="check_circle"
                    filled
                    className={`text-[18px] text-secondary transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                  />
                </span>
                <span
                  className={`mt-1 text-label-sm ${active ? "text-on-secondary-fixed-variant" : "text-on-surface-variant"}`}
                >
                  {tier.label}
                </span>
              </button>
            );
          })}

          {useCustom ? (
            <label className="flex flex-col rounded-2xl bg-secondary-fixed p-3 text-on-secondary-fixed shadow-sm">
              <span className="flex items-center gap-1">
                <input
                  autoFocus
                  inputMode="decimal"
                  type="number"
                  min={1}
                  step={1}
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="0"
                  aria-label="Custom USDC amount"
                  className="w-full min-w-0 bg-transparent text-label-lg font-extrabold text-secondary outline-none placeholder:text-secondary/40"
                />
                <span className="text-label-lg text-secondary">USDC</span>
              </span>
              <span className="mt-1 text-label-sm text-on-secondary-fixed-variant">Custom amount</span>
            </label>
          ) : (
            <button
              type="button"
              disabled={status !== "idle"}
              onClick={() => setUseCustom(true)}
              className="flex flex-col items-start rounded-2xl bg-surface-container p-3 text-left transition-all hover:bg-surface-container-high"
            >
              <span className="text-label-lg">Custom</span>
              <span className="mt-1 text-label-sm text-on-surface-variant">Enter amount</span>
            </button>
          )}
        </div>
      </fieldset>

      <div className="flex items-center justify-between rounded-2xl bg-surface-container-low p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container/50 text-on-primary-container">
            <Icon name="volunteer_activism" className="text-[16px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm">Creator receives</span>
            <span className="text-body-sm text-on-surface-variant">No platform fee</span>
          </div>
        </div>
        <span className="text-label-lg font-extrabold text-primary tabular-nums">
          {amount > 0 ? `${usd(amount)} USDC` : "—"}
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={submitSupport}
          disabled={!canSupport && status === "idle"}
          aria-live="polite"
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-label-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            status === "success"
              ? "bg-tertiary text-on-tertiary"
              : "bg-primary-container text-on-primary-fixed shadow-shutter hover:brightness-105"
          } ${status === "confirming" ? "opacity-90" : ""}`}
        >
          {status === "idle" && <Icon name="volunteer_activism" className="text-[22px]" />}
          {status === "confirming" && <Icon name="progress_activity" className="animate-spin text-[22px]" />}
          <span className="font-bold tracking-tight">{supportLabel}</span>
        </button>
        <p className="flex items-center justify-center gap-2 text-center text-body-sm text-on-surface-variant">
          <Icon name="verified_user" className="text-[14px] text-secondary" />
          Instant on Base · Balance:{" "}
          <span className={`font-bold tabular-nums ${insufficient ? "text-error" : "text-on-surface"}`}>
            {usd(balance)} USDC
          </span>
        </p>
      </div>
    </section>
  );
}
