import { SidebarV2 } from "../sidebar/SidebarV2"
import { Box } from "@mui/material"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { Navbar } from "../navbar/Navbar"
import React from "react"
import { PreferencesButton } from "../../views/settings/PreferencesButton"
import { CookieConsent } from "../alert/CookieConsent"
import { SkipNavigation } from "../accessibility/SkipNavigation"
import { UpdateNotification } from "../pwa/UpdateNotification"
import { InstallPrompt } from "../pwa/InstallPrompt"
import { MobileBottomNav } from "../navigation/MobileBottomNav"
import { ContextAwareFAB } from "../mobile/ContextAwareFAB"
import { useLocation } from "react-router-dom"
import { useAppViewportHeight } from "../../hooks/layout/useAppViewportHeight"
import { DebugPanel } from "../market/v2/DebugPanel"
import { MainContent } from "./MainContent"
import { CartDrawerProvider } from "../../features/market/hooks/AddToCartContext"
import { ParticleField } from "../effects/ParticleField"
import { CommandPalette } from "../command-palette/CommandPalette"
import { useHydrated } from "../../hooks/ssr/useHydrated"
import { PageReadyProvider } from "../metadata/PageReady"

export function Root(props: { children: React.ReactNode }) {
  const isMobile = useIsMobile()
  // Root deliberately does NOT read DrawerOpenContext: it renders the whole
  // shell (navbar, sidebar, bottom nav, command palette, ...), so subscribing
  // here re-rendered all of it on every drawer toggle (an INP cost on the menu
  // button), and nothing in Root depends on the drawer state.
  const location = useLocation()
  const isMessagingPage = location.pathname.startsWith("/messages")
  const hydrated = useHydrated()
  useAppViewportHeight()

  return (
    <Box
      id={"rootarea"}
      sx={{
        display: "flex",
        flexDirection: "row", // Horizontal layout for sidebar and main content
        background: "transparent",
        backgroundSize: "400px",
        // The visible area, not the largest one: 100vh runs under a mobile
        // URL bar (and under iOS's keyboard), so whatever sits at the bottom
        // of <main>, like the message composer, was hidden there.
        // --app-height: useAppViewportHeight.
        height: "100vh",
        "@supports (height: 100dvh)": {
          height: "var(--app-height, 100dvh)",
        },
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
            floatingActions={
              <>
                {/* Top to bottom; the admin-only debug toggle rides above */}
                <DebugPanel />
                {!isMessagingPage && !isMobile && <PreferencesButton />}
                <ContextAwareFAB />
              </>
            }
            floating={<MobileBottomNav />}
          >
            {props.children}
          </MainContent>
        </PageReadyProvider>
      </CartDrawerProvider>
    </Box>
  )
}
