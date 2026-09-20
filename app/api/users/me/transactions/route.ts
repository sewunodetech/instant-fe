import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { TransactionService } from "@/lib/services/transaction.service";
import { paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { transactions, total } = await TransactionService.getUserTransactions(
      user.walletAddress,
      page,
      limit
    );

    return paginatedResponse(transactions, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
