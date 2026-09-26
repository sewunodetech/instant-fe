"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, ExternalLink, HandCoins, Loader2, Lock, RotateCcw, Undo2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  fundEscrowIntent,
  listCampaignPosts,
  listEscrowPayouts,
  payoutEscrowIntent,
  refundEscrowIntent,
} from "@/lib/api-client";
import { explorerTxUrl } from "@/lib/contracts/instant-fun";
import type { ApiEscrowPayout, ApiPost, EscrowStatus, TransactionIntent } from "@/lib/types";
import { TX_STEP_LABEL, describeTxError, useInstantFun, type TxStep } from "@/lib/wallet/use-instant-fun";

export type BrandEscrowCampaign = {
  id: string;
  brandName: string | null;
  creatorId: string | null;
  escrowStatus: EscrowStatus | null;
  escrowBudget: string | null;
  escrowFunded: string;
  escrowPaidOut: string;
  escrowRefunded: string;
  endsAt: string | null;
};

type Action = "fund" | "payout" | "topup" | "refund";

const STATUS_LABEL: Record<EscrowStatus, string> = {
  AWAITING_DEPOSIT: "Awaiting deposit",
  FUNDED: "Escrow funded",
  CLOSED: "Closed",
};

const usdc = (n: number) => n.toLocaleString("en", { maximumFractionDigits: 2 });

function handleOf(user?: ApiPost["user"] | null) {
  if (user?.username) return `@${user.username}`;
  const w = user?.walletAddress;
  return w ? `${w.slice(0, 6)}…${w.slice(-4)}` : "creator";
}

export function BrandEscrowPanel({ campaign }: { campaign: BrandEscrowCampaign }) {
  const router = useRouter();
  const { user } = useAuth();
  const { run } = useInstantFun();
  const isOwner = Boolean(user && campaign.creatorId === user.id);

  const funded = Number(campaign.escrowFunded);
  const paid = Number(campaign.escrowPaidOut);
  const refunded = Number(campaign.escrowRefunded);
  const remaining = Math.max(0, funded - paid - refunded);
  const budget = Number(campaign.escrowBudget ?? 0);
  const status = campaign.escrowStatus ?? "AWAITING_DEPOSIT";
  const endsAt = campaign.endsAt ? new Date(campaign.endsAt) : null;
  const [now] = useState(() => Date.now());
  const ended = Boolean(endsAt && endsAt.getTime() <= now);

  const [payouts, setPayouts] = useState<ApiEscrowPayout[]>([]);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [topUp, setTopUp] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [step, setStep] = useState<TxStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const loadPayouts = useCallback(() => {
    listEscrowPayouts(campaign.id, 1, 10)
      .then(({ data }) => setPayouts(data))
      .catch(() => setPayouts([]));
  }, [campaign.id]);

  useEffect(loadPayouts, [loadPayouts]);

  useEffect(() => {
    if (!isOwner || status !== "FUNDED") return;
    listCampaignPosts(campaign.id, { page: 1, limit: 50 })
      .then(({ data }) => setPosts(data.filter((p) => p.user.id !== user?.id)))
      .catch(() => setPosts([]));
  }, [campaign.id, isOwner, status, user?.id]);

  const selected = useMemo(
    () =>
      Object.entries(amounts)
        .map(([postId, v]) => ({ postId, amount: Number(v) }))
        .filter((i) => i.amount > 0),
    [amounts]
  );
  const selectedTotal = selected.reduce((s, i) => s + i.amount, 0);

  async function send(action: Action, getIntent: () => Promise<{ transaction: TransactionIntent }>) {
    setBusy(action);
    setError(null);
    setStep("preparing");
    try {
      const { transaction } = await getIntent();
      await run(transaction, { onStep: setStep });
      if (action === "payout") setAmounts({});
      if (action === "topup") setTopUp("");
      loadPayouts();
      router.refresh();
    } catch (err) {
      setError(describeTxError(err));
    } finally {
      setBusy(null);
      setStep("idle");
    }
  }

  const label = (action: Action, idle: string) => (busy === action ? TX_STEP_LABEL[step] || "Working..." : idle);

  return (
    <section className="flex flex-col gap-space-sm rounded-3xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed">
            <Building2 size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-headline-sm">{campaign.brandName ?? "Brand"} budget</h3>
            <p className="text-body-sm text-on-surface-variant">Held in escrow · brand picks who gets paid</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-surface-container px-2.5 py-0.5 text-label-sm text-on-surface-variant">
          {STATUS_LABEL[status]}
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-space-xs">
        {[
          { label: "Locked", value: funded },
          { label: "Paid out", value: paid },
          { label: status === "CLOSED" ? "Refunded" : "Remaining", value: status === "CLOSED" ? refunded : remaining },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center rounded-2xl bg-surface-container-low p-2.5 text-center">
            <dt className="order-last text-label-sm text-on-surface-variant">{s.label}</dt>
            <dd className="text-headline-sm leading-tight tabular-nums">{usdc(s.value)}</dd>
          </div>
        ))}
      </dl>
      {funded > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-surface-container" aria-hidden>
          <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(100, (paid / funded) * 100)}%` }} />
        </div>
      )}

      <p className="flex items-start gap-2 text-body-sm leading-snug text-on-surface-variant">
        <Lock size={16} className="mt-0.5 shrink-0 text-secondary" />
        {status === "AWAITING_DEPOSIT"
          ? "This campaign goes live once the brand locks its budget in the escrow contract."
          : `Payouts go straight from escrow to the creator's wallet.${
              endsAt && status === "FUNDED"
                ? ` Unspent budget can return to the brand after ${endsAt.toLocaleDateString("en", { month: "short", day: "numeric" })}.`
                : ""
            }`}
      </p>

      {payouts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-label-sm tracking-wider text-on-surface-variant uppercase">Recent payouts</p>
          {payouts.map((p) => (
            <a
              key={p.id}
              href={explorerTxUrl(p.txHash)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-surface-container-low px-3 py-2 text-body-sm hover:bg-surface-container"
            >
              <span className="truncate">{handleOf(p.creator)}</span>
              <span className="flex shrink-0 items-center gap-1 font-bold tabular-nums">
                {usdc(Number(p.amount))} USDC
                <ExternalLink size={12} className="text-on-surface-variant" />
              </span>
            </a>
          ))}
        </div>
      )}

      {isOwner && status === "AWAITING_DEPOSIT" && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => send("fund", () => fundEscrowIntent(campaign.id))}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-fixed shadow-shutter transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {busy === "fund" ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
          {label("fund", `Deposit ${usdc(Math.max(0, budget - funded))} USDC`)}
        </button>
      )}

      {isOwner && status === "FUNDED" && (
        <div className="flex flex-col gap-space-sm border-t border-surface-container pt-space-sm">
          <p className="text-label-lg">Pay creators</p>
          {posts.length === 0 ? (
            <p className="rounded-2xl bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
              No snaps from creators yet.
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
              {posts.map((post) => (
                <li key={post.id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-2">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    <Image src={post.imageUrl} alt="" fill sizes="44px" unoptimized className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-md">{handleOf(post.user)}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {post.voteCount} votes
                      {Number(post.escrowPaidAmount ?? 0) > 0 && ` · paid ${usdc(Number(post.escrowPaidAmount))}`}
                    </p>
                  </div>
                  <div className="flex h-10 w-28 items-center rounded-full bg-surface-container-lowest px-3">
                    <input
                      inputMode="decimal"
                      type="number"
                      min={0}
                      placeholder="0"
                      aria-label={`USDC for ${handleOf(post.user)}`}
                      value={amounts[post.id] ?? ""}
                      disabled={busy !== null}
                      onChange={(e) => setAmounts((a) => ({ ...a, [post.id]: e.target.value }))}
                      className="w-full min-w-0 bg-transparent text-body-md tabular-nums outline-none"
                    />
                    <span className="text-label-sm text-on-surface-variant">USDC</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            disabled={busy !== null || selected.length === 0 || selectedTotal > remaining}
            onClick={() => send("payout", () => payoutEscrowIntent(campaign.id, selected))}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary-container text-label-lg text-on-primary-fixed shadow-shutter transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {busy === "payout" ? <Loader2 size={20} className="animate-spin" /> : <HandCoins size={20} />}
            {label(
              "payout",
              selectedTotal > remaining
                ? `Only ${usdc(remaining)} USDC left`
                : selected.length
                  ? `Pay ${selected.length} creator${selected.length > 1 ? "s" : ""} · ${usdc(selectedTotal)} USDC`
                  : "Enter amounts to pay"
            )}
          </button>

          <div className="flex gap-2">
            <div className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-surface-container-low px-3">
              <input
                inputMode="decimal"
                type="number"
                min={1}
                placeholder="Top up"
                aria-label="Top up amount"
                value={topUp}
                disabled={busy !== null}
                onChange={(e) => setTopUp(e.target.value)}
                className="w-full min-w-0 bg-transparent text-body-md tabular-nums outline-none"
              />
              <span className="text-label-sm text-on-surface-variant">USDC</span>
            </div>
            <button
              type="button"
              disabled={busy !== null || !(Number(topUp) >= 1)}
              onClick={() => send("topup", () => fundEscrowIntent(campaign.id, Number(topUp)))}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-surface-container px-4 text-label-md transition-all hover:bg-surface-container-high disabled:opacity-50"
            >
              {busy === "topup" ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
              {busy === "topup" ? "..." : "Top up"}
            </button>
          </div>

          <button
            type="button"
            disabled={busy !== null || !ended}
            onClick={() => send("refund", () => refundEscrowIntent(campaign.id))}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full text-label-md text-on-surface-variant transition-all hover:bg-surface-container disabled:opacity-50"
          >
            {busy === "refund" ? <Loader2 size={16} className="animate-spin" /> : <Undo2 size={16} />}
            {label("refund", ended ? `Refund ${usdc(remaining)} USDC & close escrow` : "Refund unlocks when the campaign ends")}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-center text-body-sm text-error">
          {error}
        </p>
      )}
    </section>
  );
}
