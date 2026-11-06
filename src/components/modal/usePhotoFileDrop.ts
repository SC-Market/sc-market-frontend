import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { resizeImageFiles, PHOTO_RESIZE } from "../../util/imageResize"

// Sanity cap on the raw input before we attempt to decode/downscale it. This is
// deliberately generous — downscaling brings the actual upload well below the
// backend limits, so this only guards against pathologically huge inputs.
const MAX_INPUT_SIZE = 25 * 1024 * 1024 // 25MB

/**
 * SelectPhotosArea's file picker and drag-and-drop: skips oversized and
 * non-image files (warning through onAlert), downscales the rest and hands
 * them to onFileUpload.
 */
export function usePhotoFileDrop({
  onFileUpload,
  onAlert,
}: {
  onFileUpload?: (files: File[]) => void
  onAlert?: (severity: "warning" | "error", message: string) => void
}) {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        console.log(`[SelectPhotosArea] File upload initiated:`, {
          file_count: files.length,
          files: Array.from(files).map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        })

        const fileArray = Array.from(files)
        const withinCap = fileArray.filter(
          (file) => file.size <= MAX_INPUT_SIZE,
        )
        const oversizedFiles = fileArray.filter(
          (file) => file.size > MAX_INPUT_SIZE,
        )

        if (oversizedFiles.length > 0) {
          console.warn(`[SelectPhotosArea] Files too large, skipping:`, {
            count: oversizedFiles.length,
            files: oversizedFiles.map((f) => ({ name: f.name, size: f.size })),
          })

          // Show warning for oversized files
          if (onAlert) {
            if (oversizedFiles.length === 1) {
              onAlert("warning", t("SelectPhotosArea.fileTooLarge"))
            } else {
              onAlert("warning", t("SelectPhotosArea.someFilesTooLarge"))
            }
          }
        }

        if (withinCap.length > 0 && onFileUpload) {
          // Downscale in the browser before uploading to keep payloads small.
          const resized = await resizeImageFiles(withinCap, PHOTO_RESIZE)
          onFileUpload(resized)
        }
      }
      // Reset the input value so the same file can be selected again
      event.target.value = ""
    },
    [onFileUpload, t, onAlert],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!isDragOver) {
        console.log(`[SelectPhotosArea] Drag over started`)
        setIsDragOver(true)
      }
    },
    [isDragOver],
  )

  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isDragOver) {
        console.log(`[SelectPhotosArea] Drag over ended`)
        setIsDragOver(false)
      }
    },
    [isDragOver],
  )

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(event.dataTransfer.files)
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      const withinCap = imageFiles.filter((file) => file.size <= MAX_INPUT_SIZE)
      const oversizedImageFiles = imageFiles.filter(
        (file) => file.size > MAX_INPUT_SIZE,
      )

      if (oversizedImageFiles.length > 0) {
        console.warn(`[SelectPhotosArea] Image files too large, skipping:`, {
          count: oversizedImageFiles.length,
          files: oversizedImageFiles.map((f) => ({
            name: f.name,
            size: f.size,
          })),
        })

        // Show warning for oversized files
        if (onAlert) {
          if (oversizedImageFiles.length === 1) {
            onAlert("warning", t("SelectPhotosArea.fileTooLarge"))
          } else {
            onAlert("warning", t("SelectPhotosArea.someFilesTooLarge"))
          }
        }
      }

      if (withinCap.length > 0) {
        console.log(`[SelectPhotosArea] Drag and drop file upload:`, {
          file_count: withinCap.length,
          files: withinCap.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        })

        if (onFileUpload) {
          // Downscale in the browser before uploading to keep payloads small.
          const resized = await resizeImageFiles(withinCap, PHOTO_RESIZE)
          onFileUpload(resized)
        }
      } else if (files.length > 0) {
        console.warn(`[SelectPhotosArea] Non-image files dropped, ignoring:`, {
          file_count: files.length,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        })
      }
    },
    [onFileUpload, onAlert, t],
  )

  return {
    isDragOver,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
