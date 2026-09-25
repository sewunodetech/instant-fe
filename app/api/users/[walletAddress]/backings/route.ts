import { NextRequest } from "next/server";
import { DonationService } from "@/lib/services/donation.service";
import { UserService } from "@/lib/services/user.service";
import { errorResponse, handleApiError, paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/users/:handle/backings — supports a user sent. */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/users/[walletAddress]/backings">) {
  try {
    const { walletAddress: handle } = await params;
    const user = await UserService.findByHandle(handle);
    if (!user) return errorResponse(404, "User not found");

    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { donations, total } = await DonationService.list({ userId: user.id }, page, limit);
    return paginatedResponse(donations, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
