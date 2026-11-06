/**
 * The app's shared dialog. A centred dialog on desktop; on phones (below
 * `md`, `useIsMobile`) it becomes a bottom sheet, a full-screen sheet for
 * long forms, or stays a centred dialog (`mobile`).
 *
 * It owns the parts every dialog needs: a title with a close button wired to
 * `aria-labelledby`, an optional description wired to `aria-describedby`,
 * scrolling content, and an action bar that stays on screen (actions stack
 * on phones, the primary one on top when it comes last). MUI's modal gives
 * the focus trap, Escape and focus return to the opener.
 *
 * The bottom sheet has a grab handle: drag it down to dismiss, like the
 * swipeable BottomSheet.
 *
 * `disableClose` keeps it open while a mutation is in flight: Escape, the
 * backdrop and the close button do nothing.
 *
 * SSR: nothing here reads `window`; the breakpoint hook reports desktop on
 * the server and during hydration.
 */
import React, { useId, useRef, useState } from "react"
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide,
  Stack,
  type Breakpoint,
  type DialogProps,
  type SxProps,
  type Theme,
} from "@mui/material"
import type { TransitionProps } from "@mui/material/transitions"
import { CloseRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"

/** How the dialog presents on phones. */
export type ResponsiveDialogMobile = "sheet" | "fullScreen" | "dialog"

export interface ResponsiveDialogProps {
  open: boolean
  onClose: () => void
  /** Visible title; also the dialog's accessible name */
  title?: React.ReactNode
  /** Accessible name when there is no visible title */
  ariaLabel?: string
  /** Short text under the title, announced as the dialog's description */
  description?: React.ReactNode
  /** Id of an element in `children` that describes the dialog */
  describedBy?: string
  /** Accessible name of the close button (default "Close") */
  closeLabel?: string
  /** No close button in the title bar (Escape and the backdrop still close) */
  hideCloseButton?: boolean
  children?: React.ReactNode
  /** Buttons for the action bar, primary last */
  actions?: React.ReactNode
  maxWidth?: Breakpoint | false
  fullWidth?: boolean
  /** Full screen at every width */
  fullScreen?: boolean
  /**
   * Phones: "sheet" (default) slides up from the bottom, "fullScreen" for
   * long forms, "dialog" keeps the centred dialog.
   */
  mobile?: ResponsiveDialogMobile
  /** Dividers around the content, for long or scrolling content */
  dividers?: boolean
  /** Ignore Escape, the backdrop and the close button (mutation in flight) */
  disableClose?: boolean
  /** Ignore backdrop clicks only (unsaved form input) */
  disableBackdropClose?: boolean
  /** Sit above other open dialogs and sheets (e.g. an auth challenge) */
  stackAbove?: boolean
  /** Make the paper a <form>; the submit button goes in `actions` */
  onSubmit?: (event: React.FormEvent<HTMLElement>) => void
  /** Called once the close transition has finished (reset state here) */
  onExited?: () => void
  keepMounted?: boolean
  contentSx?: SxProps<Theme>
  paperSx?: SxProps<Theme>
}

const SlideUp = React.forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

/** Drag distance (px) past which letting go of the handle closes the sheet */
const SWIPE_CLOSE_PX = 80

const SAFE_TOP = "env(safe-area-inset-top, 0px)"
const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)"

export function ResponsiveDialog({
  open,
  onClose,
  title,
  ariaLabel,
  description,
  describedBy,
  closeLabel,
  hideCloseButton = false,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullScreen = false,
  mobile = "sheet",
  dividers = false,
  disableClose = false,
  disableBackdropClose = false,
  stackAbove = false,
  onSubmit,
  onExited,
  keepMounted,
  contentSx,
  paperSx,
}: ResponsiveDialogProps) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const titleId = useId()
  const descriptionId = useId()

  const [drag, setDrag] = useState(0)
  const dragStart = useRef<number | null>(null)

  const isFullScreen = fullScreen || (isMobile && mobile === "fullScreen")
  const isSheet = !isFullScreen && isMobile && mobile === "sheet"
  const showClose = !hideCloseButton && title != null

  const handleClose: DialogProps["onClose"] = (_event, reason) => {
    if (disableClose) return
    if (reason === "backdropClick" && disableBackdropClose) return
    onClose()
  }

  const ariaDescribedBy =
    [description != null ? descriptionId : null, describedBy]
      .filter(Boolean)
      .join(" ") || undefined

  const endDrag = () => {
    if (drag > SWIPE_CLOSE_PX && !disableClose) onClose()
    dragStart.current = null
    setDrag(0)
  }

  const paperLayout: SxProps<Theme> = isSheet
    ? {
        m: 0,
        transform: drag ? `translateY(${drag}px)` : undefined,
        width: "100%",
        maxWidth: "100%",
        maxHeight: `calc(100% - 32px - ${SAFE_TOP})`,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        pb: SAFE_BOTTOM,
      }
    : isFullScreen
      ? { pt: SAFE_TOP, pb: actions ? 0 : SAFE_BOTTOM }
      : {}

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isFullScreen}
      maxWidth={isSheet ? false : maxWidth}
      fullWidth={fullWidth}
      keepMounted={keepMounted}
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={ariaDescribedBy}
      sx={
        stackAbove ? { zIndex: (theme) => theme.zIndex.modal + 20 } : undefined
      }
      slots={isSheet ? { transition: SlideUp } : undefined}
      slotProps={{
        transition: onExited ? { onExited } : undefined,
        container: isSheet ? { sx: { alignItems: "flex-end" } } : undefined,
        paper: {
          "aria-label": title == null ? ariaLabel : undefined,
          ...(onSubmit
            ? { component: "form", onSubmit, noValidate: true }
            : null),
          sx: [paperLayout, ...(Array.isArray(paperSx) ? paperSx : [paperSx])],
        },
      }}
    >
      {isSheet && (
        <Box
          aria-hidden
          data-testid="sheet-handle"
          onTouchStart={(e) => {
            dragStart.current = e.touches[0].clientY
          }}
          onTouchMove={(e) => {
            if (dragStart.current === null) return
            setDrag(Math.max(0, e.touches[0].clientY - dragStart.current))
          }}
          onTouchEnd={endDrag}
          onTouchCancel={endDrag}
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 1,
            pb: 0.5,
            touchAction: "none",
            cursor: "grab",
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 4,
              borderRadius: 2,
              bgcolor: "action.disabled",
            }}
          />
        </Box>
      )}
      {title != null && (
        <DialogTitle
          id={titleId}
          sx={{ pr: showClose ? 6 : undefined }}
          color="text.secondary"
          fontWeight={700}
        >
          {title}
          {showClose && (
            <IconButton
              aria-label={closeLabel ?? t("ui.close", "Close")}
              onClick={onClose}
              disabled={disableClose}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseRounded />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={dividers} sx={contentSx}>
        {description != null && (
          <DialogContentText
            id={descriptionId}
            component="div"
            sx={{ mb: children ? 2 : 0 }}
          >
            {description}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 1.5,
            pb: isFullScreen ? `calc(12px + ${SAFE_BOTTOM})` : undefined,
          }}
        >
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
