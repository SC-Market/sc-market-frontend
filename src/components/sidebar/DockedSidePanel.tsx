/**
 * A desktop side panel docked beside the navigation sidebar, below the top
 * bar (e.g. the messaging list). It is part of the page layout, not a modal:
 * it slides open to `width` and collapses to nothing. Phones use a
 * BottomSheet instead (see MessagingSidebar).
 */
import React from "react"
import { Drawer } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"

export interface DockedSidePanelProps {
  open: boolean
  width: number
  children: React.ReactNode
}

export function DockedSidePanel({
  open,
  width,
  children,
}: DockedSidePanelProps) {
  const theme = useTheme<ExtendedTheme>()
  const [navOpen] = useDrawerOpen()
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        position: "relative",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: open ? width : 0,
          boxSizing: "border-box",
          position: "fixed",
          top: 65,
          bottom: 0,
          zIndex: theme.zIndex.drawer - 1,
          left: navOpen ? sidebarDrawerWidth : 0,
          borderRight: 0,
          borderLeft: 0,
          borderColor: theme.palette.outline.main,
          overflow: "hidden",
          transition: theme.transitions.create(
            ["width", "left", "borderRight"],
            {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            },
          ),
        },
      }}
      container={() => document.getElementById("rootarea")}
    >
      {children}
    </Drawer>
  )
}
