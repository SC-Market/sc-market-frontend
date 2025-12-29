import { ImagePreviewModal } from "../modal/ImagePreviewModal"
import { IconButton, Paper, useTheme } from "@mui/material"
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomInRounded,
} from "@mui/icons-material"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function ImagePreviewPaper(props: { photos: string[] }) {
  const { photos } = props
  const theme = useTheme<ExtendedTheme>()
  const [imageIndex, setImageIndex] = useState(0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const { t } = useTranslation()

  const handlePreviousImage = (event: React.MouseEvent) => {
    setImageIndex((index) => Math.max(index - 1, 0))
    event.preventDefault()
    event.stopPropagation()
  }

  const handleNextImage = (event: React.MouseEvent) => {
    setImageIndex((index) => Math.min(index + 1, photos.length - 1))
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <>
      <ImagePreviewModal
        images={photos}
        index={imageIndex}
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
      />
      <Paper
        sx={{
          borderRadius: (theme) =>
            theme.spacing((theme as ExtendedTheme).borderRadius.image),
          backgroundColor: theme.palette.background.default,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          maxHeight: 600,
          height: 400,
          width: "100%",
          position: "relative",
        }}
        onClick={() => setImageModalOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-label={t("accessibility.openImagePreview", "Open image preview")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setImageModalOpen((o) => !o)
          } else if (event.key === "ArrowLeft" && imageIndex > 0) {
            setImageIndex((index) => Math.max(index - 1, 0))
          } else if (
            event.key === "ArrowRight" &&
            imageIndex < photos.length - 1
          ) {
            setImageIndex((index) => Math.min(index + 1, photos.length - 1))
          }
        }}
      >
        {imageIndex > 0 && (
          <IconButton
            sx={{ top: "50%", right: 4, position: "absolute" }}
            onClick={handlePreviousImage}
            aria-label={t("accessibility.previousImage", "Previous image")}
          >
            <KeyboardArrowRight
              sx={{ color: theme.palette.background.light }}
            />
          </IconButton>
        )}

        {imageIndex < photos.length - 1 && (
          <IconButton
            sx={{ top: "50%", left: 4, position: "absolute" }}
            onClick={handleNextImage}
            aria-label={t("accessibility.nextImage", "Next image")}
          >
            <KeyboardArrowLeft sx={{ color: theme.palette.background.light }} />
          </IconButton>
        )}

        <IconButton
          sx={{ top: 4, right: 4, position: "absolute" }}
          aria-label={t("accessibility.zoomImage", "Zoom image")}
        >
          <ZoomInRounded />
        </IconButton>
        <img
          // component="img"
          style={{
            display: "block",
            maxHeight: "100%",
            maxWidth: "100%",
            margin: "auto",
            objectFit: "contain",
          }}
          src={
            photos[imageIndex] ||
            "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
          }
          alt={t(
            "accessibility.galleryImage",
            "Gallery image {{index}} of {{total}}",
            {
              index: imageIndex + 1,
              total: photos.length,
            },
          )}
          loading="eager"
          onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src =
              "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
          }}
        />
      </Paper>
    </>
  )
}
