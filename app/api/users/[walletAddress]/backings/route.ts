import { NextRequest } from "next/server";
import { DonationService } from "@/lib/services/donation.service";
import { paginatedResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse(400, "Invalid wallet address format");
    }

    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.getUserDonations(
      walletAddress,
      page,
      limit
    );

    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
