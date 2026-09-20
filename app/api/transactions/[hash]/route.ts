import { NextRequest } from "next/server";
import { TransactionService } from "@/lib/services/transaction.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const tx = await TransactionService.findByHash(hash);
    if (!tx) return errorResponse(404, "Transaction not found");
    return successResponse(tx);
  } catch (error) {
    return handleApiError(error);
  }
}
