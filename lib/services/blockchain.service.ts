import { BlockchainServiceInterface, PrepareBackingTransactionParams, TransactionIntent, BlockchainTransaction, BlockchainEvent } from "@/lib/interfaces/blockchain.interface";

class MockBlockchainService implements BlockchainServiceInterface {
  private contractAddress = process.env.CAMPAIGN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  async prepareBackingTransaction(
    params: PrepareBackingTransactionParams
  ): Promise<TransactionIntent> {
    return {
      contractAddress: this.contractAddress,
      chainId: params.chainId,
      method: "back",
      args: [params.campaignId, params.postId],
      value: params.amount,
      token: params.token,
    };
  }

  async getTransaction(hash: string): Promise<BlockchainTransaction | null> {
    return {
      hash,
      blockNumber: 0,
      status: "pending",
      chainId: parseInt(process.env.CHAIN_ID || "97"),
    };
  }

  async listenToEvents(
    callback: (event: BlockchainEvent) => void
  ): Promise<void> {
    // Mock - no-op for development
    console.log("Blockchain event listener started (mock)");
  }
}

const blockchainServiceInstance = new MockBlockchainService();
export const BlockchainService: BlockchainServiceInterface = blockchainServiceInstance;
