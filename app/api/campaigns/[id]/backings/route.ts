import { NextRequest } from "next/server";
import { DonationService } from "@/lib/services/donation.service";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/campaigns/:id/backings — confirmed supports in a campaign. */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]/backings">) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.list({ campaignId: id }, page, limit);
    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
