/**
 * Photos are shrunk in the browser before upload: a phone photo is 3–8 MB, but the site never shows
 * one larger than this, and on a slow uplink every megabyte is several seconds of waiting.
 */
const MAX_EDGE = 2048;
const QUALITY = 0.82;
/** Below this size and within MAX_EDGE, re-encoding would save too little to be worth it. */
const ALREADY_SMALL = 600 * 1024;
/** Decoding needs width × height × 4 bytes of memory, so absurdly large sources are refused up front. */
export const MAX_SOURCE_PHOTO_BYTES = 40 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string): Promise<Blob | null> => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

const renamed = (name: string, extension: string): string => `${name.replace(/\.[^.]+$/, "") || "photo"}.${extension}`;

/**
 * A copy of the photo at most `maxEdge` (default 2048) px on its long edge, as WebP (JPEG where the browser cannot
 * encode WebP), upright per its EXIF orientation. Returns the original whenever shrinking fails or
 * would not make it smaller, so this can only ever help.
 */
export async function shrinkImage(file: File, maxEdge = MAX_EDGE): Promise<File> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // Not decodable here (e.g. an unusual PNG); Cloudinary will still take the original.
  }

  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= ALREADY_SMALL) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob = await toBlob(canvas, "image/webp");
    let extension = "webp";
    // Browsers that cannot encode WebP quietly return a PNG instead. JPEG has no transparency, so
    // transparent areas get a white background rather than turning black.
    if (!blob || blob.type !== "image/webp") {
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      blob = await toBlob(canvas, "image/jpeg");
      extension = "jpg";
    }

    if (!blob || blob.size >= file.size) return file;
    return new File([blob], renamed(file.name, extension), { type: blob.type, lastModified: file.lastModified });
  } finally {
    bitmap.close();
  }
}
