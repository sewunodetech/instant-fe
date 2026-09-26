import { Interface, JsonRpcProvider } from "ethers";
import { HttpError } from "@/lib/api-response";
import { CHAIN_ID, INSTANT_FUN_ABI, INSTANT_FUN_ADDRESS, isContractConfigured } from "@/lib/contracts/instant-fun";
import type {
  BlockchainServiceInterface,
  InstantFunEvent,
  InstantFunReceipt,
} from "@/lib/interfaces/blockchain.interface";

const MIN_CONFIRMATIONS = Number(process.env.MIN_CONFIRMATIONS || 1);

class EvmBlockchainService implements BlockchainServiceInterface {
  private iface = new Interface(INSTANT_FUN_ABI);
  private provider: JsonRpcProvider | null = null;
  private networkChecked: Promise<void> | null = null;

  private async getProvider() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    if (!rpcUrl || !isContractConfigured()) {
      throw new HttpError(503, "Blockchain is not configured on this server");
    }
    if (!this.provider) {
      this.provider = new JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true });
    }
    // The RPC URL decides which chain we read; refuse to trust it if it is not the chain the app targets.
    this.networkChecked ??= this.provider.getNetwork().then((net) => {
      if (Number(net.chainId) !== CHAIN_ID) {
        this.networkChecked = null;
        throw new HttpError(503, `RPC is on chain ${net.chainId}, expected ${CHAIN_ID}`);
      }
    });
    await this.networkChecked;
    return this.provider;
  }

  async getInstantFunReceipt(hash: string): Promise<InstantFunReceipt> {
    const provider = await this.getProvider();
    const receipt = await provider.getTransactionReceipt(hash);
    if (!receipt) return { status: "pending", hash };
    // A mined receipt already has one confirmation; only ask for the head block when more are required.
    if (MIN_CONFIRMATIONS > 1 && (await receipt.confirmations()) < MIN_CONFIRMATIONS) return { status: "pending", hash };

    const from = receipt.from.toLowerCase();
    if (receipt.status !== 1) {
      return { status: "failed", hash, blockNumber: receipt.blockNumber, from };
    }

    const events: InstantFunEvent[] = [];
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== INSTANT_FUN_ADDRESS) continue;
      const parsed = this.iface.parseLog({ topics: [...log.topics], data: log.data });
      if (!parsed) continue;
      const a = parsed.args;
      const logIndex = log.index;
      switch (parsed.name) {
        case "SupportSent":
          events.push({
            name: "SupportSent",
            logIndex,
            supporter: String(a.supporter).toLowerCase(),
            creator: String(a.creator).toLowerCase(),
            postId: String(a.postId),
            amount: a.amount as bigint,
          });
          break;
        case "EscrowFunded":
          events.push({
            name: "EscrowFunded",
            logIndex,
            campaignId: String(a.campaignId),
            brand: String(a.brand).toLowerCase(),
            amount: a.amount as bigint,
            endsAt: a.endsAt as bigint,
          });
          break;
        case "EscrowPaid":
          events.push({
            name: "EscrowPaid",
            logIndex,
            campaignId: String(a.campaignId),
            brand: String(a.brand).toLowerCase(),
            creator: String(a.creator).toLowerCase(),
            postId: String(a.postId),
            amount: a.amount as bigint,
          });
          break;
        case "EscrowRefunded":
          events.push({
            name: "EscrowRefunded",
            logIndex,
            campaignId: String(a.campaignId),
            brand: String(a.brand).toLowerCase(),
            amount: a.amount as bigint,
          });
          break;
      }
    }

    return { status: "confirmed", hash, blockNumber: receipt.blockNumber, from, events };
  }
}

export const BlockchainService: BlockchainServiceInterface = new EvmBlockchainService();
