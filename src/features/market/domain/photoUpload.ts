/**
 * Validation for market listing photo uploads.
 * Kept in domain so API layer stays thin.
 */

export type PhotoUploadParams =
  | { status: "valid"; listingId: string; photos: File[] }
  | { status: "invalid"; error: string }

export function validatePhotoUploadParams(
  listingId: string | undefined,
  photos: File[],
): PhotoUploadParams {
  if (!listingId) {
    return {
      status: "invalid",
      error: "Listing ID is required for photo upload",
    }
  }
  if (!photos || photos.length === 0) {
    return { status: "invalid", error: "At least one photo is required" }
  }
  return { status: "valid", listingId, photos }
}
