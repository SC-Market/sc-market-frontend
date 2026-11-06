/**
 * MobileSidebarWrapper Component
 * Wraps sidebar content to show as BottomSheet on mobile, Drawer on desktop
 * Automatically handles responsive behavior
 */

import { Box, Drawer, IconButton, Typography, useTheme } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import React, { ReactNode } from "react"
import { CloseRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "./BottomSheet"
import { useTranslation } from "react-i18next"

interface MobileSidebarWrapperProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Header title; also the panel's accessible name */
  title?: string
  anchor?: "left" | "right" | "top" | "bottom"
  /** Desktop drawer width (capped at 90vw) */
  drawerWidth?: number | string
  showCloseButton?: boolean
  /** Desktop content padding (theme spacing units) */
  contentPadding?: number
}

export function MobileSidebarWrapper({
  open,
  onClose,
  children,
  title,
  anchor = "left",
  drawerWidth = 300,
  showCloseButton = true,
  contentPadding = 2,
}: MobileSidebarWrapperProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()

  // On mobile, use BottomSheet with swipe-down to dismiss
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

  // On desktop, use a temporary Drawer (modal: focus trap, Escape closes)
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        role: "dialog",
        "aria-label": title,
        sx: {
          width: drawerWidth,
          maxWidth: "90vw",
        },
      }}
    >
      {(title || showCloseButton) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            p: 2,
            borderBottom: theme.borderWidth.hairline,
            borderColor: theme.palette.divider,
          }}
        >
          {title && (
            <Typography variant="h6" fontWeight="bold" component="h2">
              {title}
            </Typography>
          )}
          {showCloseButton && (
            <IconButton
              aria-label={t("ui.close", "Close")}
              onClick={onClose}
              size="small"
              sx={{ ml: "auto" }}
            >
              <CloseRounded />
            </IconButton>
          )}
        </Box>
      )}
      <Box sx={{ p: contentPadding, overflow: "auto" }}>{children}</Box>
    </Drawer>
  )
}
