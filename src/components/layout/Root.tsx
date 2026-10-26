import { SidebarV2 } from "../sidebar/SidebarV2"
import { Box } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { Navbar } from "../navbar/Navbar"
import React from "react"
import { PreferencesButton } from "../../views/settings/PreferencesButton"
import { CookieConsent } from "../alert/CookieConsent"
import { useRoutePrefetch } from "../../hooks/prefetch/RoutePrefetch"
import { SkipNavigation } from "../accessibility/SkipNavigation"
import { OfflineIndicator } from "../pwa/OfflineIndicator"
import { UpdateNotification } from "../pwa/UpdateNotification"
import { InstallPrompt } from "../pwa/InstallPrompt"
import { MobileBottomNav } from "../navigation/MobileBottomNav"
import { ContextAwareFAB } from "../mobile/ContextAwareFAB"
import { useLocation } from "react-router-dom"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { DebugPanel } from "../market/v2/DebugPanel"
import { CartDrawerProvider } from "../../features/market/hooks/AddToCartContext"
import { ParticleField } from "../effects/ParticleField"
import { CommandPalette } from "../command-palette/CommandPalette"
import { useHydrated } from "../../hooks/ssr/useHydrated"
import {
  PageReadyProvider,
  usePageReadyAttributes,
} from "../metadata/PageReady"

export function Root(props: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  // Root deliberately does NOT read DrawerOpenContext: it renders the whole
  // shell (navbar, sidebar, bottom nav, command palette, ...), so subscribing
  // here re-rendered all of it on every drawer toggle (an INP cost on the menu
  // button), and nothing in Root depends on the drawer state.
  const location = useLocation()
  const isMessagingPage = location.pathname.startsWith("/messages")
  const hydrated = useHydrated()

  // Enable route-based prefetching
  useRoutePrefetch()

  return (
    <Box
      id={"rootarea"}
      sx={{
        display: "flex",
        flexDirection: "row", // Horizontal layout for sidebar and main content
        background: "transparent",
        backgroundSize: "400px",
        height: "100vh",
        overflow: "hidden", // Prevent root from scrolling
        // backgroundSize: 'cover',
      }}
    >
      <CommandPalette />
      <ParticleField />
      <SkipNavigation />
      <CookieConsent />
      {/* PWA Components */}
      {hydrated && (
        <>
          {/* OfflineIndicator disabled - offline popup removed */}
          {/* <OfflineIndicator /> */}
          <UpdateNotification />
          <InstallPrompt />
        </>
      )}
      <CartDrawerProvider>
      <Navbar />
      <SidebarV2 />
      <PageReadyProvider>
        <MainContent
          floating={
            <>
              {!isMessagingPage && !isMobile && <PreferencesButton />}
              <DebugPanel />
              <MobileBottomNav />
              <ContextAwareFAB />
            </>
          }
        >
          {props.children}
        </MainContent>
      </PageReadyProvider>
      </CartDrawerProvider>
    </Box>
  )
}

/**
 * The main content area. Carries the page-ready signal: `aria-busy` and
 * `data-ready` (see PageReady.tsx, docs/testing-with-mcp.md). Its own
 * component so a ready change re-renders only this element, not Root.
 * `floating`: the controls that sit beside the scrolling page area.
 */
function MainContent(props: {
  children: React.ReactNode
  floating: React.ReactNode
}) {
  const bottomNavHeight = useBottomNavHeight()
  const readyAttributes = usePageReadyAttributes()
  return (
    <Box
      component="main"
      id="main-content"
      role="main"
      aria-label="Main content"
      {...readyAttributes}
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
      {props.floating}
    </Box>
  )
}
