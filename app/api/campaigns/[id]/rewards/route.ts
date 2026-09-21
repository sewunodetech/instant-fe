import { NextRequest } from "next/server";
import { CampaignService } from "@/lib/services/campaign.service";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { rewards, total } = await CampaignService.getCampaignRewards(id, page, limit);
    return paginatedResponse(rewards, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
