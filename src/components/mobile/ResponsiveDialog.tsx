/**
 * ResponsiveDialog Component
 * Automatically uses BottomSheet on mobile, Dialog on desktop
 * Drop-in replacement for Dialog component
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import React, { ReactNode } from "react"
import { BottomSheet } from "./BottomSheet"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface ResponsiveDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false
  fullWidth?: boolean
  fullHeight?: boolean
}

export function ResponsiveDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = false,
  fullHeight = false,
}: ResponsiveDialogProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        maxHeight={fullHeight ? "100vh" : "90vh"}
        fullHeight={fullHeight}
      >
        {children}
        {actions && <Box sx={{ mt: 2 }}>{actions}</Box>}
      </BottomSheet>
    )
  }

  // On desktop, use Dialog
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
