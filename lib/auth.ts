import { PrivyClient } from "@privy-io/server-auth";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api-response";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

export async function getAuthenticatedUser(request: NextRequest) {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid authorization header");
  }

  const token = header.slice(7);

  try {
    const { userId: privyId } = await privy.verifyAuthToken(token);

    const user = await prisma.user.findUnique({
      where: { privyId },
    });

    if (!user) {
      throw new HttpError(401, "User not found. Please sign up first.");
    }

    return user;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, "Invalid or expired token");
  }
}

export async function getOptionalUser(request: NextRequest) {
  try {
    return await getAuthenticatedUser(request);
  } catch {
    return null;
  }
}
