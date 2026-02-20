/**
 * Generic embed facade component for heavy third-party embeds.
 *
 * This component provides a lightweight placeholder that loads the actual
 * embed only when the user interacts with it, reducing initial page load.
 *
 * Requirements: 7.3 - Implement facade pattern for heavy embeds
 */

import React, { useState, ReactNode } from "react"
import { Box, Button, styled, Typography } from "@mui/material"
import { PlayArrow, Map, VideoLibrary } from "@mui/icons-material"

interface EmbedFacadeProps {
  /**
   * Content to render when activated (the actual embed)
   */
  children: ReactNode

  /**
   * Preview image URL
   */
  previewImage?: string

  /**
   * Title to display on the facade
   */
  title?: string

  /**
   * Description to display on the facade
   */
  description?: string

  /**
   * Type of embed (affects icon and styling)
   */
  type?: "video" | "map" | "generic"

  /**
   * Optional width
   */
  width?: string | number

  /**
   * Optional height
   */
  height?: string | number

  /**
   * Minimum height for the facade
   */
  minHeight?: string | number
}

const FacadeContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  minHeight: 300,
  backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.mode === "dark" ? "#252525" : "#eeeeee",
    borderColor: theme.palette.primary.main,
  },
}))

const PreviewImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.6,
})

const ContentOverlay = styled(Box)({
  position: "relative",
  zIndex: 1,
  textAlign: "center",
  padding: "24px",
})

const LoadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  minWidth: 150,
}))

const EmbedContainer = styled(Box)({
  width: "100%",
  height: "100%",
})

/**
 * Get icon based on embed type
 */
function getEmbedIcon(type: EmbedFacadeProps["type"]) {
  switch (type) {
    case "video":
      return <VideoLibrary sx={{ fontSize: 64 }} />
    case "map":
      return <Map sx={{ fontSize: 64 }} />
    default:
      return <PlayArrow sx={{ fontSize: 64 }} />
  }
}

/**
 * Generic embed facade component.
 *
 * Displays a lightweight placeholder with a load button. Only renders the
 * actual embed content when the user clicks to load.
 *
 * @example
 * <EmbedFacade
 *   type="map"
 *   title="Interactive Map"
 *   description="Click to load the interactive map"
 * >
 *   <iframe src="https://maps.example.com/embed" />
 * </EmbedFacade>
 */
export function EmbedFacade({
  children,
  previewImage,
  title,
  description,
  type = "generic",
  width,
  height,
  minHeight = 300,
}: EmbedFacadeProps) {
  const [isActivated, setIsActivated] = useState(false)

  const handleActivate = () => {
    setIsActivated(true)
  }

  if (isActivated) {
    // Render actual embed
    return <EmbedContainer sx={{ width, height }}>{children}</EmbedContainer>
  }

  // Show facade
  return (
    <FacadeContainer
      sx={{ width, height, minHeight }}
      onClick={handleActivate}
      role="button"
      aria-label={`Load ${type}: ${title || "content"}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleActivate()
        }
      }}
    >
      {previewImage && (
        <PreviewImage
          src={previewImage}
          alt={title || "Preview"}
          loading="lazy"
        />
      )}
      <ContentOverlay>
        {getEmbedIcon(type)}
        {title && (
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {title}
          </Typography>
        )}
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
        <LoadButton
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={handleActivate}
        >
          Load {type === "generic" ? "Content" : type}
        </LoadButton>
      </ContentOverlay>
    </FacadeContainer>
  )
}
