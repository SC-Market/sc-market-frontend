/**
 * BottomSheet Component
 * A mobile-friendly modal that slides up from the bottom
 * Better UX than full-screen modals on mobile devices
 * Supports swipe-down to dismiss gesture
 */

import {
  Box,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { ReactNode, useRef, useState } from "react"
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
}: BottomSheetProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

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
      // Threshold to close
      onClose()
    }
    setDragStart(null)
    setDragOffset(0)
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={disableBackdropClose ? undefined : onClose}
      PaperProps={{
        sx: {
          maxHeight: fullHeight ? "100vh" : maxHeight,
          height: fullHeight ? "100vh" : "auto",
          display: "flex",
          flexDirection: "column",
          borderTopLeftRadius: theme.spacing(3),
          borderTopRightRadius: theme.spacing(3),
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : 0,
          overflow: "hidden",
        },
        style: {
          transform: `translateY(${dragOffset}px)`,
          transition: dragStart === null ? "transform 0.2s ease-out" : "none",
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
      }}
    >
      {/* Drag handle indicator */}
      {isMobile && (
        <Box
          ref={dragHandleRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 1.5,
            pb: 0.5,
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.palette.divider,
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
