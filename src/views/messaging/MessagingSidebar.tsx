import { Box, Drawer, IconButton, Tooltip, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import { MessagingSidebarContent } from "./MessagingSidebarContent"
import { MenuRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

export const messagingDrawerWidth = 360

// Sidebar with chat list and search/group creation controls
export function MessagingSidebar() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const [messagingSidebar, setMessagingSidebar] = useMessagingSidebar()
  const { t } = useTranslation()

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? messagingSidebar : true}
      onClose={() => setMessagingSidebar(false)}
      sx={{
        width: isMobile
          ? messagingDrawerWidth
          : messagingSidebar
            ? messagingDrawerWidth
            : 0,
        flexShrink: 0,
        position: "relative",
        transition: isMobile
          ? undefined
          : theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        "& .MuiDrawer-paper": {
          width: isMobile
            ? messagingDrawerWidth
            : messagingSidebar
              ? messagingDrawerWidth
              : 0,
          boxSizing: "border-box",
          position: "fixed",
          top: 65,
          bottom: 0,
          zIndex: isMobile ? theme.zIndex.drawer : theme.zIndex.drawer - 1,
          left: isMobile ? 0 : drawerOpen ? sidebarDrawerWidth : 0,
          maxWidth: isMobile ? "85vw" : messagingDrawerWidth,
          borderRight: 0,
          borderLeft: 0,
          borderColor: theme.palette.outline.main,
          overflow: "hidden",
          transition: isMobile
            ? undefined
            : theme.transitions.create(["width", "left", "borderRight"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
        },
      }}
      container={
        window !== undefined && isMobile
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <MessagingSidebarContent />
    </Drawer>
  )
}
