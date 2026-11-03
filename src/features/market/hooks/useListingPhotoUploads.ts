import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { useUploadImageMutation } from "../../../store/api/v2/market-overrides"
import type { UploadedImageStatus } from "../../../components/modal/SelectPhotosArea"

/**
 * Photos for a new listing (SelectPhotosArea): each file is uploaded as soon
 * as it is picked (two-phase upload), and the listing is then created with
 * the uploaded resource ids plus any linked image URLs.
 */
export function useListingPhotoUploads() {
  const { t } = useTranslation()
  const [uploadImage] = useUploadImageMutation()
  const [photos, setPhotos] = useState<string[]>([])
  const [photoResourceIds, setPhotoResourceIds] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImageStatus[]>([])
  const isUploading = uploadedImages.some((img) => img.status === "uploading")

  const handleFileUpload = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const tempId = `temp-${crypto.randomUUID()}`
        setUploadedImages((prev) => [
          ...prev,
          { resource_id: tempId, url: "", status: "uploading", file },
        ])

        uploadImage(file)
          .unwrap()
          .then((result) => {
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.resource_id === tempId
                  ? { ...img, resource_id: result.resource_id, url: result.url, status: "success" as const }
                  : img,
              ),
            )
            setPhotoResourceIds((prev) => [...prev, result.resource_id])
          })
          .catch((err) => {
            const e = err as {
              data?: {
                error?: { message?: string; validationErrors?: { message: string }[] }
                message?: string
                validationErrors?: { message: string }[]
              }
            }
            const errBody = e?.data?.error || e?.data || {}
            const detail =
              errBody?.message ||
              errBody?.validationErrors?.[0]?.message ||
              t("SelectPhotosArea.uploadFailed", "Upload failed")
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.resource_id === tempId ? { ...img, status: "error" as const, error: detail } : img,
              ),
            )
          })
      }
    },
    [uploadImage, t],
  )

  const handleRemoveUploadedImage = useCallback((resourceId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.resource_id !== resourceId))
    setPhotoResourceIds((prev) => prev.filter((id) => id !== resourceId))
  }, [])

  /** Clears every photo (after a listing was created with them). */
  const reset = useCallback(() => {
    setPhotos([])
    setPhotoResourceIds([])
    setUploadedImages([])
  }, [])

  return {
    photos,
    setPhotos,
    photoResourceIds,
    uploadedImages,
    isUploading,
    handleFileUpload,
    handleRemoveUploadedImage,
    reset,
  }
}
