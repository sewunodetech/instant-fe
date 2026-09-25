import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, successResponse } from "@/lib/api-response";
import { toAppUser, UserService } from "@/lib/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const stats = await UserService.getStats(user.id);
    return successResponse({ ...toAppUser(user), stats });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const updated = await UserService.update(user.id, {
      username: body.username,
      displayName: body.displayName,
      avatarUrl: body.avatarUrl,
      bio: body.bio,
      isPrivate: body.isPrivate,
    });
    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
