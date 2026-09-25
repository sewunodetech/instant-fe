import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { UserService } from "@/lib/services/user.service";
import { errorResponse, handleApiError, paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/users/:handle/campaigns?role=joined|hosted */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/users/[walletAddress]/campaigns">) {
  try {
    const { walletAddress: handle } = await params;
    const user = await UserService.findByHandle(handle);
    if (!user) return errorResponse(404, "User not found");

    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const hosted = request.nextUrl.searchParams.get("role") === "hosted";
    const { campaigns, total } = hosted
      ? await CampaignService.hostedBy(user.id, page, limit)
      : await CampaignService.joinedBy(user.id, page, limit);
    return paginatedResponse(campaigns, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
