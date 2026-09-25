import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, paginatedResponse } from "@/lib/api-response";
import { DonationService } from "@/lib/services/donation.service";
import { parsePagination } from "@/lib/pagination";

/** GET /api/users/me/backings — supports the signed-in user sent. */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.list({ userId: user.id }, page, limit);
    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
