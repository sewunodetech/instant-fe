import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { CampaignService } from "@/lib/services/campaign.service";
import { paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { campaigns, total } = await CampaignService.getUserCampaigns(
      user.walletAddress || "",
      page,
      limit
    );

    return paginatedResponse(campaigns, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
