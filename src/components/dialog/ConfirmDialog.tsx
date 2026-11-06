/**
 * A yes/no prompt on ResponsiveDialog: a title, a message, Cancel and a
 * confirm button. `destructive` paints the confirm button in the error
 * colour; `loading` shows progress on it and keeps the dialog open
 * (Escape, backdrop, close and Cancel do nothing) until the work finishes.
 * Extra content (a reason field, a typed confirmation) goes in `children`.
 */
import React from "react"
import { Button, type ButtonProps } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  ResponsiveDialog,
  type ResponsiveDialogProps,
} from "./ResponsiveDialog"

export interface ConfirmDialogProps extends Pick<
  ResponsiveDialogProps,
  "open" | "onClose" | "maxWidth" | "mobile" | "stackAbove" | "onExited"
> {
  title: React.ReactNode
  /** The question or consequence; announced as the dialog's description */
  message?: React.ReactNode
  onConfirm: () => void
  confirmLabel: React.ReactNode
  /** Default "Cancel" */
  cancelLabel?: React.ReactNode
  /** Error colour on the confirm button (delete, revoke, remove) */
  destructive?: boolean
  /** Other confirm colours (e.g. "warning" for a transfer) */
  confirmColor?: ButtonProps["color"]
  /** Work in flight: progress on the confirm button, nothing closes */
  loading?: boolean
  /** Confirm stays disabled (e.g. a required reason is empty) */
  confirmDisabled?: boolean
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel,
  cancelLabel,
  destructive = false,
  confirmColor,
  loading = false,
  confirmDisabled = false,
  maxWidth = "xs",
  mobile,
  stackAbove,
  onExited,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      maxWidth={maxWidth}
      mobile={mobile}
      stackAbove={stackAbove}
      onExited={onExited}
      disableClose={loading}
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            {cancelLabel ?? t("ui.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            color={confirmColor ?? (destructive ? "error" : "primary")}
            onClick={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </ResponsiveDialog>
  )
}
