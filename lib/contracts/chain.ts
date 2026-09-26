import type { PrivyClientConfig } from "@privy-io/react-auth";
import { CHAIN_ID, EXPLORER_URL } from "./instant-fun";

type PrivyChain = NonNullable<PrivyClientConfig["defaultChain"]>;

const BSC_TESTNET_RPC = "https://data-seed-prebsc-1-s1.bnbchain.org:8545";

/** The chain the InstantFun contract lives on, in the viem shape Privy expects. BNB testnet by default. */
export const appChain: PrivyChain = {
  id: CHAIN_ID,
  name: CHAIN_ID === 56 ? "BNB Smart Chain" : "BNB Smart Chain Testnet",
  nativeCurrency: { name: "BNB", symbol: CHAIN_ID === 56 ? "BNB" : "tBNB", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || BSC_TESTNET_RPC] },
  },
  blockExplorers: {
    default: { name: "BscScan", url: EXPLORER_URL },
  },
  testnet: CHAIN_ID !== 56,
};
