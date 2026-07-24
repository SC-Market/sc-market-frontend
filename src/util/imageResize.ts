/**
 * Client-side image downscaling helpers.
 *
 * Images are uploaded from many places (listings, org/profile avatars &
 * banners, shop logos, service photos). Rather than rejecting large files, we
 * downscale them in the browser before upload: this keeps payloads small
 * (faster uploads, well under the backend/Lambda limits) and produces a
 * consistent output format (WebP) regardless of what the user picked.
 *
 * The backend Lambda applies the same bounds as an authoritative backstop, so
 * these helpers are a best-effort optimization — any failure falls back to
 * returning the original file untouched.
 */

export interface ResizeImageOptions {
  /** Max width/height in pixels; the image is scaled to fit inside this box. */
  maxDimension: number
  /** WebP quality, 0..1. */
  quality: number
}

/** Listing / service / shop photos — large enough to look crisp on desktop. */
export const PHOTO_RESIZE: ResizeImageOptions = {
  maxDimension: 1920,
  quality: 0.85,
}

/** Wide header/banner images. */
export const BANNER_RESIZE: ResizeImageOptions = {
  maxDimension: 1920,
  quality: 0.85,
}

/** Small square avatars / logos. */
export const AVATAR_RESIZE: ResizeImageOptions = {
  maxDimension: 512,
  quality: 0.9,
}

// Raster formats the browser can decode via createImageBitmap and that we are
// willing to re-encode. Anything else (svg, gif, etc.) is passed through as-is.
const RESIZABLE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
])

function canResize(file: File): boolean {
  return RESIZABLE_TYPES.has(file.type.toLowerCase())
}

function toWebpName(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, "")
  return `${base || "image"}.webp`
}

async function decode(file: File): Promise<ImageBitmap> {
  // `imageOrientation: "from-image"` bakes EXIF orientation into the pixels so
  // rotated phone photos come out upright once drawn to the canvas.
  return await createImageBitmap(file, { imageOrientation: "from-image" })
}

async function encodeCanvas(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  if (typeof (canvas as OffscreenCanvas).convertToBlob === "function") {
    return await (canvas as OffscreenCanvas).convertToBlob({
      type: "image/webp",
      quality,
    })
  }
  return await new Promise<Blob | null>((resolve) =>
    (canvas as HTMLCanvasElement).toBlob(resolve, "image/webp", quality),
  )
}

/**
 * Downscale and re-encode an image file to WebP, fitting within
 * `maxDimension` on the longest side. Returns a new `File` on success, or the
 * original file if resizing isn't applicable or fails for any reason.
 *
 * The re-encoded result is only used when it's actually smaller than the
 * original; otherwise (e.g. an already-tiny image) the original is kept.
 */
export async function resizeImageFile(
  file: File,
  options: ResizeImageOptions = PHOTO_RESIZE,
): Promise<File> {
  if (!canResize(file)) {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await decode(file)
  } catch {
    // Undecodable / corrupt — let the backend deal with it.
    return file
  }

  try {
    const { width, height } = bitmap
    const scale = Math.min(1, options.maxDimension / Math.max(width, height))
    const targetWidth = Math.max(1, Math.round(width * scale))
    const targetHeight = Math.max(1, Math.round(height * scale))

    const canvas: OffscreenCanvas | HTMLCanvasElement =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(targetWidth, targetHeight)
        : Object.assign(document.createElement("canvas"), {
            width: targetWidth,
            height: targetHeight,
          })

    const ctx = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null
    if (!ctx) return file

    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight)

    const blob = await encodeCanvas(canvas, options.quality)
    if (!blob) return file

    // Keep whichever is smaller — never inflate an already-optimized image.
    if (blob.size >= file.size && scale === 1) {
      return file
    }

    return new File([blob], toWebpName(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    })
  } catch {
    return file
  } finally {
    bitmap.close()
  }
}

/** Resize a list of files, preserving order. */
export async function resizeImageFiles(
  files: File[],
  options: ResizeImageOptions = PHOTO_RESIZE,
): Promise<File[]> {
  return await Promise.all(files.map((file) => resizeImageFile(file, options)))
}
