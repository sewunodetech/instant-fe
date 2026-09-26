"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, HandHeart, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { SuccessBurst } from "@/components/ui/success-burst";
import {
  cancelSupport,
  confirmSupport,
  createSupportIntent,
  errorMessage,
  getWalletBalance,
} from "@/lib/api-client";
import { NETWORK_NAME, txUrl } from "@/lib/chain";
import { FaucetLinks } from "@/components/ui/faucet-links";
import { useApi } from "@/lib/use-api";
import { isUserRejection, useAppWallet, walletErrorMessage } from "@/lib/wallet";
import type { ApiPost } from "@/lib/types";
import { AMOUNT_STEP, COIN, IS_NATIVE, MIN_SUPPORT, SUPPORT_TIERS, amount as fmt, coin } from "@/lib/currency";
type Status = "idle" | "preparing" | "signing" | "confirming" | "success" | "error";

/**
 * Tip a creator in BNB (or USDC, per config). No contract yet: the supporter
 * signs a direct transfer to the creator's wallet and the server verifies it on-chain.
 */
export function SupportPanel({
  post,
  creatorName,
  onSupported,
}: {
  post: ApiPost;
  creatorName: string;
  onSupported: (update: { donationCount: number; donationAmount: number }) => void;
}) {
  const wallet = useAppWallet();
  const balance = useApi(() => getWalletBalance(), []);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const value = custom ? Number(custom) : (amount ?? 0);
  const native = Number(balance.data?.nativeBalance ?? 0);
  const available = IS_NATIVE ? native : Number(balance.data?.balance ?? 0);
  const hasGas = native > 0;
  const configured = IS_NATIVE || (balance.data?.configured ?? true);
  // Only block on balance when we actually read it from the chain.
  const insufficient = balance.data?.onchainAvailable ? value > available : false;
  const busy = status === "preparing" || status === "signing" || status === "confirming";
  const canSend = !busy && value >= MIN_SUPPORT && !insufficient && configured && Boolean(wallet.address);

  async function support() {
    if (!canSend) return;
    setStatus("preparing");
    setMessage(null);
    setTxHash(null);
    let donationId: string | null = null;
    try {
      const intent = await createSupportIntent(post.id, value);
      donationId = intent.donation.id;

      setStatus("signing");
      let hash: string;
      try {
        const { transfer } = intent;
        const description = `Support ${creatorName} with ${coin(value)}`;
        hash =
          transfer.kind === "native" || !transfer.tokenAddress
            ? await wallet.sendNative({ to: transfer.to, amountWei: BigInt(transfer.amountRaw), description })
            : await wallet.sendToken({
                tokenAddress: transfer.tokenAddress,
                to: transfer.to,
                amountRaw: BigInt(transfer.amountRaw),
                description,
              });
      } catch (e) {
        void cancelSupport(intent.donation.id).catch(() => {});
        if (isUserRejection(e)) {
          setStatus("idle");
          return;
        }
        throw new Error(walletErrorMessage(e));
      }
      setTxHash(hash);

      setStatus("confirming");
      for (let attempt = 0; attempt < 6; attempt++) {
        const result = await confirmSupport(intent.donation.id, hash);
        if (result.status === "CONFIRMED") {
          if (result.post) onSupported(result.post);
          setStatus("success");
          setAmount(null);
          setCustom("");
          navigator.vibrate?.([25, 50, 25]);
          void balance.reload();
          return;
        }
        if (result.status === "FAILED") throw new Error("The transfer failed on-chain.");
      }
      setMessage("Sent! Confirmation is taking longer than usual — it will show up shortly.");
      setStatus("success");
    } catch (e) {
      if (donationId && !txHash) void cancelSupport(donationId).catch(() => {});
      setStatus("error");
      setMessage(e instanceof Error && !(e instanceof TypeError) ? errorMessage(e, e.message) : errorMessage(e));
    }
  }

  const label =
    status === "preparing"
      ? "Preparing…"
      : status === "signing"
        ? "Confirm in your wallet…"
        : status === "confirming"
          ? `Confirming on ${NETWORK_NAME}…`
          : value >= MIN_SUPPORT
            ? insufficient
              ? `Not enough ${COIN}`
              : `Send ${coin(value)} to ${creatorName}`
            : "Choose an amount";

  return (
    <section
      id="support"
      className="flex w-full scroll-mt-24 flex-col gap-4 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary shadow-sm">
          <HandHeart size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-headline-sm font-extrabold tracking-tight">Support the creator</h2>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            Send {COIN} straight to {creatorName}&apos;s wallet. 100% goes to them — no platform fee.
          </p>
        </div>
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl bg-secondary-fixed/60 p-4 text-center"
        >
          <SuccessBurst />
          <motion.span
            initial={{ scale: 0.3, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 12 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary shadow-pop-blue"
          >
            <HandHeart size={28} fill="currentColor" />
          </motion.span>
          <p className="text-label-lg">Support sent — thank you!</p>
          {message && <p className="text-body-sm text-on-surface-variant">{message}</p>}
          {txHash && (
            <a
              href={txUrl(txHash)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-label-sm text-secondary"
            >
              View transaction <ExternalLink size={12} />
            </a>
          )}
          <button type="button" onClick={() => setStatus("idle")} className="text-label-sm text-on-surface-variant underline">
            Send more
          </button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {SUPPORT_TIERS.map((tier) => {
              const active = !custom && amount === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={active}
                  disabled={busy}
                  onClick={() => {
                    setCustom("");
                    setAmount(tier);
                  }}
                  className={`h-12 rounded-2xl text-label-lg transition-all active:scale-95 ${
                    active ? "bg-secondary-fixed font-extrabold text-secondary shadow-sm" : "bg-surface-container"
                  }`}
                >
                  {fmt(tier)}
                </button>
              );
            })}
          </div>
          <label className="flex h-12 items-center gap-2 rounded-2xl bg-surface-container-low px-4 ring-2 ring-transparent focus-within:ring-secondary/40">
            <input
              inputMode="decimal"
              type="number"
              min={MIN_SUPPORT}
              step={AMOUNT_STEP}
              value={custom}
              disabled={busy}
              onChange={(e) => {
                setCustom(e.target.value);
                setAmount(null);
              }}
              placeholder="Custom amount"
              aria-label={`Custom ${COIN} amount`}
              className="w-full min-w-0 bg-transparent text-body-md outline-none"
            />
            <span className="text-label-md text-on-surface-variant">{COIN}</span>
          </label>

          {(message || balance.error) && (
            <p role="alert" className="rounded-2xl bg-error/10 px-3 py-2 text-body-sm text-error">
              {message || balance.error}
            </p>
          )}
          {!configured && (
            <p className="rounded-2xl bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant">
              USDC support isn&apos;t enabled on this network yet.
            </p>
          )}
          {IS_NATIVE && balance.data?.onchainAvailable && !hasGas && <FaucetLinks title={`Your wallet is empty — claim free ${COIN}`} />}
          {configured && balance.data && !hasGas && !IS_NATIVE && (
            <p className="rounded-2xl bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant">
              Your wallet needs a little {balance.data.nativeSymbol} for network fees.{" "}
              <Link href="/wallet" className="font-bold text-secondary">
                Open wallet
              </Link>
            </p>
          )}

          <button
            type="button"
            onClick={support}
            disabled={!canSend}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-secondary-container text-label-lg text-on-secondary shadow-shutter transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 size={22} className="animate-spin" /> : <HandHeart size={22} />}
            <span className="font-bold tracking-tight">{label}</span>
          </button>
        </>
      )}

      <Link
        href="/wallet"
        className="flex items-center justify-center gap-2 text-center text-body-sm text-on-surface-variant"
      >
        <Wallet size={14} className="text-secondary" />
        Balance:{" "}
        <span className={`font-bold tabular-nums ${insufficient ? "text-error" : "text-on-surface"}`}>
          {balance.loading ? "…" : `${coin(available)}`}
        </span>
        <ShieldCheck size={14} className="text-secondary" />
        {NETWORK_NAME}
      </Link>
    </section>
  );
}
