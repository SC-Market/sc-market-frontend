import React, { useState, useRef, useCallback, ReactNode } from "react"
import { useHapticFeedback } from "../../hooks/gestures/useHapticFeedback"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/BoxProps';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';

export interface SwipeableItemProps {
  /**
   * Content to display (the main item)
   */
  children: ReactNode
  /**
   * Action to perform on swipe left
   */
  onSwipeLeft?: () => void
  /**
   * Action to perform on swipe right
   */
  onSwipeRight?: () => void
  /**
   * Left action content (shown when swiped right)
   */
  leftAction?: ReactNode
  /**
   * Right action content (shown when swiped left)
   */
  rightAction?: ReactNode
  /**
   * Distance in pixels to swipe before triggering action
   * Default: 100
   */
  threshold?: number
  /**
   * Whether to enable haptic feedback
   * Default: true
   */
  hapticFeedback?: boolean
  /**
   * Whether swipe is enabled
   * Default: true
   */
  enabled?: boolean
  /**
   * Whether to show default actions (delete, favorite)
   * Default: false (use custom leftAction/rightAction)
   */
  showDefaultActions?: boolean
  /**
   * Callback when swipe action is triggered
   */
  onSwipeAction?: (direction: "left" | "right") => void
}

/**
 * Swipeable item component with left/right swipe actions
 *
 * Supports custom actions or default delete/favorite actions.
 * Provides visual feedback during swipe and haptic feedback on trigger.
 *
 * @example
 * ```tsx
 * <SwipeableItem
 *   onSwipeLeft={() => handleDelete(item.id)}
 *   onSwipeRight={() => handleFavorite(item.id)}
 *   leftAction={<IconButton><FavoriteRounded /></IconButton>}
 *   rightAction={<IconButton><DeleteRounded /></IconButton>}
 * >
 *   <ListItem>
 *     <ListItemText primary={item.name} />
 *   </ListItem>
 * </SwipeableItem>
 * ```
 */
export function SwipeableItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  hapticFeedback = true,
  enabled = true,
  showDefaultActions = false,
  onSwipeAction,
}: SwipeableItemProps) {
  const theme = useTheme<ExtendedTheme>()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startX = useRef<number | null>(null)
  const currentX = useRef<number | null>(null)
  const hasTriggeredHaptic = useRef(false)
  const { trigger: triggerHaptic } = useHapticFeedback()

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return
      startX.current = e.touches[0].clientX
      currentX.current = startX.current
      setIsSwiping(true)
      hasTriggeredHaptic.current = false
    },
    [enabled],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || startX.current === null || !isSwiping) return

      currentX.current = e.touches[0].clientX
      const deltaX = currentX.current - startX.current

      // Limit swipe distance
      const maxSwipe = threshold * 1.5
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
      setSwipeOffset(clampedDelta)

      // Trigger haptic feedback when threshold is crossed
      if (hapticFeedback && !hasTriggeredHaptic.current) {
        if (Math.abs(clampedDelta) >= threshold) {
          triggerHaptic("light")
          hasTriggeredHaptic.current = true
        }
      }
    },
    [enabled, isSwiping, threshold, hapticFeedback, triggerHaptic],
  )

  const handleTouchEnd = useCallback(() => {
    if (!enabled || startX.current === null) {
      startX.current = null
      currentX.current = null
      setIsSwiping(false)
      return
    }

    const finalOffset = swipeOffset
    const absOffset = Math.abs(finalOffset)

    if (absOffset >= threshold) {
      // Trigger action
      if (finalOffset > 0 && onSwipeRight) {
        onSwipeRight()
        onSwipeAction?.("right")
      } else if (finalOffset < 0 && onSwipeLeft) {
        onSwipeLeft()
        onSwipeAction?.("left")
      }

      // Trigger haptic feedback
      if (hapticFeedback) {
        triggerHaptic("medium")
      }
    }

    // Reset
    setSwipeOffset(0)
    setIsSwiping(false)
    startX.current = null
    currentX.current = null
    hasTriggeredHaptic.current = false
  }, [
    enabled,
    swipeOffset,
    threshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeAction,
    hapticFeedback,
    triggerHaptic,
  ])

  // Determine which action to show
  const showLeftAction = swipeOffset > 0 && (onSwipeRight || showDefaultActions)
  const showRightAction = swipeOffset < 0 && (onSwipeLeft || showDefaultActions)

  // Default actions
  const defaultLeftAction =
    showDefaultActions && onSwipeRight ? (
      <IconButton
        onClick={(e) => {
          e.stopPropagation()
          onSwipeRight()
        }}
        sx={{
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.success.dark,
          },
        }}
      >
        <FavoriteRounded />
      </IconButton>
    ) : null

  const defaultRightAction =
    showDefaultActions && onSwipeLeft ? (
      <IconButton
        onClick={(e) => {
          e.stopPropagation()
          onSwipeLeft()
        }}
        sx={{
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.error.dark,
          },
        }}
      >
        <DeleteRounded />
      </IconButton>
    ) : null

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y", // Allow vertical scrolling
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left action (swipe right) */}
      {showLeftAction && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: 2,
            zIndex: 1,
            width: Math.min(threshold, Math.abs(swipeOffset)),
            opacity: Math.min(1, Math.abs(swipeOffset) / threshold),
          }}
        >
          {leftAction || defaultLeftAction}
        </Box>
      )}

      {/* Right action (swipe left) */}
      {showRightAction && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 2,
            zIndex: 1,
            width: Math.min(threshold, Math.abs(swipeOffset)),
            opacity: Math.min(1, Math.abs(swipeOffset) / threshold),
          }}
        >
          {rightAction || defaultRightAction}
        </Box>
      )}

      {/* Main content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
