"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Plus,
  Shield,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { BackButton } from "@/components/layout/back-button";
import { useAuth } from "@/components/providers/auth-provider";
import { getWalletBalance, getWalletTransfers } from "@/lib/api-client";
import type { WalletBalance, WalletTransfer } from "@/lib/types";

const EXPLORER = "https://testnet.bscscan.com";

const usd = (n: number) => n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function shortAddress(address?: string | null) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

type Action = { label: string; icon: LucideIcon; href?: string };

const actions: Action[] = [
  { label: "Top up", icon: Plus },
  { label: "Send", icon: ArrowUpRight },
  { label: "Receive", icon: ArrowDownLeft },
  { label: "Rewards", icon: Trophy, href: "/rewards" },
];

export default function WalletPage() {
  const { authenticated, user } = useAuth();
  const [hideBalance, setHideBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transfers, setTransfers] = useState<WalletTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const address = user?.walletAddress ?? null;

  useEffect(() => {
    if (!authenticated || !user) return;
    let cancelled = false;
    Promise.all([getWalletBalance(), getWalletTransfers(20)])
      .then(([b, t]) => {
        if (cancelled) return;
        setBalance(b);
        setTransfers(t);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load wallet data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authenticated, user]);

  const received = transfers.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = transfers.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  async function copyAddress() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="flex flex-col gap-space-md px-space-md pb-4 sm:px-0">
      <div className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-2">
          <BackButton fallbackHref="/home" />
          <div>
            <h1 className="text-headline-sm font-extrabold tracking-tight">Wallet</h1>
            <p className="text-label-sm text-on-surface-variant">BSC Testnet · USDC</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={hideBalance ? "Show balance" : "Hide balance"}
          onClick={() => setHideBalance((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
        >
          {hideBalance ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

      <section className="relative overflow-hidden rounded-3xl border-2 border-white/15 bg-gradient-to-br from-secondary-container via-secondary to-on-primary-fixed p-space-md text-white shadow-pop-yellow">
        <div className="pointer-events-none absolute -top-10 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-primary-container/25 blur-2xl" />
        <div className="relative flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-sm text-white/75">Available balance</span>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-headline-xl-mobile font-black tabular-nums">
                  {loading ? (
                    <Loader2 size={28} className="animate-spin" />
                  ) : hideBalance ? (
                    "••••"
                  ) : (
                    usd(Number(balance?.balance ?? 0))
                  )}
                </span>
                <span className="mb-1.5 rounded-full bg-white/15 px-2 py-0.5 text-label-sm backdrop-blur">
                  {balance?.symbol ?? "USDC"}
                </span>
              </div>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Wallet size={22} />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl bg-black/15 p-3 backdrop-blur-sm">
            <span className="text-label-sm text-white/70">Connected address</span>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate text-body-sm font-semibold">
                {address ?? "No wallet yet"}
              </code>
              {address && (
                <button
                  type="button"
                  aria-label="Copy address"
                  onClick={copyAddress}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
            {(copied || address) && (
              <span className="text-label-sm text-white/70">
                {copied ? "Copied!" : address && <>{shortAddress(address)} on BSC Testnet</>}
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-space-xs">
            {actions.map((a) => {
              const Icon = a.icon;
              if (!a.href) {
                return (
                  <div
                    key={a.label}
                    aria-disabled="true"
                    className="flex flex-col items-center gap-1 rounded-2xl bg-white/8 py-3 text-label-sm text-white/50 ring-1 ring-white/10"
                  >
                    <Icon size={20} />
                    {a.label}
                    <span className="text-[9px] font-bold uppercase tracking-wide">Soon</span>
                  </div>
                );
              }
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/12 py-3 text-label-sm ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
                >
                  <Icon size={20} />
                  {a.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {balance && !balance.configured && (
        <p className="rounded-2xl bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant">
          USDC testnet token isn&apos;t configured yet — balance and history will show once it is.
        </p>
      )}
      {error && (
        <p className="rounded-2xl bg-error/10 px-3 py-2 text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-space-sm">
        <div className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-4 shadow-soft">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-tertiary-container/50 text-on-tertiary-container">
              <ArrowDownLeft size={14} />
            </span>
            Received
          </div>
          <p className="mt-1.5 text-headline-sm font-extrabold text-tertiary tabular-nums">+{usd(received)}</p>
        </div>
        <div className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-4 shadow-soft">
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-error-container text-on-error-container">
              <ArrowUpRight size={14} />
            </span>
            Sent
          </div>
          <p className="mt-1.5 text-headline-sm font-extrabold tabular-nums">−{usd(spent)}</p>
        </div>
      </div>

      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="text-label-lg font-extrabold">Transactions</h2>
          <span className="text-label-sm text-on-surface-variant">On-chain · BSC Testnet</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-label-sm text-on-surface-variant">
            <Loader2 size={18} className="animate-spin" />
            Loading transfers…
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-label-md text-on-surface-variant">No transfers yet</p>
            <p className="max-w-[220px] text-body-sm text-on-surface-variant/80">
              USDC sent to or from your wallet on BSC testnet will show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {transfers.map((tx) => {
              const positive = tx.amount >= 0;
              return (
                <li key={`${tx.hash}-${tx.logIndex}`}>
                  <a
                    href={`${EXPLORER}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 py-1 transition-opacity hover:opacity-80"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        positive
                          ? "bg-tertiary-container/50 text-on-tertiary-container"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {positive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label-md">{positive ? "Received" : "Sent"} USDC</p>
                      <p className="truncate text-label-sm text-on-surface-variant">
                        {shortAddress(tx.counterparty)} · Block {tx.blockNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-label-lg whitespace-nowrap tabular-nums ${positive ? "text-tertiary" : "text-on-surface"}`}
                      >
                        {positive ? "+" : "−"}
                        {usd(Math.abs(tx.amount))} USDC
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-on-surface-variant">
                        View <ExternalLink size={10} />
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container p-3 text-on-surface-variant">
        <Shield size={18} className="mt-0.5 shrink-0 text-secondary" />
        <p className="text-body-sm leading-snug">
          Balance and history are read directly from BSC testnet — no custody, no signing. Send, Top up
          and Receive are coming soon.
        </p>
      </div>
    </div>
  );
}
