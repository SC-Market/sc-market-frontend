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
  const [currentSnap, setCurrentSnap] = useState<"peek" | "half" | "66" | "75" | "full">(
    defaultSnap,
  )

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

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          height: currentHeight,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : 0,
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
      {/* Puller */}
      <Box
        sx={{
          width: 30,
          height: 6,
          backgroundColor: theme.palette.action.active,
          borderRadius: 3,
          position: "absolute",
          top: 8,
          left: "calc(50% - 15px)",
          opacity: 0.4,
        }}
      />

      {/* Header */}
      {(title || showCloseButton) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: 3,
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
        }}
      >
        {children}
      </Box>
    </SwipeableDrawer>
  )
}
