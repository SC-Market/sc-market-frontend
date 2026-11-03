/**
 * A form dialog that is a full-screen sheet on phones: a title with a close
 * button, scrolling content, and its own action bar that stays on screen
 * (actions stack on phones, the primary one on top when it comes last).
 */
import React, { useId } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
} from "@mui/material"
import { CloseRounded } from "@mui/icons-material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"

export interface ResponsiveDialogProps {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  /** Accessible name of the close button */
  closeLabel: string
  children: React.ReactNode
  /** Buttons for the action bar, primary last */
  actions?: React.ReactNode
  maxWidth?: "xs" | "sm" | "md"
  /** Full screen on phones (default); off for short prompts */
  fullScreenOnMobile?: boolean
  /** Dividers around the content, for long forms */
  dividers?: boolean
}

export function ResponsiveDialog({
  open,
  onClose,
  title,
  closeLabel,
  children,
  actions,
  maxWidth = "sm",
  fullScreenOnMobile = true,
  dividers = false,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile()
  const titleId = useId()
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreenOnMobile && isMobile}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId} sx={{ pr: 6 }} color="text.secondary" fontWeight={700}>
        {title}
        <IconButton aria-label={closeLabel} onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers={dividers}>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Stack
            direction={isMobile ? "column-reverse" : "row"}
            gap={1}
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            {actions}
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  )
}
