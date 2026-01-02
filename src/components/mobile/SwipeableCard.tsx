/**
 * SwipeableCard Component
 * A card that can be swiped left/right to reveal actions
 * Perfect for mobile interactions
 */

import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { ReactNode, useRef, useState } from "react"
import { useSwipeable } from "react-swipeable"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface SwipeableCardProps {
  children: ReactNode
  leftActions?: ReactNode
  rightActions?: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number // Distance in pixels to trigger action
  disabled?: boolean
  CardProps?: any
}

export function SwipeableCard({
  children,
  leftActions,
  rightActions,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  disabled = false,
  CardProps,
}: SwipeableCardProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (disabled || !isMobile) return
      setIsDragging(true)
      setTranslateX(eventData.deltaX)
    },
    onSwiped: (eventData) => {
      if (disabled || !isMobile) return
      setIsDragging(false)

      // Check if swipe distance exceeds threshold
      if (Math.abs(eventData.deltaX) >= threshold) {
        if (eventData.deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (eventData.deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      // Reset position
      setTranslateX(0)
    },
    onSwipedLeft: () => {
      if (disabled || !isMobile) return
      setTranslateX(0)
    },
    onSwipedRight: () => {
      if (disabled || !isMobile) return
      setTranslateX(0)
    },
    trackMouse: false, // Only track touch events
    preventScrollOnSwipe: true,
    trackTouch: true,
  })

  // Calculate action width
  const leftActionWidth = leftActions ? 80 : 0
  const rightActionWidth = rightActions ? 80 : 0

  // Clamp translateX to prevent over-swiping
  const clampedTranslateX = Math.max(
    -rightActionWidth,
    Math.min(leftActionWidth, translateX),
  )

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
      ref={cardRef}
    >
      {/* Left Actions (revealed when swiping right) */}
      {leftActions && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: leftActionWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: theme.palette.primary.main,
            zIndex: 1,
            transform: `translateX(${
              clampedTranslateX > 0
                ? clampedTranslateX - leftActionWidth
                : -leftActionWidth
            }px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
            px: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            {leftActions}
          </Stack>
        </Box>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: rightActionWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            backgroundColor: theme.palette.error.main,
            zIndex: 1,
            transform: `translateX(${
              clampedTranslateX < 0
                ? -clampedTranslateX - rightActionWidth
                : -rightActionWidth
            }px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
            px: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            {rightActions}
          </Stack>
        </Box>
      )}

      {/* Main Card */}
      <Card
        {...CardProps}
        {...(isMobile && !disabled ? handlers : {})}
        sx={{
          position: "relative",
          zIndex: 2,
          transform: `translateX(${clampedTranslateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          touchAction: "pan-y",
          userSelect: "none",
          ...CardProps?.sx,
        }}
      >
        {children}
      </Card>
    </Box>
  )
}
