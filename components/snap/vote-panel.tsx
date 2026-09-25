"use client";

import { useState } from "react";
import { CircleCheck, CircleDollarSign, Loader2, Sparkles, Zap } from "lucide-react";
import {
  EST_PAYOUT_PER_VOTE_USDC,
  VOTER_POOL_SHARE,
  votesFor,
  type VoteTier,
} from "@/lib/mock-data";

type Selection = { kind: "tier"; usdc: number } | { kind: "custom" };
type Status = "idle" | "confirming" | "success";

type Props = {
  creatorName: string;
  poolUsdc: number;
  tiers: VoteTier[];
  balance: number;
  /** Called once the (mock) transaction confirms. */
  onVoted: (usdc: number, votes: number) => void;
};

const usd = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function VotePanel({ creatorName, poolUsdc, tiers, balance, onVoted }: Props) {
  const [selection, setSelection] = useState<Selection>({ kind: "tier", usdc: 10 });
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const amount = selection.kind === "tier" ? selection.usdc : Number(custom) || 0;
  const votes = votesFor(amount);
  const insufficient = amount > balance;
  const canSubmit = status === "idle" && amount >= 1 && !insufficient;

  function submit() {
    if (!canSubmit) return;
    // Mock transaction. Replace with the Base wallet USDC transfer once wired up.
    setStatus("confirming");
    setTimeout(() => {
      setStatus("success");
      onVoted(amount, votes);
      navigator.vibrate?.([25, 50, 25]);
      setTimeout(() => setStatus("idle"), 2200);
    }, 1000);
  }

  const buttonLabel =
    status === "confirming"
      ? "Confirming on Base..."
      : status === "success"
        ? "Vote Cast Successfully!"
        : selection.kind === "custom" && amount < 1
          ? "Enter Custom Amount"
          : insufficient
            ? "Insufficient USDC balance"
            : `Vote ${amount} USDC with Base Wallet`;

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary">
          <Zap size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-headline-sm font-extrabold tracking-tight">Vote to Support &amp; Win USDC</h2>
            <Sparkles size={18} className="text-secondary-container" />
          </div>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            Boost {creatorName} to stay in Top 3! When this challenge ends, voters split{" "}
            <span className="font-bold text-tertiary">
              {VOTER_POOL_SHARE * 100}% of the ${poolUsdc.toLocaleString("en")} USDC prize pool
            </span>{" "}
            proportionally.
          </p>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <legend className="text-label-sm tracking-wider text-on-surface-variant uppercase">Select Vote Amount</legend>
          <span className="text-label-sm text-secondary">1 USDC = 1 Vote</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tiers.map((tier) => {
            const active = selection.kind === "tier" && selection.usdc === tier.usdc;
            return (
              <button
                key={tier.usdc}
                type="button"
                aria-pressed={active}
                disabled={status !== "idle"}
                onClick={() => setSelection({ kind: "tier", usdc: tier.usdc })}
                className={`relative flex flex-col items-start rounded-2xl p-3 text-left transition-all ${
                  active ? "bg-secondary-fixed text-on-secondary-fixed shadow-sm" : "bg-surface-container hover:bg-surface-container-high"
                }`}
              >
                {tier.bonusPct && (
                  <span className="absolute -top-2 -right-1 rounded-full bg-tertiary px-2 py-0.5 text-label-sm text-on-tertiary shadow-sm">
                    +{tier.bonusPct}% bonus
                  </span>
                )}
                <span className="flex w-full items-center justify-between">
                  <span className={`text-label-lg ${active ? "font-extrabold text-secondary" : ""}`}>{tier.usdc} USDC</span>
                  <CircleCheck
                    size={18}
                    fill="currentColor"
                    className={`text-secondary transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                  />
                </span>
                <span className={`mt-1 text-label-sm ${active ? "text-on-secondary-fixed-variant" : "text-on-surface-variant"}`}>
                  {tier.votes} {tier.votes === 1 ? "Vote" : "Votes"}
                  {tier.bonusPct && " bonus"}
                </span>
              </button>
            );
          })}

          {selection.kind === "custom" ? (
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
              <span className="mt-1 text-label-sm text-on-secondary-fixed-variant">
                {votes} {votes === 1 ? "Vote" : "Votes"}
                {amount >= 10 && " (+20%)"}
              </span>
            </label>
          ) : (
            <button
              type="button"
              disabled={status !== "idle"}
              onClick={() => setSelection({ kind: "custom" })}
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
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-tertiary-container/50 text-on-tertiary-container">
            <CircleDollarSign size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-label-sm">Estimated Share</span>
            <span className="text-body-sm text-on-surface-variant">Top 3 Payout Pool</span>
          </div>
        </div>
        <div className="text-right" aria-live="polite">
          <span className="text-label-lg font-extrabold text-tertiary tabular-nums">
            {votes > 0 ? `~$${usd(votes * EST_PAYOUT_PER_VOTE_USDC)} USDC` : "—"}
          </span>
          <span className="block text-label-sm text-on-surface-variant">at current rank</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit && status === "idle"}
          aria-live="polite"
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-label-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
            status === "success"
              ? "bg-tertiary text-on-tertiary"
              : "bg-secondary-container text-on-secondary-container shadow-shutter hover:bg-secondary"
          } ${status === "confirming" ? "opacity-90" : ""}`}
        >
          {status === "idle" && <Zap size={22} />}
          {status === "confirming" && <Loader2 size={22} className="animate-spin" />}
          <span className="font-bold tracking-tight">{buttonLabel}</span>
        </button>
        <p className="flex items-center justify-center gap-2 text-center text-body-sm text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          Instant transaction on Base • Balance:{" "}
          <span className={`font-bold tabular-nums ${insufficient ? "text-error" : "text-on-surface"}`}>
            {usd(balance)} USDC
          </span>
        </p>
      </div>
    </section>
  );
}
