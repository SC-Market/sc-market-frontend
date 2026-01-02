/**
 * ImageZoomPan Component
 * Provides zoom and pan functionality for product images
 * Touch-friendly for mobile, mouse-friendly for desktop
 * Performance-conscious using CSS transforms
 */

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material"
import { ZoomIn, ZoomOut, FitScreen, Close } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface ImageZoomPanProps {
  src: string
  alt?: string
  maxZoom?: number
  minZoom?: number
  onClose?: () => void
  sx?: any
}

export function ImageZoomPan({
  src,
  alt = "",
  maxZoom = 3,
  minZoom = 1,
  onClose,
  sx,
}: ImageZoomPanProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastTouchDistance, setLastTouchDistance] = useState(0)

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [src])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, maxZoom))
  }, [maxZoom])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, minZoom)
      if (newZoom === minZoom) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }, [minZoom])

  const handleReset = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    },
    [zoom, position],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || zoom <= 1) return
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart, zoom],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers for pinch zoom and pan
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        )
        setLastTouchDistance(distance)
      } else if (e.touches.length === 1 && zoom > 1) {
        // Pan
        setIsDragging(true)
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        })
      }
    },
    [zoom, position],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        )
        if (lastTouchDistance > 0) {
          const scale = distance / lastTouchDistance
          setZoom((prev) => {
            const newZoom = prev * scale
            return Math.max(minZoom, Math.min(newZoom, maxZoom))
          })
        }
        setLastTouchDistance(distance)
      } else if (e.touches.length === 1 && isDragging && zoom > 1) {
        // Pan
        setPosition({
          x: e.touches[0].clientX - dragStart.x,
          y: e.touches[0].clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart, zoom, lastTouchDistance, minZoom, maxZoom],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setLastTouchDistance(0)
  }, [])

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom((prev) => {
          const newZoom = prev + delta
          return Math.max(minZoom, Math.min(newZoom, maxZoom))
        })
      }
    },
    [minZoom, maxZoom],
  )

  // Global mouse move/up listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction: "none",
        ...sx,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <Box
        ref={imageRef}
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
          willChange: "transform",
          userSelect: "none",
        }}
        draggable={false}
      />

      {/* Zoom Controls */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: 1,
          p: 0.5,
        }}
      >
        <IconButton
          size="small"
          onClick={handleZoomIn}
          disabled={zoom >= maxZoom}
          sx={{ color: "white" }}
          aria-label="Zoom in"
        >
          <ZoomIn />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={zoom <= minZoom}
          sx={{ color: "white" }}
          aria-label="Zoom out"
        >
          <ZoomOut />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleReset}
          disabled={zoom === 1}
          sx={{ color: "white" }}
          aria-label="Reset zoom"
        >
          <FitScreen />
        </IconButton>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "white" }}
            aria-label="Close"
          >
            <Close />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}
