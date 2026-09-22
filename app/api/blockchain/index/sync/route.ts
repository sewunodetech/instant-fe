import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { DonationService } from "@/lib/services/donation.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    await getAuthenticatedUser(request);
    const body = await request.json();
    const { txHash, blockNumber } = body as {
      txHash?: string;
      blockNumber?: number;
    };

    if (!txHash || typeof txHash !== "string") {
      return errorResponse(400, "txHash is required");
    }
    if (!blockNumber || typeof blockNumber !== "number") {
      return errorResponse(400, "blockNumber is required");
    }

    const donation = await DonationService.confirmDonation(txHash, blockNumber);
    return successResponse(donation);
  } catch (error) {
    return handleApiError(error);
  }
}
