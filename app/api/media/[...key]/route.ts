import { NextRequest } from "next/server";
import { StorageService } from "@/lib/services/storage.service";

const KEY_RE = /^(snaps|avatars|covers)\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

/**
 * GET /api/media/<key> — streams an uploaded image from object storage.
 * Keys are random UUIDs and never rewritten, so responses are cached forever.
 */
export async function GET(_request: NextRequest, { params }: RouteContext<"/api/media/[...key]">) {
  const { key: parts } = await params;
  const key = parts.join("/");
  if (!KEY_RE.test(key)) return new Response("Not found", { status: 404 });

  try {
    const object = await StorageService.read(key);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": object.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    if (object.contentLength) headers.set("Content-Length", String(object.contentLength));
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("[media] read failed:", error);
    return new Response("Storage unavailable", { status: 502 });
  }
}
