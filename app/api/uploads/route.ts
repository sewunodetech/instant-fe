import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { errorResponse, handleApiError, HttpError, successResponse } from "@/lib/api-response";
import { StorageService } from "@/lib/services/storage.service";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    const form = await request.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || !(file instanceof File)) {
      return errorResponse(400, "A file field is required");
    }

    const contentType = file.type || "application/octet-stream";
    const ext = ALLOWED[contentType];
    if (!ext) {
      return errorResponse(415, "Only JPEG, PNG, WebP, GIF, or AVIF images are allowed");
    }

    if (file.size > MAX_BYTES) {
      return errorResponse(413, "File must be 10MB or smaller");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `snaps/${user.id}/${randomUUID()}.${ext}`;
    let url: string;
    try {
      url = await StorageService.upload(buffer, key, contentType);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("[upload] S3 failed:", error);
      throw new HttpError(
        502,
        `Object storage upload failed: ${error instanceof Error ? error.message : "unknown error"}`
      );
    }

    return successResponse({ url, key, contentType, size: file.size });
  } catch (error) {
    return handleApiError(error);
  }
}
