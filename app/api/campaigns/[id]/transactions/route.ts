import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/campaigns/:id/transactions — verified on-chain transactions for a campaign. */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]/transactions">) {
  try {
    const { id } = await params;
    const { page, limit, skip } = parsePagination(request.nextUrl.searchParams);
    const where = { campaignId: id };
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.transaction.count({ where }),
    ]);
    const data = transactions.map((t) => ({
      ...t,
      amount: t.amount?.toString() ?? null,
      blockNumber: t.blockNumber?.toString() ?? null,
    }));
    return paginatedResponse(data, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
