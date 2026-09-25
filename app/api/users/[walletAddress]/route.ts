import { NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { errorResponse, handleApiError, successResponse } from "@/lib/api-response";
import type { PublicProfile } from "@/lib/types";

/**
 * GET /api/users/:handle — public profile.
 * The segment keeps its historical name but accepts a username, wallet address or user id.
 * Private profiles only expose identity to anyone but their owner.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/users/[walletAddress]">) {
  try {
    const { walletAddress: handle } = await params;
    const viewer = await getOptionalUser(request);
    const resolved = await UserService.resolveForViewer(handle, viewer?.id);
    if (!resolved) return errorResponse(404, "User not found");
    const { user, restricted } = resolved;

    const profile: PublicProfile = {
      id: user.id,
      walletAddress: restricted ? null : user.walletAddress,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: restricted ? null : user.bio,
      createdAt: user.createdAt.toISOString(),
      isPrivate: user.isPrivate,
      restricted,
      stats: restricted ? null : await UserService.getStats(user.id),
    };
    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
