"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { BackButton } from "@/components/layout/back-button";
import { currentUser, walletTxs, type TxKind } from "@/lib/mock-data";

const txMeta: Record<TxKind, { icon: string; className: string; sign: "+" | "-" | "" }> = {
  in: { icon: "south_west", className: "bg-tertiary-container text-on-tertiary-container", sign: "+" },
  out: { icon: "north_east", className: "bg-error-container text-on-error-container", sign: "−" },
  reward: { icon: "emoji_events", className: "bg-primary-container text-on-primary-fixed", sign: "+" },
  deposit: { icon: "add_circle", className: "bg-secondary-fixed text-on-secondary-fixed", sign: "+" },
};

const actions = [
  { label: "Top up", icon: "add", href: "/wallet" },
  { label: "Send", icon: "arrow_outward", href: "/wallet" },
  { label: "Receive", icon: "call_received", href: "/wallet" },
  { label: "Rewards", icon: "emoji_events", href: "/rewards" },
] as const;

const usd = (n: number) => Math.abs(n).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function WalletPage() {
  const [hideBalance, setHideBalance] = useState(false);

  const received = walletTxs.filter((t) => t.amountUsdc > 0).reduce((s, t) => s + t.amountUsdc, 0);
  const spent = walletTxs.filter((t) => t.amountUsdc < 0).reduce((s, t) => s + Math.abs(t.amountUsdc), 0);

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/home" />
          <div>
            <h1 className="text-headline-sm tracking-tight">Wallet</h1>
            <p className="text-label-sm text-on-surface-variant">{currentUser.wallet.network} · USDC</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={hideBalance ? "Show balance" : "Hide balance"}
          onClick={() => setHideBalance((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name={hideBalance ? "visibility_off" : "visibility"} className="text-[22px]" />
        </button>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-container via-secondary to-on-primary-fixed p-space-md text-white shadow-pop-yellow">
        <div className="pointer-events-none absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-primary-container/25 blur-2xl" />
        <div className="relative flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-sm text-white/75">Available balance</span>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-headline-xl-mobile font-black tabular-nums">
                  {hideBalance ? "••••" : usd(currentUser.usdcBalance)}
                </span>
                <span className="mb-1.5 rounded-full bg-white/15 px-2 py-0.5 text-label-sm backdrop-blur">USDC</span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Icon name="account_balance_wallet" className="text-[22px]" />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl bg-black/15 p-3 backdrop-blur-sm">
            <span className="text-label-sm text-white/70">Connected address</span>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate text-body-sm font-semibold">{currentUser.wallet.address}</code>
              <button
                type="button"
                aria-label="Copy address"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15"
              >
                <Icon name="content_copy" className="text-[16px]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-space-xs">
            {actions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/12 py-3 text-label-sm ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
              >
                <Icon name={a.icon} className="text-[20px]" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-space-sm">
        <div className="rounded-3xl bg-surface-container-lowest p-4 shadow-card">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-tertiary-container/50 text-on-tertiary-container">
              <Icon name="south_west" className="text-[14px]" />
            </span>
            Received
          </div>
          <p className="mt-1.5 text-headline-sm text-tertiary tabular-nums">+{usd(received)}</p>
        </div>
        <div className="rounded-3xl bg-surface-container-lowest p-4 shadow-card">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-error-container text-on-error-container">
              <Icon name="north_east" className="text-[14px]" />
            </span>
            Sent
          </div>
          <p className="mt-1.5 text-headline-sm tabular-nums">−{usd(spent)}</p>
        </div>
      </div>

      <section className="rounded-3xl bg-surface-container-lowest p-space-md shadow-card">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="text-label-lg">Transactions</h2>
          <button type="button" className="flex items-center gap-1 text-label-sm text-secondary">
            Filter <Icon name="tune" className="text-[14px]" />
          </button>
        </div>
        <ul className="flex flex-col gap-2.5">
          {walletTxs.map((tx) => {
            const meta = txMeta[tx.kind];
            const positive = tx.amountUsdc >= 0;
            return (
              <li key={tx.id} className="flex items-center gap-3 py-1">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
                  <Icon name={meta.icon} className="text-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label-md">{tx.label}</p>
                  <p className="truncate text-label-sm text-on-surface-variant">
                    {tx.note} · {tx.timeAgo}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`text-label-lg whitespace-nowrap tabular-nums ${positive ? "text-tertiary" : "text-on-surface"}`}
                  >
                    {meta.sign}
                    {usd(tx.amountUsdc)} USDC
                  </span>
                  <span
                    className={`text-[10px] font-bold ${tx.status === "confirmed" ? "text-on-surface-variant" : "text-secondary"}`}
                  >
                    {tx.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex items-start gap-3 rounded-3xl bg-surface-container p-3 text-on-surface-variant">
        <Icon name="shield" className="mt-0.5 shrink-0 text-[18px] text-secondary" />
        <p className="text-body-sm leading-snug">
          Balances settle instantly on Base. Gas is sponsored for votes and rewards.
        </p>
      </div>
    </div>
  );
}
