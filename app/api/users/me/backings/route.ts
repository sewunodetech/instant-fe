import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { BackingService } from "@/lib/services/backing.service";
import { paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { backings, total } = await BackingService.getUserBackings(
      user.walletAddress,
      page,
      limit
    );

    return paginatedResponse(backings, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
