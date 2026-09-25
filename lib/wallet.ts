"use client";

import { useCallback, useMemo } from "react";
import { Interface } from "ethers";
import { useExportWallet, useSendTransaction, useWallets } from "@privy-io/react-auth";
import { useAuth } from "@/components/providers/auth-provider";
import { CHAIN_ID } from "@/lib/chain";

const erc20 = new Interface(["function transfer(address to, uint256 amount) returns (bool)"]);

type TxRequest = { to: string; data?: string; value?: bigint; description: string };

/**
 * The user's app wallet (the address linked to their account — normally the
 * Privy embedded wallet). Sends go through Privy's confirmation modal for the
 * embedded wallet, or the connected wallet's own prompt for external wallets.
 */
export function useAppWallet() {
  const { user } = useAuth();
  const { wallets, ready } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const { exportWallet } = useExportWallet();

  const wallet = useMemo(() => {
    const linked = user?.walletAddress?.toLowerCase();
    return (
      wallets.find((w) => w.address.toLowerCase() === linked) ??
      wallets.find((w) => w.walletClientType === "privy") ??
      null
    );
  }, [wallets, user?.walletAddress]);

  const isEmbedded = wallet?.walletClientType === "privy";

  const send = useCallback(
    async ({ to, data, value, description }: TxRequest): Promise<string> => {
      if (!wallet) throw new Error("Your wallet isn't ready yet. Try again in a moment.");
      const hexValue = value ? `0x${value.toString(16)}` : undefined;

      if (isEmbedded) {
        const { hash } = await sendTransaction(
          { to, data, value: hexValue, chainId: CHAIN_ID },
          { address: wallet.address, uiOptions: { description, buttonText: "Confirm" } }
        );
        return hash;
      }

      await wallet.switchChain(CHAIN_ID);
      const provider = await wallet.getEthereumProvider();
      return (await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet.address, to, data, value: hexValue }],
      })) as string;
    },
    [wallet, isEmbedded, sendTransaction]
  );

  const sendToken = useCallback(
    (params: { tokenAddress: string; to: string; amountRaw: bigint; description: string }) =>
      send({
        to: params.tokenAddress,
        data: erc20.encodeFunctionData("transfer", [params.to, params.amountRaw]),
        description: params.description,
      }),
    [send]
  );

  const sendNative = useCallback(
    (params: { to: string; amountWei: bigint; description: string }) =>
      send({ to: params.to, value: params.amountWei, description: params.description }),
    [send]
  );

  const exportKey = useCallback(async () => {
    if (!wallet || !isEmbedded) return;
    await exportWallet({ address: wallet.address });
  }, [wallet, isEmbedded, exportWallet]);

  return {
    ready,
    address: wallet?.address ?? user?.walletAddress ?? null,
    wallet,
    isEmbedded,
    sendToken,
    sendNative,
    exportKey,
  };
}

/** User closed the wallet modal — not an error worth showing. */
export function isUserRejection(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("closed modal") ||
    message.includes("exited") ||
    message.includes("cancel")
  );
}

export function walletErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/insufficient funds|gas/i.test(message)) {
    return "Not enough gas. Add a little BNB to your wallet to pay network fees.";
  }
  if (/transfer amount exceeds balance|exceeds balance/i.test(message)) {
    return "Not enough USDC in your wallet.";
  }
  return message.length > 140 ? "Transaction failed. Please try again." : message;
}
