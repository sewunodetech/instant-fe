import { NextRequest } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { CampaignService } from "@/lib/services/campaign.service";
import { UserService } from "@/lib/services/user.service";
import { errorResponse, handleApiError, paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

/** GET /api/users/:handle/campaigns?role=joined|hosted */
export async function GET(request: NextRequest, { params }: RouteContext<"/api/users/[walletAddress]/campaigns">) {
  try {
    const { walletAddress: handle } = await params;
    const viewer = await getOptionalUser(request);
    const resolved = await UserService.resolveForViewer(handle, viewer?.id);
    if (!resolved) return errorResponse(404, "User not found");
    const hosted = request.nextUrl.searchParams.get("role") === "hosted";
    // Hosted campaigns are public anyway (host name is on every campaign); joined ones aren't.
    if (resolved.restricted && !hosted) return errorResponse(403, "This account is private");

    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const { campaigns, total } = hosted
      ? await CampaignService.hostedBy(resolved.user.id, page, limit, viewer?.id)
      : await CampaignService.joinedBy(resolved.user.id, page, limit, viewer?.id);
    return paginatedResponse(campaigns, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
