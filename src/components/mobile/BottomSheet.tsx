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
import React, { ReactNode, useState } from "react"
import { CloseRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  const [currentSnap, setCurrentSnap] = useState<"peek" | "half" | "66" | "75" | "full">(
    defaultSnap,
  )

  const getSnapHeight = (snap: "peek" | "half" | "66" | "75" | "full") => {
    if (snap === "peek") return peekHeight
    if (snap === "half") return window.innerHeight * 0.5
    if (snap === "66") return window.innerHeight * 0.66
    if (snap === "75") return window.innerHeight * 0.75
    
    // For full snap, use maxHeight if provided, otherwise use fullHeight or 90%
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

  // Don't render anything when closed to prevent backdrop from blocking interaction
  if (!open) {
    return null
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === null) return
    const currentY = e.touches[0].clientY
    const offset = currentY - dragStart
    // Only allow dragging down
    if (offset > 0) {
      setDragOffset(offset)
    }
  }

  const handleTouchEnd = () => {
    if (dragOffset > 100) {
      // Snap to next lower snap point or close
      const currentIndex = snapPoints.indexOf(currentSnap)
      if (currentIndex > 0) {
        setCurrentSnap(snapPoints[currentIndex - 1])
      } else if (currentSnap === "peek") {
        onClose()
      } else {
        onClose()
      }
    } else if (dragOffset < -100) {
      // Snap to next higher snap point
      const currentIndex = snapPoints.indexOf(currentSnap)
      if (currentIndex < snapPoints.length - 1) {
        setCurrentSnap(snapPoints[currentIndex + 1])
      }
    }
    setDragStart(null)
    setDragOffset(0)
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={disableBackdropClose ? undefined : onClose}
      SlideProps={{
        timeout: 300,
      }}
      transitionDuration={300}
      PaperProps={{
        sx: {
          height: currentHeight,
          display: "flex",
          flexDirection: "column",
          borderTopLeftRadius: theme.spacing(2),
          borderTopRightRadius: theme.spacing(2),
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : 0,
          overflow: "hidden",
        },
        style: {
          transform: `translateY(${dragOffset}px)`,
          transition: dragStart === null ? "transform 0.3s ease-out" : "none",
        },
      }}
      ModalProps={{
        keepMounted: false,
        disableAutoFocus: false,
        disableEnforceFocus: false,
        disableRestoreFocus: false,
        sx: {
          zIndex: open ? theme.zIndex.modal + 10 : undefined,
        },
        slotProps: {
          backdrop: {
            sx: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      }}
    >
      {/* Drag handle indicator - more prominent */}
      {isMobile && (
        <Box
          ref={dragHandleRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pt: 1.5,
            pb: 1,
            cursor: "grab",
            touchAction: "none",
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 5,
              borderRadius: 2.5,
              backgroundColor: theme.palette.action.active,
              opacity: 0.4,
            }}
          />
        </Box>
      )}

      {/* Header */}
      {(title || showCloseButton) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
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
              onClick={onClose}
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
          paddingBottom: isMobile
            ? `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`
            : theme.spacing(2),
        }}
      >
        {children}
      </Box>
    </Drawer>
  )
}
