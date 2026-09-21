import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { BackingService } from "@/lib/services/backing.service";
import { successResponse } from "@/lib/api-response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(_request);
    const { id } = await params;
    const result = await BackingService.createBackingIntent(user.id, id);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
