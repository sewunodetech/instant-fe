import { ethers } from "ethers";

/**
 * Read-only on-chain access. Reads USDC (ERC-20) + native balances, recent
 * Transfer history, and verifies transfers users sign in their own wallet.
 * The server never signs or sends anything.
 */

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545";
const CHAIN_ID = Number(process.env.CHAIN_ID || "97");
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

let providerSingleton: ethers.JsonRpcProvider | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!providerSingleton) {
    // staticNetwork avoids an extra eth_chainId round-trip per call.
    providerSingleton = new ethers.JsonRpcProvider(RPC_URL, CHAIN_ID, {
      staticNetwork: ethers.Network.from(CHAIN_ID),
    });
  }
  return providerSingleton;
}

function isValidAddress(address: string | null | undefined): address is string {
  return Boolean(address) && ethers.isAddress(address as string);
}

function emptyBalance(address: string): UsdcBalance {
  return {
    address,
    symbol: "USDC",
    decimals: 18,
    balance: "0",
    balanceRaw: "0",
    nativeBalance: "0",
    nativeSymbol: NATIVE_SYMBOL,
    chainId: CHAIN_ID,
    tokenAddress: USDC_ADDRESS,
    configured: isValidAddress(USDC_ADDRESS),
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

  static emptyBalance(address: string | null | undefined) {
    return emptyBalance(address || "");
  }

  static async getTokenDecimals() {
    if (decimalsCache !== null) return decimalsCache;
    if (!isValidAddress(USDC_ADDRESS)) return 18;
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, getProvider());
    decimalsCache = await token.decimals().then((d: bigint) => Number(d));
    return decimalsCache!;
  }

  /** Reads USDC + native balances. Returns zeros for empty/invalid addresses. */
  static async getUsdcBalance(address: string | null | undefined): Promise<UsdcBalance> {
    if (!isValidAddress(address)) return emptyBalance(address || "");

    const provider = getProvider();
    const nativeRaw = await provider.getBalance(address);
    const base = { ...emptyBalance(address), nativeBalance: ethers.formatEther(nativeRaw) };
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
    const provider = getProvider();

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

    const provider = getProvider();
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
