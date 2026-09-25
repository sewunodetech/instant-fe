/**
 * Client-side chain config for the Privy embedded wallet.
 * Server-side reads use BLOCKCHAIN_RPC_URL / CHAIN_ID in chain.service.ts.
 */

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const IS_MAINNET = CHAIN_ID === 56;

export const EXPLORER_URL = IS_MAINNET ? "https://bscscan.com" : "https://testnet.bscscan.com";
export const NETWORK_NAME = IS_MAINNET ? "BNB Chain" : "BSC Testnet";
export const NATIVE_SYMBOL = IS_MAINNET ? "BNB" : "tBNB";
export const FAUCET_URL = IS_MAINNET ? null : "https://www.bnbchain.org/en/testnet-faucet";

export const appChain = {
  id: CHAIN_ID,
  name: IS_MAINNET ? "BNB Smart Chain" : "BNB Smart Chain Testnet",
  network: IS_MAINNET ? "bsc" : "bsc-testnet",
  nativeCurrency: { name: NATIVE_SYMBOL, symbol: NATIVE_SYMBOL, decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL ||
          (IS_MAINNET ? "https://bsc-dataseed.bnbchain.org" : "https://data-seed-prebsc-1-s1.bnbchain.org:8545"),
      ],
    },
  },
  blockExplorers: { default: { name: "BscScan", url: EXPLORER_URL } },
  testnet: !IS_MAINNET,
};

export const txUrl = (hash: string) => `${EXPLORER_URL}/tx/${hash}`;
export const addressUrl = (address: string) => `${EXPLORER_URL}/address/${address}`;
