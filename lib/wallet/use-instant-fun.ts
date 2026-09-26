"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { BrowserProvider, Contract, Interface, JsonRpcProvider, isError } from "ethers";
import { ApiClientError, syncTransaction } from "@/lib/api-client";
import {
  CHAIN_ID,
  ERC20_ABI,
  INSTANT_FUN_ABI,
  USDC_ADDRESS,
  fromTokenUnits,
  isContractConfigured,
} from "@/lib/contracts/instant-fun";
import { appChain } from "@/lib/contracts/chain";
import type { SyncResult, TransactionIntent } from "@/lib/types";

/** Where a wallet transaction is, for button labels. */
export type TxStep = "idle" | "preparing" | "approving" | "signing" | "confirming" | "done" | "error";

export const TX_STEP_LABEL: Record<TxStep, string> = {
  idle: "",
  preparing: "Preparing...",
  approving: "Approve USDC in your wallet...",
  signing: "Confirm in your wallet...",
  confirming: "Confirming on BNB Chain...",
  done: "Done",
  error: "Failed",
};

const instantFun = new Interface(INSTANT_FUN_ABI);

const CONTRACT_ERRORS: Record<string, string> = {
  SelfSupport: "You cannot support yourself.",
  InsufficientEscrow: "Not enough budget left in escrow.",
  CampaignNotEnded: "The campaign has not ended yet.",
  EscrowClosed: "This escrow is already closed.",
  EscrowNotFound: "No escrow found for this wallet and campaign.",
  InvalidEndTime: "Campaign end date must be in the future.",
  TransferFailed: "USDC transfer failed — check your balance and allowance.",
};

/** Turn wallet / RPC / contract errors into one short sentence for the UI. */
export function describeTxError(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  if (isError(err, "ACTION_REJECTED")) return "Transaction cancelled in wallet.";
  if (isError(err, "INSUFFICIENT_FUNDS")) return "Not enough BNB for gas.";
  if (isError(err, "CALL_EXCEPTION") && err.data) {
    try {
      const parsed = instantFun.parseError(err.data);
      if (parsed) return CONTRACT_ERRORS[parsed.name] ?? `Contract rejected the transaction (${parsed.name}).`;
    } catch {
      // not one of ours
    }
  }
  if (err instanceof Error) return err.message.split("(")[0].trim() || "Transaction failed.";
  return "Transaction failed.";
}

/** Read-only provider for balances, independent of whichever chain the user's wallet is on. */
let readProvider: JsonRpcProvider | null = null;
function getReadProvider() {
  readProvider ??= new JsonRpcProvider(appChain.rpcUrls.default.http[0], CHAIN_ID, { staticNetwork: true });
  return readProvider;
}

async function pollSync(txHash: string, donationId?: string): Promise<SyncResult> {
  const deadline = Date.now() + 120_000;
  for (;;) {
    const result = await syncTransaction(txHash, donationId);
    if (result.status !== "PENDING") return result;
    if (Date.now() > deadline) throw new Error("Still waiting for the chain — check your activity in a minute.");
    await new Promise((r) => setTimeout(r, 2500));
  }
}

/**
 * Sends InstantFun contract calls from the user's Privy wallet (embedded or external):
 * switch chain → approve USDC if needed → call the contract → wait until the server has indexed it.
 */
export function useInstantFun() {
  const { wallets, ready } = useWallets();

  const run = useCallback(
    async (
      intent: TransactionIntent,
      opts: { onStep?: (step: TxStep) => void; donationId?: string } = {}
    ): Promise<SyncResult & { status: "CONFIRMED" }> => {
      const { onStep } = opts;
      if (!isContractConfigured()) throw new Error("Payments are not configured yet.");

      const wallet = wallets.find((w) => w.address.toLowerCase() === intent.from.toLowerCase());
      if (!wallet) {
        throw new Error(
          `Open the wallet linked to your account (${intent.from.slice(0, 6)}…${intent.from.slice(-4)}) and try again.`
        );
      }

      await wallet.switchChain(intent.chainId);
      const provider = new BrowserProvider(await wallet.getEthereumProvider(), intent.chainId);
      const signer = await provider.getSigner(wallet.address);

      if (intent.approveAmount) {
        const need = BigInt(intent.approveAmount);
        const token = new Contract(intent.tokenAddress, ERC20_ABI, signer);
        const balance: bigint = await token.balanceOf(wallet.address);
        if (balance < need) {
          throw new Error(`Not enough USDC — you have ${fromTokenUnits(balance)}, need ${fromTokenUnits(need)}.`);
        }
        const allowance: bigint = await token.allowance(wallet.address, intent.contractAddress);
        if (allowance < need) {
          onStep?.("approving");
          const approval = await token.approve(intent.contractAddress, need);
          await approval.wait();
        }
      }

      onStep?.("signing");
      const contract = new Contract(intent.contractAddress, INSTANT_FUN_ABI, signer);
      const tx = await contract.getFunction(intent.method)(...intent.args);

      onStep?.("confirming");
      await tx.wait();
      const result = await pollSync(tx.hash, opts.donationId);
      if (result.status !== "CONFIRMED") throw new Error("Transaction failed on-chain.");
      onStep?.("done");
      return result;
    },
    [wallets]
  );

  return { run, ready };
}

/** On-chain USDC balance of an address; null while loading or when payments are not configured. */
export function useUsdcBalance(address: string | null | undefined) {
  const [balance, setBalance] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!address || !isContractConfigured() || !/^0x[0-9a-fA-F]{40}$/.test(address)) return;
    let cancelled = false;
    new Contract(USDC_ADDRESS, ERC20_ABI, getReadProvider())
      .balanceOf(address)
      .then((units: bigint) => {
        if (!cancelled) setBalance(Number(fromTokenUnits(units)));
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [address, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  return { balance, refresh };
}
