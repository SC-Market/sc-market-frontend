import { Box, Drawer, IconButton, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React, { useEffect } from "react"

import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../features/market"
import { useServiceSidebar } from "../../hooks/contract/ServiceSidebar"
import { ServiceSearchArea } from "../services/ServiceSearchArea"
import CloseIcon from "@mui/icons-material/Close"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../components/mobile/BottomSheet"

export function ServiceSidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()

  // States
  const [open, setOpen] = useServiceSidebar()
  const [drawerOpen] = useDrawerOpen()

  const xs = useMediaQuery(theme.breakpoints.down("lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  useEffect(() => {
    setOpen(!xs)
  }, [setOpen, xs])

  // Content component
  const sidebarContent = (
    <Stack justifyContent={"left"} direction={"column"}>
      <ServiceSearchArea />
    </Stack>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("service_market.filters", "Filters")}
        maxHeight="90vh"
      >
        {sidebarContent}
      </BottomSheet>
    )
  }

  // On desktop, use permanent drawer
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        zIndex: theme.zIndex.drawer - 3,
        width: open ? marketDrawerWidth : 0,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: open ? marketDrawerWidth : 0,
          boxSizing: "border-box",
          overflow: "scroll",
          left: drawerOpen ? sidebarDrawerWidth : 0,
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create(
            ["width", "borderRight", "borderColor"],
            {
              easing: theme.transitions.easing.easeOut,
              duration: "0.3s",
            },
          ),
          borderRight: open ? 1 : 0,
          borderColor: open ? theme.palette.outline.main : "transparent",
        },
        position: "relative",
        whiteSpace: "nowrap",
        background: "transparent",
        overflow: "scroll",
        borderRight: open ? 1 : 0,
        borderColor: open ? theme.palette.outline.main : "transparent",
      }}
      container={
        window !== undefined
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <Box
        sx={{
          ...theme.mixins.toolbar,
          position: "relative",
          width: "100%",
        }}
      />
      {sidebarContent}
    </Drawer>
  )
}
