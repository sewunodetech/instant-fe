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
    const { transactions, total } = await CampaignService.getCampaignTransactions(id, page, limit);
    return paginatedResponse(transactions, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
