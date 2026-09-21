import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api-response";

export class TransactionService {
  static async findByHash(hash: string) {
    return prisma.transaction.findUnique({ where: { txHash: hash } });
  }

  static async getUserTransactions(
    walletAddress: string,
    page = 1,
    limit = 20
  ) {
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
    return { transactions, total };
  }
}
