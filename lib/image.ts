"use client";

/**
 * Downscales an image to fit `maxSize` on its long edge and re-encodes as JPEG.
 * Keeps uploads small (~200–500KB) so feeds load fast on mobile data.
 */
export async function compressImage(source: Blob | HTMLCanvasElement, maxSize = 1600, quality = 0.85): Promise<Blob> {
  let width: number;
  let height: number;
  let draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  let bitmap: ImageBitmap | null = null;

  if (source instanceof HTMLCanvasElement) {
    width = source.width;
    height = source.height;
    draw = (ctx, w, h) => ctx.drawImage(source, 0, 0, w, h);
  } else {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
    width = bitmap.width;
    height = bitmap.height;
    draw = (ctx, w, h) => ctx.drawImage(bitmap!, 0, 0, w, h);
  }

  const scale = Math.min(1, maxSize / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  draw(ctx, canvas.width, canvas.height);
  bitmap?.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))), "image/jpeg", quality)
  );
}
