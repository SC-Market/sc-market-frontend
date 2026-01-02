/**
 * MobileSidebarWrapper Component
 * Wraps sidebar content to show as BottomSheet on mobile, Drawer on desktop
 * Automatically handles responsive behavior
 */

import { Box, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material"
import React, { ReactNode } from "react"
import { CloseRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "./BottomSheet"

interface MobileSidebarWrapperProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  anchor?: "left" | "right" | "top" | "bottom"
  drawerWidth?: number | string
  showCloseButton?: boolean
}

export function MobileSidebarWrapper({
  open,
  onClose,
  children,
  title,
  anchor = "left",
  drawerWidth = 300,
  showCloseButton = true,
}: MobileSidebarWrapperProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        showCloseButton={showCloseButton}
        maxHeight="90vh"
      >
        {children}
      </BottomSheet>
    )
  }

  // On desktop, use Drawer
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
        },
      }}
    >
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: 1,
            borderColor: theme.palette.divider,
          }}
        >
          {showCloseButton && (
            <IconButton onClick={onClose} size="small">
              <CloseRounded />
            </IconButton>
          )}
        </Box>
      )}
      <Box sx={{ p: 2, overflow: "auto" }}>{children}</Box>
    </Drawer>
  )
}
