/**
 * AccessibleDialog Component
 *
 * An accessible dialog wrapper that provides proper ARIA attributes,
 * focus management, and keyboard navigation support.
 *
 * Features:
 * - Focus trapping within the dialog
 * - Escape key handling for closing
 * - Focus restoration when closed
 * - Proper ARIA attributes (role, aria-labelledby, aria-describedby, aria-modal)
 * - Initial focus management
 *
 * Requirements: 1.5, 1.6, 5.1, 5.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9
 */

import React, { useRef, useEffect, useId, RefObject, ReactNode } from "react"
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { useFocusTrap } from "./useFocusTrap"

export interface AccessibleDialogProps extends Omit<
  DialogProps,
  "aria-labelledby" | "aria-describedby" | "aria-modal"
> {
  /**
   * Whether the dialog is open
   */
  open: boolean

  /**
   * Callback fired when the dialog should close
   */
  onClose: () => void

  /**
   * The title of the dialog (required for accessibility)
   */
  title: string

  /**
   * Optional description for the dialog
   */
  description?: string

  /**
   * The content of the dialog
   */
  children: ReactNode

  /**
   * Optional ref to the element that should receive initial focus
   */
  initialFocus?: RefObject<HTMLElement | null>

  /**
   * Dialog size
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"

  /**
   * Optional actions to display at the bottom of the dialog
   */
  actions?: ReactNode

  /**
   * Whether to show the title
   * @default true
   */
  showTitle?: boolean
}

/**
 * AccessibleDialog provides an accessible dialog implementation with proper
 * ARIA attributes, focus management, and keyboard navigation.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [open, setOpen] = useState(false)
 *   const submitButtonRef = useRef<HTMLButtonElement>(null)
 *
 *   return (
 *     <AccessibleDialog
 *       open={open}
 *       onClose={() => setOpen(false)}
 *       title="Confirm Action"
 *       description="Are you sure you want to proceed?"
 *       initialFocus={submitButtonRef}
 *       actions={
 *         <>
 *           <Button onClick={() => setOpen(false)}>Cancel</Button>
 *           <Button ref={submitButtonRef} onClick={handleSubmit}>Submit</Button>
 *         </>
 *       }
 *     >
 *       <Typography>Dialog content goes here</Typography>
 *     </AccessibleDialog>
 *   )
 * }
 * ```
 */
export function AccessibleDialog({
  open,
  onClose,
  title,
  description,
  children,
  initialFocus,
  size = "md",
  actions,
  showTitle = true,
  ...dialogProps
}: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  // Enable focus trap when dialog is open
  useFocusTrap(dialogRef, {
    enabled: open,
    initialFocus,
    returnFocus: true,
  })

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!open) {
      return
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  return (
    <Dialog
      {...dialogProps}
      open={open}
      onClose={onClose}
      maxWidth={size}
      fullWidth
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-modal="true"
      ref={dialogRef}
      // Prevent closing on backdrop click if onClose is provided
      // This ensures users must use explicit close actions
      disableEscapeKeyDown={false}
    >
      {showTitle && <DialogTitle id={titleId}>{title}</DialogTitle>}

      <DialogContent>
        {description && (
          <div id={descId} style={{ marginBottom: "1rem" }}>
            {description}
          </div>
        )}
        {children}
      </DialogContent>

      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
