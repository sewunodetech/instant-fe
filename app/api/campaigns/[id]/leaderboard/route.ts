import { NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import { PostService } from "@/lib/services/post.service";

/** GET /api/campaigns/:id/leaderboard — live ranking, or final results once ended. */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/campaigns/[id]/leaderboard">) {
  try {
    const { id } = await params;
    const viewer = await getOptionalUser(request);
    const board = await PostService.leaderboard(id, viewer?.id);
    if (!board) return errorResponse(404, "Campaign not found");
    return successResponse(board);
  } catch (error) {
    return handleApiError(error);
  }
}
