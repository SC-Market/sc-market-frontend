import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { usePageReadyAttributes } from "../metadata/PageReady"
import {
  FLOATING_ACTIONS_ROOM_VAR,
  FloatingActions,
  FloatingActionsSlotContext,
} from "./FloatingActions"

/**
 * The main content area (Root). Carries the page-ready signal: `aria-busy`
 * and `data-ready` (see PageReady.tsx, docs/testing-with-mcp.md). Its own
 * component so a ready change re-renders only this element, not Root.
 * `floatingActions`: the bottom-right buttons, stacked by FloatingActions.
 * `floating`: other controls that sit beside the scrolling page area.
 */
export function MainContent(props: {
  children: React.ReactNode
  floatingActions: React.ReactNode
  floating: React.ReactNode
}) {
  const { t } = useTranslation()
  const theme = useTheme()
  const bottomNavHeight = useBottomNavHeight()
  // Height of the floating buttons, 0 when none show. While they do, the
  // page's scroll area gets that much room at its end
  // (FLOATING_ACTIONS_ROOM_VAR, used by FloatingActionsRoom), so the last row
  // of a page (a card's button, a checkout button) can scroll out from under
  // them.
  const [floatingHeight, setFloatingHeight] = useState(0)
  // Where a page's own floating buttons go (<FloatingAction>)
  const [floatingSlot, setFloatingSlot] = useState<HTMLElement | null>(null)
  const readyAttributes = usePageReadyAttributes()
  return (
    <Box
      component="main"
      id="main-content"
      role="main"
      aria-label={t("ui.mainContent")}
      {...readyAttributes}
      sx={{
        display: "flex",
        flexDirection: "column", // Vertical layout for main content
        flex: 1,
        minHeight: 0, // Allow flex item to shrink below content size
        overflow: "hidden", // Prevent this container from scrolling
        position: "relative", // For absolute positioning of bottom nav
        // Add padding bottom to account for bottom nav (dynamically adjusts when keyboard opens)
        // The bottom nav is 64px plus the home-indicator inset it pads itself
        // with (MobileBottomNav), so clear both.
        paddingBottom: bottomNavHeight
          ? `calc(${bottomNavHeight}px + env(safe-area-inset-bottom))`
          : 0,
      }}
    >
      <Box
        data-testid="page-area"
        sx={{
          flex: 1,
          minHeight: 0, // Allow flex item to shrink
          overflow: "auto", // Main content can scroll internally
          // Not padding: the pages scroll inside their own full-height
          // <main> (ContainerGrid, OpenGrid, OpenLayout), so padding here
          // shrank that scroller and left a blank band under the page with
          // the content cut off above it. The page's scroller adds the room
          // at its end instead (FloatingActionsRoom).
          [FLOATING_ACTIONS_ROOM_VAR]: floatingHeight
            ? `calc(${floatingHeight}px + ${theme.spacing(2)})`
            : "0px",
        }}
      >
        <FloatingActionsSlotContext.Provider value={floatingSlot}>
          {props.children}
        </FloatingActionsSlotContext.Provider>
      </Box>
      <FloatingActions
        slotRef={setFloatingSlot}
        onHeightChange={setFloatingHeight}
      >
        {props.floatingActions}
      </FloatingActions>
      {props.floating}
    </Box>
  )
}
