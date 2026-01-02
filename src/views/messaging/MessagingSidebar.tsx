import { Box, Drawer, IconButton, Tooltip, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useMessagingSidebar } from "../../hooks/messaging/MessagingSidebar"
import { MessagingSidebarContent } from "./MessagingSidebarContent"
import { MenuRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../components/mobile/BottomSheet"

export const messagingDrawerWidth = 360

// Sidebar with chat list and search/group creation controls
export function MessagingSidebar() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const [messagingSidebar, setMessagingSidebar] = useMessagingSidebar()
  const { t } = useTranslation()

  // On mobile, use BottomSheet instead of temporary drawer
  if (isMobile) {
    return (
      <>
        <BottomSheet
          open={messagingSidebar ?? false}
          onClose={() => setMessagingSidebar(false)}
          title={t("MessagingSidebar.title", "Messages")}
          maxHeight="90vh"
        >
          <MessagingSidebarContent />
        </BottomSheet>
        {/* Desktop drawer still needed for layout spacing */}
        <Drawer
          variant="permanent"
          open={false}
          sx={{
            width: 0,
            display: { xs: "none", md: "block" },
          }}
        />
      </>
    )
  }

  // On desktop, use permanent drawer
  return (
    <Drawer
      variant="permanent"
      open={messagingSidebar}
      sx={{
        width: messagingSidebar ? messagingDrawerWidth : 0,
        flexShrink: 0,
        position: "relative",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: messagingSidebar ? messagingDrawerWidth : 0,
          boxSizing: "border-box",
          position: "fixed",
          top: 65,
          bottom: 0,
          zIndex: theme.zIndex.drawer - 1,
          left: drawerOpen ? sidebarDrawerWidth : 0,
          borderRight: 0,
          borderLeft: 0,
          borderColor: theme.palette.outline.main,
          overflow: "hidden",
          transition: theme.transitions.create(["width", "left", "borderRight"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
      container={
        window !== undefined
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <MessagingSidebarContent />
    </Drawer>
  )
}
