import { formatUnits, parseUnits, zeroPadValue } from "ethers";

/**
 * Shared (client + server) config and helpers for the InstantFun contract in `contracts/src/InstantFun.sol`.
 * Everything here is public — the addresses are baked into the client bundle via NEXT_PUBLIC_*.
 */

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 97);
export const INSTANT_FUN_ADDRESS = (process.env.NEXT_PUBLIC_INSTANT_FUN_ADDRESS || "").toLowerCase();
export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || "").toLowerCase();
/** Binance-Peg USDC (and the TestUSDC faucet) use 18 decimals on BNB Chain. */
export const USDC_DECIMALS = Number(process.env.NEXT_PUBLIC_USDC_DECIMALS || 18);
export const TOKEN_SYMBOL = "USDC";
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.bscscan.com";

export const INSTANT_FUN_ABI = [
  "function token() view returns (address)",
  "function support(address creator, bytes32 postId, uint256 amount)",
  "function fundEscrow(bytes32 campaignId, uint256 amount, uint64 endsAt)",
  "function payout(bytes32 campaignId, address creator, bytes32 postId, uint256 amount)",
  "function payoutMany(bytes32 campaignId, address[] creators, bytes32[] postIds, uint256[] amounts)",
  "function refund(bytes32 campaignId)",
  "function getEscrow(address brand, bytes32 campaignId) view returns ((uint64 endsAt, bool closed, uint256 funded, uint256 paidOut, uint256 balance))",
  "event SupportSent(address indexed supporter, address indexed creator, bytes32 indexed postId, uint256 amount)",
  "event EscrowFunded(bytes32 indexed campaignId, address indexed brand, uint256 amount, uint64 endsAt)",
  "event EscrowPaid(bytes32 indexed campaignId, address brand, address indexed creator, bytes32 indexed postId, uint256 amount)",
  "event EscrowRefunded(bytes32 indexed campaignId, address indexed brand, uint256 amount)",
  "error CampaignNotEnded()",
  "error EscrowClosed()",
  "error EscrowNotFound()",
  "error InsufficientEscrow()",
  "error InvalidEndTime()",
  "error LengthMismatch()",
  "error Reentrancy()",
  "error SelfSupport()",
  "error TransferFailed()",
  "error ZeroAddress()",
  "error ZeroAmount()",
] as const;

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
] as const;

export function isContractConfigured() {
  return /^0x[0-9a-f]{40}$/.test(INSTANT_FUN_ADDRESS) && /^0x[0-9a-f]{40}$/.test(USDC_ADDRESS);
}

// ─── Ids ──────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** App UUID → bytes32 (the 16 UUID bytes, left-padded). Reversible with `bytes32ToUuid`. */
export function uuidToBytes32(uuid: string): string {
  if (!UUID_RE.test(uuid)) throw new Error(`Not a UUID: ${uuid}`);
  return zeroPadValue(`0x${uuid.replace(/-/g, "").toLowerCase()}`, 32);
}

/** bytes32 → app UUID, or null if the value was not produced by `uuidToBytes32`. */
export function bytes32ToUuid(value: string): string | null {
  const hex = value.toLowerCase().replace(/^0x/, "");
  if (hex.length !== 64 || !/^0{32}/.test(hex)) return null;
  const u = hex.slice(32);
  return `${u.slice(0, 8)}-${u.slice(8, 12)}-${u.slice(12, 16)}-${u.slice(16, 20)}-${u.slice(20)}`;
}

// ─── Amounts ──────────────────────────────────────────────────────────

/** Human USDC amount (e.g. 5 or "12.5") → on-chain units. */
export function toTokenUnits(amount: number | string): bigint {
  return parseUnits(typeof amount === "number" ? amount.toString() : amount, USDC_DECIMALS);
}

/** On-chain units → human USDC string, e.g. "12.5". */
export function fromTokenUnits(units: bigint): string {
  return formatUnits(units, USDC_DECIMALS);
}

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}
