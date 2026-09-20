import { NextRequest } from "next/server";
import { VoteService } from "@/lib/services/vote.service";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { votes, total } = await VoteService.getPostVotes(id, page, limit);
    return paginatedResponse(votes, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
