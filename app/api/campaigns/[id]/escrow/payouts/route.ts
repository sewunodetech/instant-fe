import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, paginatedResponse, successResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";
import { EscrowService } from "@/lib/services/escrow.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { payouts, total } = await EscrowService.listPayouts(id, page, limit);
    return paginatedResponse(payouts, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

/** Build the `payout` / `payoutMany` call for posts the brand picked. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { items } = body as { items?: unknown };

    if (
      !Array.isArray(items) ||
      !items.every(
        (i) =>
          i && typeof i.postId === "string" && typeof i.amount === "number" && Number.isFinite(i.amount)
      )
    ) {
      return errorResponse(400, "items must be an array of { postId, amount }");
    }

    const transaction = await EscrowService.payoutIntent(id, user.id, items);
    return successResponse({ transaction });
  } catch (error) {
    return handleApiError(error);
  }
}
