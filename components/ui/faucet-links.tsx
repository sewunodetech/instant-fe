import { Droplets, ExternalLink, Send } from "lucide-react";
import { FAUCET_TELEGRAM_URL, FAUCET_URL } from "@/lib/chain";
import { COIN } from "@/lib/currency";

/** Where to claim free testnet coin: the BNB Chain web faucet or the Telegram bot. Hidden on mainnet. */
export function FaucetLinks({ title }: { title?: string }) {
  if (!FAUCET_URL && !FAUCET_TELEGRAM_URL) return null;
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-secondary-fixed/60 p-3">
      <p className="flex items-center gap-1.5 text-label-md text-on-secondary-fixed">
        <Droplets size={16} className="text-secondary" />
        {title ?? `Get free ${COIN}`}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {FAUCET_URL && (
          <a
            href={FAUCET_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest text-label-sm font-bold text-secondary shadow-sm transition-transform active:scale-95"
          >
            BNB Faucet <ExternalLink size={14} />
          </a>
        )}
        {FAUCET_TELEGRAM_URL && (
          <a
            href={FAUCET_TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-surface-container-lowest text-label-sm font-bold text-secondary shadow-sm transition-transform active:scale-95"
          >
            <Send size={14} /> Telegram bot
          </a>
        )}
      </div>
      <p className="text-[11px] text-on-secondary-fixed/80">
        Paste your wallet address there to claim. It can take a minute to arrive.
      </p>
    </div>
  );
}
