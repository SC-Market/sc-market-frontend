import { Stack } from "@mui/system"
import { Box, ButtonBase, Paper, Typography, useTheme } from "@mui/material"
import { AddAPhotoRounded, CloudUploadRounded } from "@mui/icons-material"
import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ImageUrlDialog } from "./ImageUrlDialog"
import { usePhotoFileDrop } from "./usePhotoFileDrop"
import {
  PhotoEntry,
  PendingPhotoEntry,
  UploadingPhotoEntry,
  UploadedImageStatus,
} from "./PhotoEntries"

export function SelectPhotosArea(props: {
  setPhotos: (photos: string[]) => void
  photos: string[]
  onFileUpload?: (files: File[]) => void
  showUploadButton?: boolean
  pendingFiles?: File[]
  onRemovePendingFile?: (file: File) => void
  onAlert?: (severity: "warning" | "error", message: string) => void
  /** Tracked uploaded images with per-image status (two-phase upload mode) */
  uploadedImages?: UploadedImageStatus[]
  /** Called to remove an uploaded image from the tracked list */
  onRemoveUploadedImage?: (resourceId: string) => void
}) {
  const {
    photos,
    setPhotos,
    onFileUpload,
    showUploadButton = true,
    pendingFiles = [],
    onRemovePendingFile,
    onAlert,
    uploadedImages = [],
    onRemoveUploadedImage,
  } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [urlModalOpen, setUrlModalOpen] = useState(false)

  const {
    isDragOver,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = usePhotoFileDrop({ onFileUpload, onAlert })

  const handleRemovePendingFile = (file: File) => {
    console.log(`[SelectPhotosArea] Removing pending file:`, {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    })
    if (onRemovePendingFile) {
      onRemovePendingFile(file)
    }
  }

  const handleRemovePhoto = (photo: string) => {
    console.log(`[SelectPhotosArea] Removing existing photo:`, {
      photo_url: photo,
    })
    setPhotos(photos.filter((p) => p !== photo))
  }

  return (
    <>
      <Stack
        direction={"row"}
        flexWrap={"wrap"}
        justifyContent={"left"}
        sx={{
          "& > *": {
            margin: 0.5,
          },
          border: isDragOver
            ? `2px dashed ${theme.palette.primary.main}`
            : "2px dashed transparent",
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          padding: isDragOver ? 1 : 0,
          backgroundColor: isDragOver
            ? `${theme.palette.primary.main}08`
            : "transparent",
          transition: "all 0.2s ease-in-out",
          minHeight: 120,
          position: "relative",
          transform: isDragOver ? "scale(1.02)" : "scale(1)",
          boxShadow: isDragOver
            ? `0 4px 20px ${theme.palette.primary.main}26`
            : "none",
          "&::before": isDragOver
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: `${theme.palette.primary.main}04`,
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
                zIndex: -1,
              }
            : {},
          "@keyframes pulse": {
            "0%": {
              transform: "scale(1)",
              opacity: 1,
            },
            "50%": {
              transform: "scale(1.05)",
              opacity: 0.8,
            },
            "100%": {
              transform: "scale(1)",
              opacity: 1,
            },
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={t("SelectPhotosArea.dragAndDropArea")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        {/* URL input button for external image URLs */}
        <Paper
          sx={{
            width: 96,
            height: 96,
            bgcolor: theme.palette.background.imageOverlay,
          }}
        >
          <ButtonBase
            sx={{ width: "100%", height: "100%" }}
            onClick={() => {
              setUrlModalOpen(true)
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <AddAPhotoRounded />
              <Typography
                variant="caption"
                sx={{ fontSize: "0.7rem", mt: 0.5 }}
              >
                {t("SelectPhotosArea.addUrl", "Add URL")}
              </Typography>
            </Box>
          </ButtonBase>
        </Paper>

        {showUploadButton && onFileUpload && (
          <Paper
            sx={{
              width: 96,
              height: 96,
              bgcolor: theme.palette.background.imageOverlay,
            }}
          >
            <ButtonBase
              sx={{ width: "100%", height: "100%" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <CloudUploadRounded />
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.7rem", mt: 0.5 }}
                >
                  {t("SelectPhotosArea.upload")}
                </Typography>
              </Box>
            </ButtonBase>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileUpload}
            />
          </Paper>
        )}

        {/* Display pending files (legacy mode without two-phase upload) */}
        {pendingFiles.map((file, index) => (
          <PendingPhotoEntry
            file={file}
            key={`pending-${index}`}
            onClose={() => handleRemovePendingFile(file)}
          />
        ))}

        {/* Display uploading/uploaded images (two-phase upload mode) */}
        {uploadedImages.map((img) => (
          <UploadingPhotoEntry
            imageStatus={img}
            key={`upload-${img.resource_id}`}
            onClose={() => {
              if (onRemoveUploadedImage) {
                onRemoveUploadedImage(img.resource_id)
              }
            }}
          />
        ))}

        {/* Display searched images */}
        {photos.map((url, index) => (
          <PhotoEntry
            url={url}
            key={`searched-${index}`}
            onClose={() => handleRemovePhoto(url)}
          />
        ))}

        {/* Drag and drop indicator */}
        {isDragOver && (
          <Paper
            sx={{
              width: 96,
              height: 96,
              bgcolor: `${theme.palette.primary.main}26`,
              border: `2px dashed ${theme.palette.primary.main}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <CloudUploadRounded
              sx={{ color: theme.palette.primary.main, fontSize: 32 }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                mt: 0.5,
                color: theme.palette.primary.main,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {t("SelectPhotosArea.dropHere")}
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Drag and drop hint */}
      {onFileUpload && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            color: theme.palette.text.secondary,
            fontSize: "0.7rem",
            fontStyle: "italic",
          }}
        >
          {t("SelectPhotosArea.dragAndDropHint")}
        </Typography>
      )}

      {/* URL Input Modal */}
      <ImageUrlDialog
        open={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onAdd={(url) => setPhotos([...photos, url])}
      />
    </>
  )
}
