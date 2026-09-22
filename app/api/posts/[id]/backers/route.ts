import { NextRequest } from "next/server";
import { DonationService } from "@/lib/services/donation.service";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.getPostDonors(id, page, limit);
    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
