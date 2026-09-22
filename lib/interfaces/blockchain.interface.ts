export interface PrepareDonationParams {
  campaignId: string;
  postId: string;
  userId: string;
  amount: string;
  token: string;
  chainId: number;
}

export interface TransactionIntent {
  contractAddress: string;
  chainId: number;
  method: string;
  args: string[];
  value: string;
  token: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  status: "pending" | "confirmed" | "failed";
  chainId: number;
}

export interface BlockchainEvent {
  eventName: string;
  transactionHash: string;
  blockNumber: number;
  args: Record<string, unknown>;
}

export interface BlockchainServiceInterface {
  prepareDonationTransaction(params: PrepareDonationParams): Promise<TransactionIntent>;
  getTransaction(hash: string): Promise<BlockchainTransaction | null>;
}
