import { NextRequest } from "next/server";
import { UserService } from "@/lib/services/user.service";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse(400, "Invalid wallet address format");
    }

    const user = await UserService.findByWalletAddress(walletAddress);
    if (!user) return errorResponse(404, "User not found");

    const stats = await UserService.getStats(walletAddress);

    return successResponse({
      id: user.id,
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
