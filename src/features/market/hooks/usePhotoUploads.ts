/**
 * Photos for a listing or buy order form, uploaded as soon as they're
 * picked. Each shows as uploading, then done (with its resource id) or
 * failed (with the reason), so a failure stays on its thumbnail.
 */
import { useCallback, useState } from "react"
import { useUploadImageMutation } from "../../../store/api/v2/market-overrides"
import type { UploadedImageStatus } from "../../../components/modal/PhotoEntries"
import { uploadErrorDetail } from "../domain/uploadError"

/** `failedMessage`: shown when the API gives no reason. */
export function usePhotoUploads(failedMessage: string) {
  const [uploadImage] = useUploadImageMutation()
  const [uploadedImages, setUploadedImages] = useState<UploadedImageStatus[]>(
    [],
  )
  const [photoResourceIds, setPhotoResourceIds] = useState<string[]>([])

  const upload = useCallback(
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
                  ? {
                      ...img,
                      resource_id: result.resource_id,
                      url: result.url,
                      status: "success" as const,
                    }
                  : img,
              ),
            )
            setPhotoResourceIds((prev) => [...prev, result.resource_id])
          })
          .catch((err) => {
            const error = uploadErrorDetail(err) || failedMessage
            setUploadedImages((prev) =>
              prev.map((img) =>
                img.resource_id === tempId
                  ? { ...img, status: "error" as const, error }
                  : img,
              ),
            )
          })
      }
    },
    [uploadImage, failedMessage],
  )

  const remove = useCallback((resourceId: string) => {
    setUploadedImages((prev) =>
      prev.filter((img) => img.resource_id !== resourceId),
    )
    setPhotoResourceIds((prev) => prev.filter((id) => id !== resourceId))
  }, [])

  const reset = useCallback(() => {
    setUploadedImages([])
    setPhotoResourceIds([])
  }, [])

  return {
    uploadedImages,
    photoResourceIds,
    isUploading: uploadedImages.some((img) => img.status === "uploading"),
    upload,
    remove,
    reset,
  }
}
