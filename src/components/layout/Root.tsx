import { Sidebar } from "../sidebar/Sidebar"
import { Box, Theme, useTheme } from "@mui/material"
import { Navbar } from "../navbar/Navbar"
import React from "react"
import { useDrawerOpen } from "../../hooks/layout/Drawer"
import { PreferencesButton } from "../../views/settings/PreferencesButton"
import { CookieConsent } from "../alert/CookieConsent"
import { useRoutePrefetch } from "../../hooks/prefetch/RoutePrefetch"
import { SkipNavigation } from "../accessibility/SkipNavigation"
import { OfflineIndicator } from "../pwa/OfflineIndicator"
import { UpdateNotification } from "../pwa/UpdateNotification"
import { InstallPrompt } from "../pwa/InstallPrompt"
import { MobileBottomNav } from "../navigation/MobileBottomNav"
import { useLocation } from "react-router-dom"

export function Root(props: { children: React.ReactNode }) {
  const theme: Theme = useTheme()
  const [drawerOpen] = useDrawerOpen()
  const location = useLocation()
  const isMessagingPage = location.pathname.startsWith("/messages")

  // Enable route-based prefetching
  useRoutePrefetch()

  return (
    <Box
      id={"rootarea"}
      sx={{
        display: "flex",
        background: theme.palette.background.default,
        backgroundSize: "400px",
        // backgroundSize: 'cover',
      }}
    >
      <SkipNavigation />
      <CookieConsent />
      {/* PWA Components */}
      {typeof window !== "undefined" && (
        <>
          {/* OfflineIndicator disabled - offline popup removed */}
          {/* <OfflineIndicator /> */}
          <UpdateNotification />
          <InstallPrompt />
        </>
      )}
      <Navbar />
      <Sidebar />
      {props.children}
      {!isMessagingPage && <PreferencesButton />}
      <MobileBottomNav />
    </Box>
  )
}
