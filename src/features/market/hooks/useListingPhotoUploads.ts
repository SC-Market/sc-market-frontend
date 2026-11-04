import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { usePhotoUploads } from "./usePhotoUploads"

/**
 * Photos for a new listing (SelectPhotosArea): each file is uploaded as soon
 * as it is picked (two-phase upload, usePhotoUploads), and the listing is
 * then created with the uploaded resource ids plus any linked image URLs.
 */
export function useListingPhotoUploads() {
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<string[]>([])
  const uploads = usePhotoUploads(
    t("SelectPhotosArea.uploadFailed", "Upload failed"),
  )
  const { reset: resetUploads } = uploads

  /** Clears every photo (after a listing was created with them). */
  const reset = useCallback(() => {
    setPhotos([])
    resetUploads()
  }, [resetUploads])

  return {
    photos,
    setPhotos,
    photoResourceIds: uploads.photoResourceIds,
    uploadedImages: uploads.uploadedImages,
    isUploading: uploads.isUploading,
    handleFileUpload: uploads.upload,
    handleRemoveUploadedImage: uploads.remove,
    reset,
  }
}
