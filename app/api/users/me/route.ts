import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { UserService } from "@/lib/services/user.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const stats = await UserService.getStats(user.walletAddress || "");

    return successResponse({
      id: user.id,
      privyId: user.privyId,
      walletAddress: user.walletAddress,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      stats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const { username, displayName, avatarUrl } = body;

    if (username !== undefined && (typeof username !== "string" || username.length > 30)) {
      return errorResponse(400, "Username must be a string of max 30 characters");
    }
    if (displayName !== undefined && (typeof displayName !== "string" || displayName.length > 100)) {
      return errorResponse(400, "Display name must be a string of max 100 characters");
    }

    const updated = await UserService.update(user.id, { username, displayName, avatarUrl });

    return successResponse({
      id: updated.id,
      privyId: updated.privyId,
      walletAddress: updated.walletAddress,
      username: updated.username,
      displayName: updated.displayName,
      avatarUrl: updated.avatarUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
