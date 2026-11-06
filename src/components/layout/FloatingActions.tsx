import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
} from "react"
import { createPortal } from "react-dom"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"

/**
 * The page slot of the app's FloatingActions, for `<FloatingAction>`.
 * `undefined`: no FloatingActions above (a component rendered on its own, as
 * in a unit test). `null`: the slot hasn't mounted yet.
 */
export const FloatingActionsSlotContext = createContext<
  HTMLElement | null | undefined
>(undefined)

/**
 * The one bottom-right corner area for the app's floating buttons (the admin
 * debug toggle, page settings, the mobile context FAB, a page's own FAB).
 * They stack in a column with a gap, so they can't land on top of each other:
 * each button is in normal flow and only this container is positioned.
 *
 * It sits inside `<main>` (position: relative), clears the mobile bottom nav
 * and the safe-area insets, and reports its own height through
 * `onHeightChange` so the page can reserve room at the bottom of its scroll
 * area for it (see Root's MainContent).
 *
 * `children`: the app-wide buttons, rendered as direct children with no
 * positioning of their own. `slotRef`: receives the page slot at the bottom
 * of the column, where `<FloatingAction>` portals a page's own buttons.
 */
export function FloatingActions(props: {
  children: React.ReactNode
  slotRef: (el: HTMLElement | null) => void
  onHeightChange: (height: number) => void
}) {
  const { children, slotRef, onHeightChange } = props
  const theme = useTheme()
  const bottomNavHeight = useBottomNavHeight()
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    onHeightChange(el.offsetHeight)
    const observer = new ResizeObserver(() => onHeightChange(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [onHeightChange])

  // The bottom nav is fixed to the viewport bottom and pads itself with the
  // home-indicator inset (MobileBottomNav), so stand clear of both.
  const bottom = bottomNavHeight
    ? `calc(${bottomNavHeight}px + env(safe-area-inset-bottom) + ${theme.spacing(2)})`
    : `calc(env(safe-area-inset-bottom) + ${theme.spacing(2)})`

  return (
    <Box
      ref={ref}
      data-testid="floating-actions"
      sx={{
        position: "absolute",
        right: `calc(env(safe-area-inset-right) + ${theme.spacing(2)})`,
        bottom,
        zIndex: theme.zIndex.drawer + 2, // above the bottom nav (drawer + 1)
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: theme.spacing(1),
        maxWidth: `calc(100% - ${theme.spacing(4)})`,
        // The box spans its widest child (an open debug panel); only the
        // buttons themselves take clicks, not the empty space beside them.
        pointerEvents: "none",
        "& > *, & > [data-floating-slot] > *": { pointerEvents: "auto" },
        "& .MuiFab-root.Mui-focusVisible, & .MuiIconButton-root.Mui-focusVisible, & .MuiButton-root.Mui-focusVisible":
          {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
      }}
    >
      {children}
      {/* display: contents, so page buttons are items of this column */}
      <Box ref={slotRef} data-floating-slot sx={{ display: "contents" }} />
    </Box>
  )
}

/**
 * A page's own floating button (a mobile "Filters" FAB): rendered into the
 * app's FloatingActions stack, below the app-wide buttons, instead of being
 * positioned by the page. Give it no position of its own.
 */
export function FloatingAction(props: { children: React.ReactNode }) {
  const slot = useContext(FloatingActionsSlotContext)
  // Rendered without the app shell (a unit test): there's no corner to join.
  if (slot === undefined) return <>{props.children}</>
  if (slot === null) return null
  return createPortal(props.children, slot)
}
