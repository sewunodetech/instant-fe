import { ethers } from "ethers";
import { COIN, IS_NATIVE } from "@/lib/currency";

/**
 * Read-only on-chain access. Reads USDC (ERC-20) + native balances, recent
 * Transfer history, and verifies transfers users sign in their own wallet.
 * The server never signs or sends anything.
 */

const CHAIN_ID = Number(process.env.CHAIN_ID || "97");

/**
 * Public RPCs go down or rate-limit often (the old binance.org seed times out),
 * so reads fail over across several endpoints. BLOCKCHAIN_RPC_URL, if set, is tried first.
 */
const RPC_URLS = [
  process.env.BLOCKCHAIN_RPC_URL,
  ...(CHAIN_ID === 56
    ? ["https://bsc-dataseed.bnbchain.org", "https://bsc-rpc.publicnode.com"]
    : ["https://data-seed-prebsc-1-s1.bnbchain.org:8545", "https://bsc-testnet-rpc.publicnode.com"]),
].filter((u, i, all): u is string => Boolean(u) && all.indexOf(u) === i);
const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS || "";

/** Minimal ERC-20 read ABI + Transfer event. */
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
] as const;

/** How many recent blocks to scan for Transfer history (bounded for RPC limits). */
const TRANSFER_LOOKBACK_BLOCKS = 5_000;

export type UsdcBalance = {
  address: string;
  symbol: string;
  decimals: number;
  /** Human-readable balance, e.g. "42.5". */
  balance: string;
  /** Raw integer balance as a string (wei-like). */
  balanceRaw: string;
  nativeBalance: string;
  nativeSymbol: string;
  chainId: number;
  tokenAddress: string;
  configured: boolean;
  /** False when every RPC failed — balances are placeholders, not real zeros. */
  onchainAvailable: boolean;
};

export type TransferCheck =
  | { status: "pending" }
  | { status: "failed"; reason: string }
  | { status: "confirmed"; blockNumber: number };

const NATIVE_SYMBOL = CHAIN_ID === 56 ? "BNB" : "tBNB";
let decimalsCache: number | null = null;

export type UsdcTransfer = {
  hash: string;
  direction: "in" | "out";
  /** Signed human-readable amount (negative for outgoing). */
  amount: number;
  counterparty: string;
  blockNumber: number;
  logIndex: number;
};

const network = ethers.Network.from(CHAIN_ID);
// staticNetwork avoids an extra eth_chainId round-trip per call.
const providers = RPC_URLS.map(
  (url) => new ethers.JsonRpcProvider(url, network, { staticNetwork: network, batchMaxCount: 1 })
);
const HEALTH_TIMEOUT_MS = 2_500;
const HEALTH_TTL_MS = 60_000;
let healthy: { provider: ethers.JsonRpcProvider; checkedAt: number } | null = null;

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("RPC timeout")), ms)),
  ]);
}

/**
 * First RPC (in priority order) that answers quickly. The pick is cached for a
 * minute so normal requests don't pay for health checks; a failed call
 * elsewhere clears it via `markUnhealthy`.
 */
async function getProvider(): Promise<ethers.JsonRpcProvider> {
  if (healthy && Date.now() - healthy.checkedAt < HEALTH_TTL_MS) return healthy.provider;
  for (const provider of providers) {
    try {
      await withTimeout(provider.getBlockNumber(), HEALTH_TIMEOUT_MS);
      healthy = { provider, checkedAt: Date.now() };
      return provider;
    } catch {
      // try the next endpoint
    }
  }
  healthy = null;
  throw new Error("No BNB Chain RPC endpoint is reachable");
}

function markUnhealthy() {
  healthy = null;
}
function isValidAddress(address: string | null | undefined): address is string {
  return Boolean(address) && ethers.isAddress(address as string);
}

function emptyBalance(address: string): UsdcBalance {
  return {
    address,
    symbol: IS_NATIVE ? COIN : "USDC",
    decimals: 18,
    balance: "0",
    balanceRaw: "0",
    nativeBalance: "0",
    nativeSymbol: NATIVE_SYMBOL,
    chainId: CHAIN_ID,
    tokenAddress: IS_NATIVE ? "" : USDC_ADDRESS,
    configured: IS_NATIVE || isValidAddress(USDC_ADDRESS),
    onchainAvailable: true,
  };
}

export class ChainService {
  static get chainId() {
    return CHAIN_ID;
  }

  static get tokenAddress() {
    return USDC_ADDRESS;
  }

  static get isConfigured() {
    return isValidAddress(USDC_ADDRESS);
  }

  static get nativeSymbol() {
    return NATIVE_SYMBOL;
  }

  /** Placeholder returned when the chain couldn't be read at all. */
  static unavailableBalance(address: string | null | undefined) {
    return { ...emptyBalance(address || ""), onchainAvailable: false };
  }

  static async getTokenDecimals() {
    if (decimalsCache !== null) return decimalsCache;
    if (!isValidAddress(USDC_ADDRESS)) return 18;
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, await getProvider());
    decimalsCache = await token.decimals().then((d: bigint) => Number(d));
    return decimalsCache!;
  }

  /**
   * Reads the wallet's balances. With BNB as the reward coin (default) only the
   * native balance is read and reported as the main balance; in USDC mode the
   * token balance is primary and native is shown as gas.
   */
  static async getBalances(address: string | null | undefined): Promise<UsdcBalance> {
    if (!isValidAddress(address)) return emptyBalance(address || "");

    let provider = await getProvider();
    const nativeRaw = await withTimeout(provider.getBalance(address), 6_000).catch(async () => {
      // The cached endpoint just died — pick the next healthy one and retry once.
      markUnhealthy();
      provider = await getProvider();
      return provider.getBalance(address);
    });
    const native = ethers.formatEther(nativeRaw);
    const base = { ...emptyBalance(address), nativeBalance: native };
    if (IS_NATIVE) return { ...base, balance: native, balanceRaw: nativeRaw.toString() };
    if (!isValidAddress(USDC_ADDRESS)) return base;

    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
    const [rawBalance, decimals, symbol] = await Promise.all([
      token.balanceOf(address) as Promise<bigint>,
      this.getTokenDecimals().catch(() => 18),
      token.symbol().then((s: string) => s).catch(() => "USDC"),
    ]);

    return {
      ...base,
      symbol,
      decimals,
      balance: ethers.formatUnits(rawBalance, decimals),
      balanceRaw: rawBalance.toString(),
      configured: true,
    };
  }

  /**
   * Checks that `hash` is a successful native-coin (BNB) transfer of at least
   * `minWei` sent directly from `from` to `to`.
   */
  static async verifyNativeTransfer(params: {
    hash: string;
    from: string;
    to: string;
    minWei: bigint;
    waitMs?: number;
  }): Promise<TransferCheck> {
    const provider = await getProvider();
    let receipt: ethers.TransactionReceipt | null = null;
    try {
      receipt = await provider.waitForTransaction(params.hash, 1, params.waitMs ?? 20_000);
    } catch {
      receipt = await provider.getTransactionReceipt(params.hash).catch(() => null);
    }
    if (!receipt) return { status: "pending" };
    if (receipt.status !== 1) return { status: "failed", reason: "Transaction reverted" };

    const tx = await provider.getTransaction(params.hash);
    if (!tx) return { status: "pending" };
    const ok =
      tx.from.toLowerCase() === params.from.toLowerCase() &&
      (tx.to ?? "").toLowerCase() === params.to.toLowerCase() &&
      tx.value >= params.minWei;

    return ok
      ? { status: "confirmed", blockNumber: receipt.blockNumber }
      : { status: "failed", reason: "Transaction is not the expected transfer" };
  }

  /**
   * Checks that `hash` is a successful USDC transfer of at least `minAmountRaw`
   * from `from` to `to`. Waits briefly for the receipt so the common case
   * resolves in one request; callers retry while it reports "pending".
   */
  static async verifyUsdcTransfer(params: {
    hash: string;
    from: string;
    to: string;
    minAmountRaw: bigint;
    waitMs?: number;
  }): Promise<TransferCheck> {
    if (!isValidAddress(USDC_ADDRESS)) return { status: "failed", reason: "USDC is not configured" };
    const provider = await getProvider();

    let receipt: ethers.TransactionReceipt | null = null;
    try {
      receipt = await provider.waitForTransaction(params.hash, 1, params.waitMs ?? 20_000);
    } catch {
      receipt = await provider.getTransactionReceipt(params.hash).catch(() => null);
    }
    if (!receipt) return { status: "pending" };
    if (receipt.status !== 1) return { status: "failed", reason: "Transaction reverted" };

    const iface = new ethers.Interface(ERC20_ABI);
    const token = USDC_ADDRESS.toLowerCase();
    const from = params.from.toLowerCase();
    const to = params.to.toLowerCase();

    const matched = receipt.logs.some((log) => {
      if (log.address.toLowerCase() !== token) return false;
      try {
        const parsed = iface.parseLog(log);
        if (!parsed || parsed.name !== "Transfer") return false;
        return (
          String(parsed.args[0]).toLowerCase() === from &&
          String(parsed.args[1]).toLowerCase() === to &&
          (parsed.args[2] as bigint) >= params.minAmountRaw
        );
      } catch {
        return false;
      }
    });

    return matched
      ? { status: "confirmed", blockNumber: receipt.blockNumber }
      : { status: "failed", reason: "Transaction is not the expected USDC transfer" };
  }

  /**
   * Reads recent USDC Transfer events involving `address` (both incoming and
   * outgoing), newest first. Bounded to the last TRANSFER_LOOKBACK_BLOCKS blocks.
   */
  static async getUsdcTransfers(
    address: string | null | undefined,
    limit = 20,
  ): Promise<UsdcTransfer[]> {
    if (!isValidAddress(address) || !isValidAddress(USDC_ADDRESS)) {
      return [];
    }

    const provider = await getProvider();
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

    const decimals = await token
      .decimals()
      .then((d: bigint) => Number(d))
      .catch(() => 18);

    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latest - TRANSFER_LOOKBACK_BLOCKS);

    // Two filters: transfers FROM the user (out) and TO the user (in).
    const outFilter = token.filters.Transfer(address, null);
    const inFilter = token.filters.Transfer(null, address);

    const [outLogs, inLogs] = await Promise.all([
      token.queryFilter(outFilter, fromBlock, latest),
      token.queryFilter(inFilter, fromBlock, latest),
    ]);

    const lower = address.toLowerCase();

    const transfers: UsdcTransfer[] = [...outLogs, ...inLogs]
      .filter((log): log is ethers.EventLog => "args" in log && Boolean((log as ethers.EventLog).args))
      .map((log) => {
        const from = String(log.args[0]).toLowerCase();
        const value = log.args[2] as bigint;
        const direction: "in" | "out" = from === lower ? "out" : "in";
        const magnitude = Number(ethers.formatUnits(value, decimals));
        return {
          hash: log.transactionHash,
          direction,
          amount: direction === "out" ? -magnitude : magnitude,
          counterparty: direction === "out" ? String(log.args[1]) : String(log.args[0]),
          blockNumber: log.blockNumber,
          logIndex: log.index,
        };
      })
      // De-dupe (a self-transfer could match both filters) and sort newest first.
      .filter(
        (t, i, arr) =>
          arr.findIndex((o) => o.hash === t.hash && o.logIndex === t.logIndex) === i,
      )
      .sort((a, b) =>
        b.blockNumber === a.blockNumber ? b.logIndex - a.logIndex : b.blockNumber - a.blockNumber,
      );

    return transfers.slice(0, limit);
  }
}
