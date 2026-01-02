import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  Box,
  Modal,
  useMediaQuery,
  IconButton,
  Typography,
  Paper,
} from "@mui/material"
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Close as CloseIcon,
} from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../mobile/BottomSheet"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { ImageZoomPan } from "../animations/ImageZoomPan"

export function ImagePreviewModal(props: {
  images: string[]
  open: boolean
  onClose: () => void
  index?: number
  enableZoom?: boolean
  showThumbnails?: boolean
}) {
  const {
    images,
    open,
    onClose,
    index: initialIndex,
    enableZoom = true,
    showThumbnails = true,
  } = props
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0)

  // Update current index when initialIndex changes
  useEffect(() => {
    if (initialIndex !== undefined) {
      setCurrentIndex(initialIndex)
    }
  }, [initialIndex])

  // Reset to first image when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentIndex(0)
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, currentIndex, images.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }, [images.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }, [images.length])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Use BottomSheet on mobile, Modal on desktop
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        fullHeight
        aria-labelledby="image-preview-title"
        aria-describedby="image-preview-description"
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
                onClose={onClose}
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
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                  }}
                  aria-label={t(
                    "accessibility.previousImage",
                    "Previous image",
                  )}
                >
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                  }}
                  aria-label={t("accessibility.nextImage", "Next image")}
                >
                  <KeyboardArrowRight />
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
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
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
                    alt={`Thumbnail ${idx + 1}`}
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
      aria-labelledby="image-preview-title"
      aria-describedby="image-preview-description"
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "90vw",
          maxHeight: "90vh",
          backgroundColor: "background.paper",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
          }}
          aria-label={t("accessibility.close", "Close")}
        >
          <CloseIcon />
        </IconButton>

        {/* Main Image Container */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 400,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
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
                objectFit: "contain",
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
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                }}
                aria-label={t("accessibility.previousImage", "Previous image")}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                }}
                aria-label={t("accessibility.nextImage", "Next image")}
              >
                <KeyboardArrowRight />
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
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
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
              backgroundColor: "background.paper",
            }}
          >
            {images.map((image, idx) => (
              <Paper
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                sx={{
                  minWidth: 80,
                  height: 80,
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
                  alt={`Thumbnail ${idx + 1}`}
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
      </Box>
    </Modal>
  )
}
