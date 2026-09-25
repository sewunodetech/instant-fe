import { errorResponse } from "@/lib/api-response";

/** @deprecated Campaigns go live as soon as they're created. */
export async function POST() {
  return errorResponse(410, "Campaigns start automatically when created");
}
