"use client";

import { useState } from "react";
import { isAddress, parseEther, parseUnits } from "ethers";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Fuel,
  KeyRound,
  Loader2,
  RefreshCw,
  Shield,
  Wallet,
  X,
} from "lucide-react";
import { headerIconButton, ScreenHeader } from "@/components/layout/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state";
import { getWalletBalance, getWalletTransfers } from "@/lib/api-client";
import { addressUrl, FAUCET_URL, NETWORK_NAME, txUrl } from "@/lib/chain";
import { shortAddress, usdc } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { isUserRejection, useAppWallet, walletErrorMessage } from "@/lib/wallet";
import type { WalletBalance } from "@/lib/types";

function CopyButton({ value, className = "" }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy address"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard unavailable
        }
      }}
      className={className}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}

export default function WalletPage() {
  const wallet = useAppWallet();
  const [hideBalance, setHideBalance] = useState(false);
  const [sheet, setSheet] = useState<"send" | "receive" | null>(null);
  const balance = useApi(() => getWalletBalance(), [wallet.address]);
  const transfers = useApi(() => getWalletTransfers(20), [wallet.address]);

  const address = wallet.address;
  const refresh = () => {
    void balance.reload();
    void transfers.reload();
  };

  return (
    <>
    <ScreenHeader
      back="/profile"
      title="Wallet"
      subtitle={`${NETWORK_NAME} · USDC`}
      actions={
        <>
          <button type="button" aria-label="Refresh" onClick={refresh} className={headerIconButton}>
            <RefreshCw size={18} className={balance.loading ? "animate-spin" : ""} />
          </button>
          <button
            type="button"
            aria-label={hideBalance ? "Show balance" : "Hide balance"}
            onClick={() => setHideBalance((v) => !v)}
            className={headerIconButton}
          >
            {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </>
      }
    />
    <div className="flex flex-col gap-4 px-4 pt-2">

      <section className="relative overflow-hidden rounded-3xl border-2 border-white/15 bg-gradient-to-br from-secondary-container via-secondary to-on-secondary-fixed-variant p-space-md text-white shadow-pop-blue">
        <div className="flex flex-col gap-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-sm text-white/75">USDC balance</span>
              <div className="mt-1 flex items-end gap-2">
                {balance.loading && !balance.data ? (
                  <Skeleton className="h-10 w-32 bg-white/20" />
                ) : (
                  <span className="text-headline-xl-mobile font-extrabold tabular-nums">
                    {hideBalance ? "••••" : usdc(Number(balance.data?.balance ?? 0))}
                  </span>
                )}
                <span className="mb-1.5 rounded-full bg-white/15 px-2 py-0.5 text-label-sm">{balance.data?.symbol ?? "USDC"}</span>
              </div>
              <span className="mt-1 flex items-center gap-1 text-label-sm text-white/75">
                <Fuel size={12} />
                Gas: {hideBalance ? "••" : Number(balance.data?.nativeBalance ?? 0).toFixed(4)} {balance.data?.nativeSymbol ?? ""}
              </span>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Wallet size={22} />
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl bg-black/15 p-3">
            <span className="text-label-sm text-white/70">
              {wallet.isEmbedded ? "Your instant.fun wallet" : address ? "Connected wallet" : "Wallet"}
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate text-body-sm font-semibold">{address ?? "Creating your wallet…"}</code>
              {address && <CopyButton value={address} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15" />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-space-xs">
            <button
              type="button"
              onClick={() => setSheet("receive")}
              disabled={!address}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-3 text-label-md ring-1 ring-white/20 transition active:scale-95 disabled:opacity-50"
            >
              <ArrowDownLeft size={18} />
              Receive
            </button>
            <button
              type="button"
              onClick={() => setSheet("send")}
              disabled={!address || !wallet.wallet}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-white/15 py-3 text-label-md ring-1 ring-white/20 transition active:scale-95 disabled:opacity-50"
            >
              <ArrowUpRight size={18} />
              Send
            </button>
          </div>
        </div>
      </section>

      {balance.error && <ErrorState message={balance.error} onRetry={balance.reload} />}
      {balance.data && !balance.data.configured && (
        <p className="rounded-2xl bg-surface-container px-3 py-2 text-body-sm text-on-surface-variant">
          USDC isn&apos;t configured on the server yet — only gas balance is shown.
        </p>
      )}

      <section className="rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-space-md shadow-soft">
        <div className="mb-space-sm flex items-center justify-between">
          <h2 className="text-label-lg font-extrabold">USDC transfers</h2>
          {address && (
            <a
              href={addressUrl(address)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-label-sm text-secondary"
            >
              Explorer <ExternalLink size={12} />
            </a>
          )}
        </div>

        {transfers.loading && !transfers.data ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                  <Skeleton className="h-3 w-1/3 rounded-full" />
                </div>
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : transfers.error ? (
          <ErrorState message={transfers.error} onRetry={transfers.reload} />
        ) : !transfers.data?.length ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-label-md text-on-surface-variant">No recent transfers</p>
            <p className="max-w-[240px] text-body-sm text-on-surface-variant/80">
              Tips you send or receive show up here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {transfers.data.map((tx) => {
              const positive = tx.amount >= 0;
              return (
                <li key={`${tx.hash}-${tx.logIndex}`}>
                  <a
                    href={txUrl(tx.hash)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 py-1 transition-opacity hover:opacity-80"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        positive ? "bg-tertiary-container/50 text-on-tertiary-container" : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {positive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label-md">{positive ? "Received" : "Sent"}</p>
                      <p className="truncate text-label-sm text-on-surface-variant">
                        {positive ? "from" : "to"} {shortAddress(tx.counterparty)}
                      </p>
                    </div>
                    <span className={`text-label-lg whitespace-nowrap tabular-nums ${positive ? "text-tertiary" : ""}`}>
                      {positive ? "+" : "−"}
                      {usdc(Math.abs(tx.amount))}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {wallet.isEmbedded && (
        <button
          type="button"
          onClick={() => void wallet.exportKey().catch(() => {})}
          className="flex items-center gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-3 text-left shadow-soft"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-container">
            <KeyRound size={18} className="text-secondary" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-label-md">Export private key</span>
            <span className="block text-body-sm text-on-surface-variant">Use this wallet in MetaMask or another app</span>
          </span>
        </button>
      )}

      <div className="flex items-start gap-3 rounded-3xl border-2 border-on-surface/10 bg-surface-container p-3 text-on-surface-variant">
        <Shield size={18} className="mt-0.5 shrink-0 text-secondary" />
        <p className="text-body-sm leading-snug">
          Your wallet is self-custodial and secured by Privy. instant.fun never holds your funds — every send is confirmed
          by you.
        </p>
      </div>

      {sheet === "receive" && address && <ReceiveSheet address={address} onClose={() => setSheet(null)} />}
      {sheet === "send" && (
        <SendSheet
          balance={balance.data}
          onClose={() => setSheet(null)}
          onSent={() => {
            setTimeout(refresh, 4000);
          }}
        />
      )}
    </div>
    </>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center">
      <div className="app-shell flex max-h-[92dvh] w-full flex-col gap-space-sm overflow-y-auto rounded-t-3xl bg-surface p-space-md pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-elevated sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm font-extrabold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container">
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReceiveSheet({ address, onClose }: { address: string; onClose: () => void }) {
  return (
    <Sheet title="Receive" onClose={onClose}>
      <p className="text-body-sm text-on-surface-variant">
        Send only USDC or {NETWORK_NAME} gas tokens on <strong>{NETWORK_NAME}</strong> to this address.
      </p>
      <div className="flex items-center gap-2 rounded-2xl bg-surface-container-low p-3">
        <code className="min-w-0 flex-1 text-body-sm break-all">{address}</code>
        <CopyButton value={address} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-white" />
      </div>
      {FAUCET_URL && (
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface-container text-label-md"
        >
          Get free testnet gas <ExternalLink size={14} />
        </a>
      )}
    </Sheet>
  );
}

function SendSheet({
  balance,
  onClose,
  onSent,
}: {
  balance: WalletBalance | undefined;
  onClose: () => void;
  onSent: () => void;
}) {
  const wallet = useAppWallet();
  const usdcEnabled = Boolean(balance?.configured);
  const [asset, setAsset] = useState<"usdc" | "native">(usdcEnabled ? "usdc" : "native");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  const available = Number(asset === "usdc" ? (balance?.balance ?? 0) : (balance?.nativeBalance ?? 0));
  const value = Number(amount);
  const validTo = isAddress(to.trim());
  const canSend = validTo && value > 0 && value <= available && !sending;

  async function send() {
    if (!canSend || !balance) return;
    setSending(true);
    setError(null);
    try {
      const recipient = to.trim();
      const txHash =
        asset === "usdc"
          ? await wallet.sendToken({
              tokenAddress: balance.tokenAddress,
              to: recipient,
              amountRaw: parseUnits(amount, balance.decimals),
              description: `Send ${amount} USDC`,
            })
          : await wallet.sendNative({
              to: recipient,
              amountWei: parseEther(amount),
              description: `Send ${amount} ${balance.nativeSymbol}`,
            });
      setHash(txHash);
      onSent();
    } catch (e) {
      if (!isUserRejection(e)) setError(walletErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  if (hash) {
    return (
      <Sheet title="Sent" onClose={onClose}>
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary text-white">
            <Check size={26} />
          </div>
          <p className="text-label-lg">Transaction submitted</p>
          <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-label-sm text-secondary">
            View on explorer <ExternalLink size={12} />
          </a>
        </div>
      </Sheet>
    );
  }

  const symbol = asset === "usdc" ? "USDC" : (balance?.nativeSymbol ?? "BNB");

  return (
    <Sheet title="Send" onClose={onClose}>
      <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-container p-1">
        {(["usdc", "native"] as const).map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={asset === a}
            disabled={a === "usdc" && !usdcEnabled}
            onClick={() => setAsset(a)}
            className={`rounded-full py-2 text-label-md transition-all disabled:opacity-40 ${
              asset === a ? "bg-surface-container-lowest shadow-sm" : "text-on-surface-variant"
            }`}
          >
            {a === "usdc" ? "USDC" : (balance?.nativeSymbol ?? "Gas")}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-label-sm text-on-surface-variant">Recipient address</span>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x…"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`h-12 w-full rounded-2xl bg-surface-container-low px-4 font-mono text-body-sm outline-none ring-2 ${
            to && !validTo ? "ring-error/50" : "ring-transparent focus:ring-secondary/40"
          }`}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="flex justify-between text-label-sm text-on-surface-variant">
          Amount
          <button type="button" className="font-bold text-secondary" onClick={() => setAmount(String(available))}>
            Max {available.toLocaleString("en", { maximumFractionDigits: 6 })}
          </button>
        </span>
        <div className="flex h-12 items-center gap-2 rounded-2xl bg-surface-container-low px-4 ring-2 ring-transparent focus-within:ring-secondary/40">
          <input
            inputMode="decimal"
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full min-w-0 bg-transparent text-body-md outline-none"
          />
          <span className="text-label-md text-on-surface-variant">{symbol}</span>
        </div>
      </label>
      {value > available && <p className="text-body-sm text-error">Amount exceeds your balance.</p>}
      {error && (
        <p role="alert" className="rounded-2xl bg-error/10 px-3 py-2 text-body-sm text-error">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={send}
        disabled={!canSend}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-secondary text-label-lg text-white disabled:opacity-50"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
        {sending ? "Confirm in wallet…" : `Send ${symbol}`}
      </button>
    </Sheet>
  );
}
