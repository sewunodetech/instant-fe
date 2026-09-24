"use client";

import { useEffect, useState } from "react";
import { Check, CircleCheck, ExternalLink, RefreshCw, Share2, Zap } from "lucide-react";
import { ConfettiLayer, useConfetti } from "@/components/confetti";

type Status = "idle" | "claiming" | "claimed";

const usd = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  totalUsdc: number;
  wallet: { network: string; address: string };
  shareText: string;
};

export function ClaimPanel({ totalUsdc, wallet, shareText }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [toast, setToast] = useState(false);
  const [shared, setShared] = useState(false);
  const { particles, burst } = useConfetti(14);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function claim() {
    if (status !== "idle") return;
    // Mock payout. Replace with the Base USDC claim transaction once wired up.
    setStatus("claiming");
    burst();
    setTimeout(() => {
      setStatus("claimed");
      setToast(true);
    }, 1000);
  }

  async function share() {
    burst();
    if (navigator.share) await navigator.share({ text: shareText, url: window.location.origin }).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  return (
    <>
      <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-[13px] font-black text-on-secondary-container shadow-sm">
              {wallet.network.toUpperCase()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-label-lg">{wallet.address}</span>
                <span className="h-2 w-2 rounded-full bg-tertiary" />
              </div>
              <span className="text-body-sm text-on-surface-variant">Connected Primary Wallet</span>
            </div>
          </div>
          <button className="rounded-full bg-surface-container px-3 py-1.5 text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high">
            Change
          </button>
        </div>
      </section>

      <div className="relative flex flex-col gap-3 pt-2">
        <ConfettiLayer particles={particles} />
        <button
          onClick={claim}
          disabled={status !== "idle"}
          aria-live="polite"
          className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-label-lg shadow-[0_4px_20px_rgba(17,17,17,0.08)] transition-all active:translate-y-0.5 active:scale-[0.98] ${
            status === "claimed" ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary-container text-on-primary-container"
          }`}
        >
          {status === "claiming" ? (
            <RefreshCw size={22} className="animate-spin" />
          ) : status === "claimed" ? (
            <CircleCheck size={22} />
          ) : (
            <Zap size={22} />
          )}
          {status === "claiming"
            ? "Signing & Dispatching..."
            : status === "claimed"
              ? "Claimed Successfully!"
              : "Instant Claim & Withdraw to Wallet"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-body-sm text-on-surface-variant">
          <Zap size={16} fill="currentColor" className="text-tertiary" />
          Instant payout • Powered by Base • No lockups or delays
        </p>
        <button
          onClick={share}
          className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary-fixed text-label-lg text-secondary transition-all active:scale-[0.98]"
        >
          {shared ? <Check size={20} /> : <Share2 size={20} />}
          {shared ? "Story Ready to Share!" : "Share Win to Instagram Story"}
        </button>
        <a
          href="https://basescan.org"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 py-2 text-center text-label-sm text-on-surface-variant transition-colors hover:text-secondary"
        >
          View Transaction Contract on BaseScan
          <ExternalLink size={14} />
        </a>
      </div>

      <div
        role="status"
        className={`fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-[398px] items-center gap-3 rounded-2xl bg-inverse-surface p-4 text-inverse-on-surface shadow-xl transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-32 opacity-0"
        }`}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary text-on-tertiary">
          <Check size={18} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-label-md">{usd(totalUsdc)} USDC Dispatched!</span>
          <span className="truncate text-body-sm text-inverse-on-surface/80">Transaction confirmed on Base</span>
        </div>
      </div>
    </>
  );
}
