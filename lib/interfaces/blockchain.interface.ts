/** A contract call the client should send from the user's wallet. Amounts are in token units (decimal string). */
export interface TransactionIntent {
  chainId: number;
  /** The wallet that must sign — the one linked to the user's account, or the indexer will not attribute it. */
  from: string;
  contractAddress: string;
  tokenAddress: string;
  method: "support" | "fundEscrow" | "payout" | "payoutMany" | "refund";
  args: (string | string[])[];
  /** Tokens the contract will pull from the wallet; the client must approve at least this much first. */
  approveAmount: string | null;
}

export type InstantFunEvent =
  | { name: "SupportSent"; logIndex: number; supporter: string; creator: string; postId: string; amount: bigint }
  | { name: "EscrowFunded"; logIndex: number; campaignId: string; brand: string; amount: bigint; endsAt: bigint }
  | {
      name: "EscrowPaid";
      logIndex: number;
      campaignId: string;
      brand: string;
      creator: string;
      postId: string;
      amount: bigint;
    }
  | { name: "EscrowRefunded"; logIndex: number; campaignId: string; brand: string; amount: bigint };

export type InstantFunReceipt =
  | { status: "pending"; hash: string }
  | { status: "failed"; hash: string; blockNumber: number; from: string }
  | {
      status: "confirmed";
      hash: string;
      blockNumber: number;
      from: string;
      events: InstantFunEvent[];
    };

export interface BlockchainServiceInterface {
  /** Reads the receipt from the configured chain and decodes only logs emitted by the InstantFun contract. */
  getInstantFunReceipt(hash: string): Promise<InstantFunReceipt>;
}
