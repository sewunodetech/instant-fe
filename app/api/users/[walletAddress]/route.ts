import { NextRequest } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import type { PublicProfile } from "@/lib/types";

/**
 * GET /api/users/:handle — public profile.
 * The segment keeps its historical name but accepts a username, wallet address or user id.
 */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/users/[walletAddress]">) {
  try {
    const { walletAddress: handle } = await params;
    const user = await UserService.findByHandle(handle);
    if (!user) return errorResponse(404, "User not found");

    const profile: PublicProfile = {
      id: user.id,
      walletAddress: user.walletAddress,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      stats: await UserService.getStats(user.id),
    };
    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
