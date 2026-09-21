import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginatedResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ walletAddress: string }> }
) {
  try {
    const { walletAddress } = await params;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse(400, "Invalid wallet address format");
    }

    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
    if (!user) return errorResponse(404, "User not found");

    const { page, limit } = parsePagination(request.nextUrl.searchParams);
    const where = { userId: user.id };
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.reward.count({ where }),
    ]);

    return paginatedResponse(rewards, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}
