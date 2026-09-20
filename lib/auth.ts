import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api-response";
import { ethers } from "ethers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "instant-fun-dev-secret");

export interface JWTPayload {
  userId: string;
  walletAddress: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

export function verifyWalletSignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}

export function buildAuthMessage(nonce: string, walletAddress: string): string {
  return `Sign this message to authenticate with Instant.fun\n\nWallet: ${walletAddress}\nNonce: ${nonce}\n\nThis will not cost you anything.`;
}

export async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new HttpError(401, "User not found");
  }

  return user;
}

export async function getOptionalUser(request: Request) {
  try {
    return await getAuthenticatedUser(request);
  } catch {
    return null;
  }
}
