import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { paginatedResponse } from "@/lib/api-response";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
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
