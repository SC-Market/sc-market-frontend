import { Box, IconButton, Typography, Paper } from "@mui/material"
import {
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
} from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../mobile/BottomSheet"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ImageZoomPan } from "../animations/ImageZoomPan"

/** ImagePreviewModal on mobile: a full-height bottom sheet. */
export function ImagePreviewSheet({
  images,
  open,
  onClose,
  currentIndex,
  enableZoom,
  showThumbnails,
  handlePrevious,
  handleNext,
  handleThumbnailClick,
}: {
  images: string[]
  open: boolean
  onClose: () => void
  currentIndex: number
  enableZoom: boolean
  showThumbnails: boolean
  handlePrevious: () => void
  handleNext: () => void
  handleThumbnailClick: (index: number) => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      fullHeight
      ariaLabelledBy="image-preview-title"
      ariaDescribedBy="image-preview-description"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        {/* Image Container */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 2,
          }}
        >
          {enableZoom ? (
            <ImageZoomPan
              src={images[currentIndex]}
              alt={t(
                "accessibility.imagePreview",
                "Image preview {{index}} of {{total}}",
                {
                  index: currentIndex + 1,
                  total: images.length,
                },
              )}
              sx={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Box
              component="img"
              src={images[currentIndex]}
              alt={t(
                "accessibility.imagePreview",
                "Image preview {{index}} of {{total}}",
                {
                  index: currentIndex + 1,
                  total: images.length,
                },
              )}
              sx={{
                maxHeight: "80vh",
                maxWidth: "100%",
                borderRadius: 1,
              }}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null
                currentTarget.src =
                  "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
              }}
            />
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: theme.palette.background.overlay,
                  color: theme.palette.common.white,
                  "&:hover": {
                    backgroundColor: theme.palette.background.overlayDark,
                  },
                }}
                aria-label={t("accessibility.previousImage", "Previous image")}
              >
                <KeyboardArrowLeftRounded />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: theme.palette.background.overlay,
                  color: theme.palette.common.white,
                  "&:hover": {
                    backgroundColor: theme.palette.background.overlayDark,
                  },
                }}
                aria-label={t("accessibility.nextImage", "Next image")}
              >
                <KeyboardArrowRightRounded />
              </IconButton>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <Typography
              variant="body2"
              sx={{
                position: "absolute",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: theme.palette.background.overlay,
                color: theme.palette.common.white,
                px: 2,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {currentIndex + 1} / {images.length}
            </Typography>
          )}
        </Box>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              p: 2,
              overflowX: "auto",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {images.map((image, idx) => (
              <Paper
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                sx={{
                  minWidth: 60,
                  height: 60,
                  cursor: "pointer",
                  border: currentIndex === idx ? 2 : 0,
                  borderColor: "primary.main",
                  opacity: currentIndex === idx ? 1 : 0.6,
                  transition: "opacity 0.2s",
                  "&:hover": { opacity: 1 },
                }}
              >
                <Box
                  component="img"
                  src={image}
                  alt={t("appUi.imagePreview.thumbnailAlt", {
                    index: idx + 1,
                  })}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null
                    currentTarget.src =
                      "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
                  }}
                />
              </Paper>
            ))}
          </Box>
        )}
      </Box>
      <div id="image-preview-title" className="sr-only">
        {t("accessibility.imageModalTitle", "Image Preview")}
      </div>
      <div id="image-preview-description" className="sr-only">
        {t(
          "accessibility.imageModalDescription",
          "Viewing image {{index}} of {{total}}. Press Escape to close.",
          {
            index: currentIndex + 1,
            total: images.length,
          },
        )}
      </div>
    </BottomSheet>
  )
}
