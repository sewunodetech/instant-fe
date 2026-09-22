import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { DonationService } from "@/lib/services/donation.service";
import { paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user.walletAddress) {
      return paginatedResponse([], 0, 1, 20);
    }
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.getUserDonations(
      user.walletAddress,
      page,
      limit
    );

    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
