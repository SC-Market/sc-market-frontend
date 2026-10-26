/**
 * The app layout: every route except the standalone widget renders inside
 * it (theme, i18n, white-label domain, the shell with navbar/sidebar/main,
 * and the route Suspense that shows the page skeleton while a page chunk
 * loads). Its route's ErrorBoundary (FrontendErrorElement, see shell.ts) is
 * the full-page error screen for anything the page routes don't catch.
 */
import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { HookProvider } from "../hooks/HookProvider"
import { ShoppingListProvider } from "../features/wishlists/hooks/WishlistContext"
import { Root } from "../components/layout/Root"
import { WhiteLabelAuthGate } from "../components/authentication/WhiteLabelAuthGate"
import { RouteSuspense } from "../components/router/RouteSuspense"
import { useRoutePrefetch } from "../hooks/router/useRoutePrefetch"
import { usePageTitle } from "../hooks/router/usePageTitle"
import { useLocaleMeta } from "../hooks/router/useLocaleMeta"
import { markRouterReady } from "../routes/definePage"

/**
 * Component that runs inside the router context to enable route-based hooks
 */
function RouterEffects() {
  // Prefetch routes based on current location
  useRoutePrefetch()
  // Update page title based on current route
  usePageTitle()
  // Declare the active language to crawlers (<html lang> + og:locale)
  useLocaleMeta()
  return null
}

export function AppLayout() {
  useEffect(() => markRouterReady(), [])
  return (
    <HookProvider>
      <ShoppingListProvider>
        <WhiteLabelAuthGate>
          <Root>
            <RouterEffects />
            <RouteSuspense>
              <Outlet />
            </RouteSuspense>
          </Root>
        </WhiteLabelAuthGate>
      </ShoppingListProvider>
    </HookProvider>
  )
}
