import { NextRequest } from "next/server";
import { LeaderboardService } from "@/lib/services/leaderboard.service";
import { successResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leaderboard = await LeaderboardService.getLeaderboard(id);
    return successResponse(leaderboard);
  } catch (error) {
    return handleApiError(error);
  }
}
