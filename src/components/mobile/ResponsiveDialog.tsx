/**
 * ResponsiveDialog Component
 *
 * A responsive dialog that uses:
 * - Dialog on desktop/tablet
 * - BottomSheet on mobile
 *
 * This provides a better mobile UX while maintaining familiar desktop patterns.
 */

import React, { ReactNode } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Typography,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { CloseRounded } from "@mui/icons-material"
import { BottomSheet } from "./BottomSheet"
import { useTranslation } from "react-i18next"

interface ResponsiveDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false
  fullWidth?: boolean
  fullHeight?: boolean
  disableBackdropClose?: boolean
}

/**
 * ResponsiveDialog
 *
 * Automatically switches between Dialog (desktop) and BottomSheet (mobile)
 * based on screen size.
 */
export function ResponsiveDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullHeight = false,
  disableBackdropClose = false,
}: ResponsiveDialogProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  // Mobile: Use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        fullHeight={fullHeight}
        disableBackdropClose={disableBackdropClose}
        showCloseButton={false} // We'll add our own in the title
      >
        {/* Custom header with close button */}
        {title && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              pb: 1,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <IconButton aria-label={t("ui.close", "Close")} onClick={onClose} size="small">
              <CloseRounded />
            </IconButton>
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", mb: actions ? 2 : 0 }}>
          {children}
        </Box>

        {/* Actions */}
        {actions && (
          <Box
            sx={{
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            {actions}
          </Box>
        )}
      </BottomSheet>
    )
  }

  // Desktop: Use Dialog
  return (
    <Dialog
      open={open}
      onClose={disableBackdropClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
