import { NATIVE_SYMBOL } from "@/lib/chain";

/**
 * The coin used for prizes and tips. Defaults to the chain's native coin
 * (tBNB on testnet, BNB on mainnet); set NEXT_PUBLIC_REWARD_CURRENCY=usdc to
 * switch everything to the USDC token instead. Shared by client and server.
 */
export type RewardCurrency = "native" | "usdc";

export const REWARD_CURRENCY: RewardCurrency =
  process.env.NEXT_PUBLIC_REWARD_CURRENCY?.toLowerCase() === "usdc" ? "usdc" : "native";

export const IS_NATIVE = REWARD_CURRENCY === "native";

/** "tBNB", "BNB" or "USDC". */
export const COIN = IS_NATIVE ? NATIVE_SYMBOL : "USDC";

/** Quick-pick support amounts, sized for the coin's value. */
export const SUPPORT_TIERS = IS_NATIVE ? [0.001, 0.005, 0.01, 0.05] : [1, 5, 10, 25];
export const MIN_SUPPORT = IS_NATIVE ? 0.0001 : 0.1;
export const MAX_SUPPORT = IS_NATIVE ? 100 : 10_000;
export const MAX_PRIZE_POOL = IS_NATIVE ? 1_000 : 100_000;
/** Step for amount inputs. */
export const AMOUNT_STEP = IS_NATIVE ? "0.001" : "0.1";

const MAX_DECIMALS = IS_NATIVE ? 4 : 2;

/** 0.05 -> "0.05", 12 -> "12", 0.123456 -> "0.1235" (native) */
export function amount(n: number) {
  return n.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: MAX_DECIMALS });
}

/** Rounds to what we can display/store for this coin. */
export function roundAmount(n: number) {
  const f = 10 ** MAX_DECIMALS;
  return Math.round(n * f) / f;
}

/** "0.05 tBNB" */
export function coin(n: number) {
  return `${amount(n)} ${COIN}`;
}
