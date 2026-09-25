import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError, successResponse } from "@/lib/api-response";
import { UserService } from "@/lib/services/user.service";

/** GET /api/users/me/activity — votes, support and results for the signed-in user. */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    return successResponse(await UserService.activity(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}
