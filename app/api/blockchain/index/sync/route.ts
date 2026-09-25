import { errorResponse } from "@/lib/api-response";

/** @deprecated Supports are verified per donation via POST /api/donations/:id { txHash }. */
export async function POST() {
  return errorResponse(410, "Use POST /api/donations/:id with the transaction hash");
}
