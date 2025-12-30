import { Box, Drawer, IconButton, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import React, { useEffect } from "react"

import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../hooks/market/MarketSidebar"
import { useServiceSidebar } from "../../hooks/contract/ServiceSidebar"
import { ServiceSearchArea } from "../services/ServiceSearchArea"
import CloseIcon from "@mui/icons-material/Close"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"

export function ServiceSidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()

  // States
  const [open, setOpen] = useServiceSidebar()
  const [drawerOpen] = useDrawerOpen()

  const xs = useMediaQuery(theme.breakpoints.down("lg"))
  useEffect(() => {
    setOpen(!xs)
  }, [setOpen, xs])

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
          [theme.breakpoints.up("sm")]: {
            left: drawerOpen ? sidebarDrawerWidth : 0,
          },
          [theme.breakpoints.down("sm")]: {
            left: 0,
          },
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.easeOut,
            duration: "0.3s",
          }),
          borderColor: theme.palette.outline.main,
        },
        position: "relative",
        whiteSpace: "nowrap",
        // backgroundColor: "#132321",
        // backgroundRepeat: 'no-repeat',
        // backgroundPosition: 'center',
        // backgroundSize: "cover",
        background: "transparent",
        overflow: "scroll",
        borderColor: theme.palette.outline.main,
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
      <Stack justifyContent={"left"} direction={"column"}>
        <Box
          sx={{
            paddingLeft: 2,
            paddingTop: 4,
            display: { xs: "block", md: "none" }, // Only show close button on mobile
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            color={"secondary"}
            aria-label={t("service_market.toggle_sidebar")}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <ServiceSearchArea />
      </Stack>
    </Drawer>
  )
}
