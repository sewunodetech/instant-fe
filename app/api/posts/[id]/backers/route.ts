import { NextRequest } from "next/server";
import { BackingService } from "@/lib/services/backing.service";
import { paginatedResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { backings, total } = await BackingService.getPostBackers(id, page, limit);
    return paginatedResponse(backings, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
