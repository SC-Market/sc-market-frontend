/**
 * YouTube embed facade component that loads the actual player only on user interaction.
 *
 * This component displays a lightweight preview image with a play button overlay.
 * The actual YouTube player is only loaded when the user clicks to play,
 * significantly reducing initial page load time and bandwidth usage.
 *
 * Requirements: 7.3 - Implement facade pattern for heavy embeds
 */

import React, { useState } from "react"
import { Box, IconButton, styled } from "@mui/material"
import { PlayArrow } from "@mui/icons-material"

interface YouTubeFacadeProps {
  /**
   * YouTube video ID (e.g., "dQw4w9WgXcQ")
   */
  videoId: string

  /**
   * Optional title for accessibility
   */
  title?: string

  /**
   * Optional width (default: 100%)
   */
  width?: string | number

  /**
   * Optional height (default: auto with 16:9 aspect ratio)
   */
  height?: string | number
}

const FacadeContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  paddingBottom: "56.25%", // 16:9 aspect ratio
  backgroundColor: "#000",
  cursor: "pointer",
  overflow: "hidden",
  "&:hover .play-button": {
    transform: "scale(1.1)",
    backgroundColor: "rgba(255, 0, 0, 0.9)",
  },
}))

const ThumbnailImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
})

const PlayButtonOverlay = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 1,
})

const PlayButton = styled(IconButton)(({ theme }) => ({
  width: 68,
  height: 48,
  backgroundColor: "rgba(255, 0, 0, 0.8)",
  borderRadius: "12px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 0, 0, 0.9)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 48,
    color: "#fff",
  },
}))

const IframeContainer = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
})

/**
 * YouTube embed facade component.
 *
 * Displays a lightweight thumbnail with play button. Only loads the actual
 * YouTube iframe when the user clicks to play.
 *
 * @example
 * <YouTubeFacade videoId="dQw4w9WgXcQ" title="Never Gonna Give You Up" />
 */
export function YouTubeFacade({
  videoId,
  title,
  width,
  height,
}: YouTubeFacadeProps) {
  const [isActivated, setIsActivated] = useState(false)

  const handleActivate = () => {
    setIsActivated(true)
  }

  // YouTube thumbnail URL (maxresdefault for highest quality, fallback to hqdefault)
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`

  if (isActivated) {
    // Load actual YouTube iframe
    return (
      <FacadeContainer sx={{ width, height: height || undefined }}>
        <IframeContainer>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title || "YouTube video player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </IframeContainer>
      </FacadeContainer>
    )
  }

  // Show facade with thumbnail and play button
  return (
    <FacadeContainer
      sx={{ width, height: height || undefined }}
      onClick={handleActivate}
      role="button"
      aria-label={`Play video: ${title || videoId}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleActivate()
        }
      }}
    >
      <ThumbnailImage
        src={thumbnailUrl}
        alt={title || "YouTube video thumbnail"}
        loading="lazy"
        onError={(e) => {
          // Fallback to hqdefault if maxresdefault fails
          const target = e.target as HTMLImageElement
          if (target.src.includes("maxresdefault")) {
            target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          }
        }}
      />
      <PlayButtonOverlay>
        <PlayButton className="play-button" aria-label="Play video">
          <PlayArrow />
        </PlayButton>
      </PlayButtonOverlay>
    </FacadeContainer>
  )
}
