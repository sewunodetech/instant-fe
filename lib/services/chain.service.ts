import { ethers } from "ethers";

/**
 * Read-only on-chain access for the wallet page. Reads a user's USDC (ERC-20)
 * balance and recent Transfer history from BSC testnet. No signing, no writes.
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
  chainId: number;
  tokenAddress: string;
  configured: boolean;
};

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
    chainId: CHAIN_ID,
    tokenAddress: USDC_ADDRESS,
    configured: Boolean(USDC_ADDRESS),
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

  /** Reads the USDC balance for an address. Returns a zero balance for empty/invalid addresses. */
  static async getUsdcBalance(address: string | null | undefined): Promise<UsdcBalance> {
    if (!isValidAddress(address) || !isValidAddress(USDC_ADDRESS)) {
      return emptyBalance(address || "");
    }

    const provider = getProvider();
    const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

    const [rawBalance, decimals, symbol] = await Promise.all([
      token.balanceOf(address) as Promise<bigint>,
      token.decimals().then((d: bigint) => Number(d)).catch(() => 18),
      token.symbol().then((s: string) => s).catch(() => "USDC"),
    ]);

    return {
      address,
      symbol,
      decimals,
      balance: ethers.formatUnits(rawBalance, decimals),
      balanceRaw: rawBalance.toString(),
      chainId: CHAIN_ID,
      tokenAddress: USDC_ADDRESS,
      configured: true,
    };
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
