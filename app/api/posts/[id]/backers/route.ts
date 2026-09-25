import { NextRequest } from "next/server";
import { DonationService } from "@/lib/services/donation.service";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/posts/:id/backers — confirmed supports for a snap. */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/posts/[id]/backers">) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.list({ postId: id }, page, limit);
    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
