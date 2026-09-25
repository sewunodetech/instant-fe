import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, paginatedResponse } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";
import { parsePagination } from "@/lib/pagination";

/** GET /api/users/me/campaigns?role=joined|hosted */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
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
