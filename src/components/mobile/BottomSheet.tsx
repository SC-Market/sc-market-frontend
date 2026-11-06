/**
 * BottomSheet Component
 * A mobile-friendly modal that slides up from the bottom
 * Better UX than full-screen modals on mobile devices
 * Supports swipe-down to dismiss gesture and snap points
 *
 * Accessibility: the sheet is a modal dialog (`role="dialog"`,
 * `aria-modal`), named by its visible title or by `ariaLabel` when there is
 * none. MUI's modal gives the focus trap, Escape, and focus return to the
 * opener on close.
 *
 * Mounting: content unmounts once the sheet has closed (after the exit
 * transition). Pass `keepMounted` for content that must survive a close.
 *
 * SSR: nothing here reads `window` during render. Snap heights are CSS
 * (`dvh`, with a `vh` fallback); the viewport is only measured inside
 * touch handlers, while a drag is in progress.
 */

import {
  Box,
  IconButton,
  SwipeableDrawer,
  Typography,
  useTheme,
} from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import React, { ReactNode, useEffect, useId, useRef, useState } from "react"
import { CloseRounded } from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { haptic } from "../../util/haptics"
import { useTranslation } from "react-i18next"

export type BottomSheetSnap = "peek" | "half" | "66" | "75" | "full"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Visible title; also the sheet's accessible name */
  title?: string
  /** Accessible name when there is no visible title */
  ariaLabel?: string
  /** Id of an element inside the sheet that names it (overrides `title`) */
  ariaLabelledBy?: string
  /** Id of an element inside the sheet that describes it */
  ariaDescribedBy?: string
  children: ReactNode
  /** Height of the "full" snap: a `vh` string (e.g. "90vh") or pixels */
  maxHeight?: string | number
  showCloseButton?: boolean
  fullHeight?: boolean
  disableBackdropClose?: boolean
  snapPoints?: BottomSheetSnap[]
  defaultSnap?: BottomSheetSnap
  peekHeight?: number
  /** Keep the content mounted while the sheet is closed */
  keepMounted?: boolean
}

type ViewportUnit = "vh" | "dvh"

/** A snap's height: a fraction of the viewport, pixels, or raw CSS. */
type SnapSize = { fraction: number } | { px: number } | { css: string }

function snapSize(
  snap: BottomSheetSnap,
  maxHeight: string | number,
  fullHeight: boolean,
  peekHeight: number,
): SnapSize {
  if (snap === "peek") return { px: peekHeight }
  if (snap === "half") return { fraction: 0.5 }
  if (snap === "66") return { fraction: 0.66 }
  if (snap === "75") return { fraction: 0.75 }
  if (fullHeight) return { fraction: 1 }
  if (typeof maxHeight === "number") return { px: maxHeight }
  if (maxHeight.endsWith("vh")) {
    return { fraction: parseFloat(maxHeight) / 100 }
  }
  return { css: maxHeight }
}

/** CSS height for render: no viewport measurement needed. */
function sizeToCss(size: SnapSize, unit: ViewportUnit): string {
  if ("px" in size) return `${size.px}px`
  if ("css" in size) return size.css
  return `${Math.round(size.fraction * 10000) / 100}${unit}`
}

/** Pixel height, for drag maths. Only call from event handlers. */
function sizeToPx(size: SnapSize, viewportHeight: number): number {
  if ("px" in size) return size.px
  if ("fraction" in size) return size.fraction * viewportHeight
  return viewportHeight * 0.9
}

export function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
  maxHeight = "90vh",
  showCloseButton = true,
  fullHeight = false,
  disableBackdropClose = false,
  snapPoints = ["full"],
  defaultSnap = "full",
  peekHeight = 120,
  keepMounted = false,
}: BottomSheetProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const titleId = useId()
  const [currentSnap, setCurrentSnap] = useState<BottomSheetSnap>(defaultSnap)
  /** Pixel height while the handle is being dragged, else null */
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const dragStartY = useRef<number | null>(null)
  const dragStartHeight = useRef<number>(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Reset snap when sheet opens
  useEffect(() => {
    if (open) {
      setCurrentSnap(defaultSnap)
      setDragHeight(null)
    }
  }, [open, defaultSnap])

  const sizeOf = (snap: BottomSheetSnap) =>
    snapSize(snap, maxHeight, fullHeight, peekHeight)

  // Event handlers only: measures the viewport
  const snapPx = (snap: BottomSheetSnap) =>
    sizeToPx(sizeOf(snap), window.innerHeight)

  const findClosestSnap = (height: number): BottomSheetSnap =>
    snapPoints
      .map((snap) => ({ snap, height: snapPx(snap) }))
      .reduce((closest, current) =>
        Math.abs(current.height - height) < Math.abs(closest.height - height)
          ? current
          : closest,
      ).snap

  const handleDragStart = (clientY: number) => {
    const startHeight = snapPx(currentSnap)
    dragStartY.current = clientY
    dragStartHeight.current = startHeight
    setDragHeight(startHeight)
  }

  const handleDragMove = (clientY: number) => {
    if (dragStartY.current === null) return
    const newHeight = dragStartHeight.current + (dragStartY.current - clientY)
    // Constrain between peek and full
    setDragHeight(Math.max(snapPx("peek"), Math.min(snapPx("full"), newHeight)))
  }

  const handleDragEnd = () => {
    if (dragStartY.current === null || dragHeight === null) return

    const dragOffset = dragHeight - dragStartHeight.current
    const closestSnap = findClosestSnap(dragHeight)

    // If dragged down significantly from peek, close
    if (closestSnap === "peek" && dragOffset < -50) {
      haptic.light()
      onClose()
    } else {
      // Snap to closest point
      if (closestSnap !== currentSnap) {
        haptic.selection()
      }
      setCurrentSnap(closestSnap)
    }

    setDragHeight(null)
    dragStartY.current = null
  }

  const handleClose = () => {
    haptic.light()
    onClose()
  }

  // Modal closes pass a reason (Escape, backdrop); SwipeableDrawer's own
  // swipe-to-close passes none, and only counts at the content's scroll top.
  const handleDrawerClose = (_event?: unknown, reason?: string) => {
    if (reason === "backdropClick" && disableBackdropClose) return
    if (reason === undefined) {
      const el = contentRef.current
      if (el && el.scrollTop > 0) return
    }
    handleClose()
  }

  const isDragging = dragHeight !== null
  const snapHeight = sizeOf(currentSnap)
  const labelledBy = ariaLabelledBy ?? (title ? titleId : undefined)

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={handleDrawerClose}
      onOpen={() => haptic.light()}
      disableSwipeToOpen
      swipeAreaWidth={0}
      hysteresis={0.7}
      minFlingVelocity={800}
      PaperProps={{
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": labelledBy,
        "aria-label": labelledBy ? undefined : ariaLabel,
        "aria-describedby": ariaDescribedBy,
        sx: {
          height: isDragging ? `${dragHeight}px` : sizeToCss(snapHeight, "vh"),
          "@supports (height: 1dvh)": isDragging
            ? undefined
            : { height: sizeToCss(snapHeight, "dvh") },
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : 0,
          transition: isDragging
            ? "none"
            : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
      ModalProps={{
        keepMounted,
        sx: {
          zIndex: theme.zIndex.modal + 10,
        },
        slotProps: {
          backdrop: {
            sx: {
              backdropFilter: "blur(4px)",
              backgroundColor: theme.palette.background.overlay,
            },
          },
        },
      }}
    >
      {/* Puller - draggable handle */}
      <Box
        aria-hidden
        data-testid="bottom-sheet-handle"
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
        onTouchCancel={handleDragEnd}
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          pt: 1,
          pb: 0.5,
          cursor: "grab",
          touchAction: "none",
          "&:active": {
            cursor: "grabbing",
          },
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 6,
            backgroundColor: theme.palette.action.active,
            borderRadius: 3,
            opacity: 0.4,
          }}
        />
      </Box>

      {/* Header */}
      {(title || showCloseButton) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            pt: 1,
            pb: title ? 1 : 0,
            borderBottom: title ? theme.borderWidth.hairline : 0,
            borderColor: theme.palette.divider,
          }}
        >
          {title && (
            <Typography
              id={titleId}
              variant="h6"
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              {title}
            </Typography>
          )}
          {showCloseButton && (
            <IconButton
              aria-label={t("ui.close", "Close")}
              onClick={handleClose}
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
        ref={contentRef}
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
