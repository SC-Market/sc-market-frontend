import {
  Avatar,
  Box,
  Fab,
  Paper,
  useTheme,
  CircularProgress,
  Tooltip,
} from "@mui/material"
import {
  CheckCircleRounded,
  CloseRounded,
  ErrorRounded,
} from "@mui/icons-material"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function PhotoEntry(props: { url: string; onClose: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <Paper
      sx={{
        width: 96,
        height: 96,
        bgcolor: theme.palette.background.imageOverlay,
        position: "relative",
      }}
    >
      <Fab
        aria-label={t("photos.removePhoto", "Remove photo")}
        size={"small"}
        sx={{
          transform: "scale(0.6)",
          position: "absolute",
          top: -4,
          right: -4,
        }}
        onClick={props.onClose}
      >
        <CloseRounded />
      </Fab>
      <Avatar
        src={props.url}
        sx={{ borderRadius: 0, width: "100%", height: "100%" }}
      />
    </Paper>
  )
}

export function PendingPhotoEntry(props: { file: File; onClose: () => void }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [previewUrl, setPreviewUrl] = useState<string>("")

  React.useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(props.file)
  }, [props.file])

  return (
    <Paper
      sx={{
        width: 96,
        height: 96,
        bgcolor: theme.palette.background.imageOverlay,
        position: "relative",
      }}
    >
      <Fab
        aria-label={t("photos.removePhoto", "Remove photo")}
        size={"small"}
        sx={{
          transform: "scale(0.6)",
          position: "absolute",
          top: -4,
          right: -4,
        }}
        onClick={props.onClose}
      >
        <CloseRounded />
      </Fab>
      <Avatar
        src={previewUrl}
        sx={{ borderRadius: 0, width: "100%", height: "100%" }}
      />
    </Paper>
  )
}

export interface UploadedImageStatus {
  resource_id: string
  url: string
  status: "uploading" | "success" | "error"
  error?: string
  file: File
}

export function UploadingPhotoEntry(props: {
  imageStatus: UploadedImageStatus
  onClose: () => void
}) {
  const { imageStatus, onClose } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [previewUrl, setPreviewUrl] = useState<string>("")
  // Controlled so the failure reason can be revealed by tap on touch devices
  // (where hover doesn't exist) as well as by hover on desktop.
  const [errorTipOpen, setErrorTipOpen] = useState(false)

  React.useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(imageStatus.file)
  }, [imageStatus.file])

  return (
    <Paper
      sx={{
        width: 96,
        height: 96,
        bgcolor: theme.palette.background.imageOverlay,
        position: "relative",
      }}
    >
      <Fab
        aria-label={t("photos.cancelUpload", "Cancel upload")}
        size={"small"}
        sx={{
          transform: "scale(0.6)",
          position: "absolute",
          top: -4,
          right: -4,
          zIndex: 2,
        }}
        onClick={onClose}
      >
        <CloseRounded />
      </Fab>
      <Avatar
        src={previewUrl}
        sx={{ borderRadius: 0, width: "100%", height: "100%" }}
      />
      {/* Status overlay */}
      {imageStatus.status === "uploading" && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 0,
          }}
        >
          <CircularProgress size={32} sx={{ color: "white" }} />
        </Box>
      )}
      {imageStatus.status === "success" && (
        <Box
          sx={{
            position: "absolute",
            bottom: 2,
            right: 2,
          }}
        >
          <CheckCircleRounded
            sx={{ color: theme.palette.success.main, fontSize: 22 }}
          />
        </Box>
      )}
      {imageStatus.status === "error" && (
        <Tooltip
          title={
            imageStatus.error ||
            t("SelectPhotosArea.uploadFailed", "Upload failed")
          }
          arrow
          open={errorTipOpen}
          onOpen={() => setErrorTipOpen(true)}
          onClose={() => setErrorTipOpen(false)}
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <Box
            role="button"
            tabIndex={0}
            aria-label={
              imageStatus.error ||
              t("SelectPhotosArea.uploadFailed", "Upload failed")
            }
            onClick={(e) => {
              // Toggle on tap/click so touch users (no hover) can read why it failed.
              e.stopPropagation()
              setErrorTipOpen((prev) => !prev)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setErrorTipOpen((prev) => !prev)
              }
            }}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 0,
              cursor: "pointer",
            }}
          >
            <ErrorRounded
              sx={{ color: theme.palette.error.main, fontSize: 32 }}
            />
          </Box>
        </Tooltip>
      )}
    </Paper>
  )
}
