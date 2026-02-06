/**
 * BottomSheet Component
 * A mobile-friendly modal that slides up from the bottom
 * Better UX than full-screen modals on mobile devices
 * Supports swipe-down to dismiss gesture
 */

import {
  Box,
  IconButton,
  SwipeableDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { ReactNode, useState, useRef, useEffect } from "react"
import { CloseRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { haptic } from "../../util/haptics"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxHeight?: string | number
  showCloseButton?: boolean
  fullHeight?: boolean
  disableBackdropClose?: boolean
  snapPoints?: ("peek" | "half" | "66" | "75" | "full")[]
  defaultSnap?: "peek" | "half" | "66" | "75" | "full"
  peekHeight?: number
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = "90vh",
  showCloseButton = true,
  fullHeight = false,
  disableBackdropClose = false,
  snapPoints = ["full"],
  defaultSnap = "full",
  peekHeight = 120,
}: BottomSheetProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [currentSnap, setCurrentSnap] = useState<"peek" | "half" | "66" | "75" | "full">(
    defaultSnap,
  )
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number | null>(null)
  const dragStartHeight = useRef<number>(0)

  // Reset snap when sheet opens
  useEffect(() => {
    if (open) {
      setCurrentSnap(defaultSnap)
      setDragOffset(0)
    }
  }, [open, defaultSnap])

  const getSnapHeight = (snap: "peek" | "half" | "66" | "75" | "full") => {
    if (snap === "peek") return peekHeight
    if (snap === "half") return window.innerHeight * 0.5
    if (snap === "66") return window.innerHeight * 0.66
    if (snap === "75") return window.innerHeight * 0.75
    
    if (typeof maxHeight === "string" && maxHeight.endsWith("vh")) {
      const percentage = parseInt(maxHeight) / 100
      return window.innerHeight * percentage
    }
    if (typeof maxHeight === "number") {
      return maxHeight
    }
    return fullHeight ? window.innerHeight : window.innerHeight * 0.9
  }

  const currentHeight = getSnapHeight(currentSnap)

  const findClosestSnap = (height: number): typeof currentSnap => {
    const snapHeights = snapPoints.map(snap => ({
      snap,
      height: getSnapHeight(snap),
    }))

    return snapHeights.reduce((closest, current) => {
      const closestDiff = Math.abs(closest.height - height)
      const currentDiff = Math.abs(current.height - height)
      return currentDiff < closestDiff ? current : closest
    }).snap
  }

  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    dragStartY.current = clientY
    dragStartHeight.current = currentHeight
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging || dragStartY.current === null) return

    const deltaY = dragStartY.current - clientY
    const newHeight = dragStartHeight.current + deltaY

    // Constrain between peek and full
    const minHeight = getSnapHeight("peek")
    const maxHeight = getSnapHeight("full")
    const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    setDragOffset(constrainedHeight - currentHeight)
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    const finalHeight = currentHeight + dragOffset
    const closestSnap = findClosestSnap(finalHeight)

    // If dragged down significantly from peek, close
    if (closestSnap === "peek" && dragOffset < -50) {
      haptic.light()
      onClose()
    } else {
      // Snap to closest point
      if (closestSnap !== currentSnap) {
        haptic.selection()
      }
      setCurrentSnap(closestSnap)
    }

    setIsDragging(false)
    setDragOffset(0)
    dragStartY.current = null
  }

  const handlePullerTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }

  const handlePullerTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }

  const handlePullerTouchEnd = () => {
    handleDragEnd()
  }

  const handleOpen = () => {
    haptic.light()
  }

  const handleClose = () => {
    haptic.light()
    onClose()
  }

  const displayHeight = isDragging ? currentHeight + dragOffset : currentHeight

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      onOpen={handleOpen}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          height: displayHeight,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : 0,
          transition: isDragging ? "none" : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
      ModalProps={{
        keepMounted: true,
        sx: {
          zIndex: theme.zIndex.modal + 10,
        },
        slotProps: {
          backdrop: {
            sx: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            onClick: disableBackdropClose ? undefined : onClose,
          },
        },
      }}
    >
      {/* Puller - draggable handle */}
      <Box
        onTouchStart={handlePullerTouchStart}
        onTouchMove={handlePullerTouchMove}
        onTouchEnd={handlePullerTouchEnd}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          pt: 1,
          pb: 0.5,
          cursor: "grab",
          touchAction: "none",
          "&:active": {
            cursor: "grabbing",
          },
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 6,
            backgroundColor: theme.palette.action.active,
            borderRadius: 3,
            opacity: 0.4,
          }}
        />
      </Box>

      {/* Header */}
      {(title || showCloseButton) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: 1,
            pb: title ? 1 : 0,
            borderBottom: title ? 1 : 0,
            borderColor: theme.palette.divider,
          }}
        >
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          )}
          {showCloseButton && (
            <IconButton
              onClick={() => {
                haptic.light()
                onClose()
              }}
              size="small"
              sx={{ ml: title ? "auto" : 0 }}
            >
              <CloseRounded />
            </IconButton>
          )}
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 2,
          py: 2,
          minHeight: 0,
        }}
      >
        {children}
      </Box>
    </SwipeableDrawer>
  )
}
