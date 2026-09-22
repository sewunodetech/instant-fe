import { BlockchainServiceInterface, PrepareDonationParams, TransactionIntent, BlockchainTransaction } from "@/lib/interfaces/blockchain.interface";

class MockBlockchainService implements BlockchainServiceInterface {
  private contractAddress = process.env.CAMPAIGN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  async prepareDonationTransaction(
    params: PrepareDonationParams
  ): Promise<TransactionIntent> {
    return {
      contractAddress: this.contractAddress,
      chainId: params.chainId,
      method: "donate",
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
}

export const BlockchainService: BlockchainServiceInterface = new MockBlockchainService();
