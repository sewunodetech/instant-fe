import { prisma } from "@/lib/prisma";
import type { Transaction } from "@/lib/generated/prisma/client";

/** Decimal/BigInt columns aren't JSON-serializable; expose them as strings. */
function serialize(tx: Transaction) {
  return {
    ...tx,
    amount: tx.amount?.toString() ?? null,
    blockNumber: tx.blockNumber?.toString() ?? null,
  };
}

export class TransactionService {
  static async findByHash(hash: string) {
    const tx = await prisma.transaction.findUnique({ where: { txHash: hash } });
    return tx ? serialize(tx) : null;
  }

  static async getUserTransactions(walletAddress: string, page = 1, limit = 20) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return { transactions: [], total: 0 };

    const where = { userId: user.id };
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions: transactions.map(serialize), total };
  }
}
