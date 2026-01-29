import { Sidebar } from "../sidebar/Sidebar"
import { Box, Theme, useTheme, useMediaQuery } from "@mui/material"
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
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { ExtendedTheme } from "../../hooks/styles/Theme"

export function Root(props: { children: React.ReactNode }) {
  const theme: Theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [drawerOpen] = useDrawerOpen()
  const location = useLocation()
  const isMessagingPage = location.pathname.startsWith("/messages")
  const bottomNavHeight = useBottomNavHeight()

  // Enable route-based prefetching
  useRoutePrefetch()

  return (
    <Box
      id={"rootarea"}
      sx={{
        display: "flex",
        flexDirection: "row", // Horizontal layout for sidebar and main content
        background: theme.palette.background.default,
        backgroundSize: "400px",
        height: "100vh",
        overflow: "hidden", // Prevent root from scrolling
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Vertical layout for main content
          flex: 1,
          minHeight: 0, // Allow flex item to shrink below content size
          overflow: "hidden", // Prevent this container from scrolling
          position: "relative", // For absolute positioning of bottom nav
          // Add padding bottom to account for bottom nav (dynamically adjusts when keyboard opens)
          paddingBottom: `${bottomNavHeight}px`,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0, // Allow flex item to shrink
            overflow: "auto", // Main content can scroll internally
          }}
        >
          {props.children}
        </Box>
        {!isMessagingPage && !isMobile && <PreferencesButton />}
        <MobileBottomNav />
      </Box>
    </Box>
  )
}
