import React from "react"
import "./fonts.css"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { createRoot } from "react-dom/client"
import { createHead, UnheadProvider } from "@unhead/react/client"
import { initPWA } from "./util/pwa"
import {
  initializeBugsnagAsync,
  getBugsnagErrorBoundary,
} from "./util/monitoring/bugsnagLoader"
import { clearEmergencyReloadBudget } from "./util/assetReloadGuard"
import { Provider } from "react-redux"
import { setupListeners } from "@reduxjs/toolkit/query"
import { makeStore } from "./store/store"
import { browserNetworkEnv } from "./store/browserNetworkEnv"
import { seedCachedProfile } from "./features/profile/seedCachedProfile"
import { applyTitleTemplate } from "./seo/pageHead"

// Failed dynamic import()s: there is deliberately NO vite:preloadError
// listener. Calling preventDefault() on that event makes Vite's preload helper
// resolve the failed import() to `undefined` instead of rejecting, so a lazy
// route's `(await import(...)).Page` throws a TypeError, skipping the retry →
// reload → error page path in retryDynamicImport. A window-level "is a
// prefetch running?" check cannot tell which import failed: when the idle-time
// prefetch is in flight while a route chunk fails, it cancelled the ROUTE's
// error. Every prefetch path (routePrefetch, componentPrefetch, util/prefetch)
// already catches its own rejection, so letting Vite rethrow costs nothing.

// The browser's single store. Browser-only side effects live here, not in
// makeStore(), so a server render can create clean per-request stores.
const store = makeStore({ networkEnv: browserNetworkEnv })

setupListeners(store.dispatch)

// Start the session check (GET /api/auth/session) before anything renders:
// the profile query and every auth-only query wait on its answer instead of
// probing with requests that 401 for anonymous visitors.
void browserNetworkEnv.checkSession()

// Seed the profile from localStorage (no logged-out flash for returning
// users); its refetch waits for the session check above.
seedCachedProfile(store)

const container = document.getElementById("root")
const root = createRoot(container!)

// Unhead manages the document <head> (replaces react-helmet, which is
// unmaintained and unsafe under React 19 concurrent rendering). The global
// titleTemplate is the single source of truth for the " - SC Market" suffix.
//
// It is IDEMPOTENT: pages that set only a bare title (e.g. "Agricium") get the
// suffix appended → "Agricium - SC Market", while pages with a keyword-rich
// title that already contains the brand (e.g. "Aurora MR — Star Citizen Ship |
// SC Market") pass through untouched. This lets per-page <title> tags keep
// their SEO-optimized, front-loaded phrasing without double-appending the
// brand, while still guaranteeing every page ends in the brand name.
//
// Because this template owns the suffix, imperative writers must NOT append it
// themselves — see Page.tsx and src/hooks/router/usePageTitle.ts, which now set
// bare titles through Unhead (useHead) rather than writing document.title.
const head = createHead({
  init: [
    {
      titleTemplate: applyTitleTemplate,
    },
  ],
})

// Get error boundary (will use fallback if Bugsnag not loaded yet)
const ErrorBoundary = getBugsnagErrorBoundary(React)

// Initialize Bugsnag asynchronously (non-blocking)
// This happens after page is interactive to avoid blocking critical rendering
initializeBugsnagAsync(import.meta.env.VITE_BUGSNAG_API_KEY || "").catch(
  (error) => {
    // Silently fail - error monitoring is not critical for app functionality
    if (import.meta.env.DEV) {
      console.warn("Bugsnag initialization failed (non-critical):", error)
    }
  },
)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <UnheadProvider head={head}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </UnheadProvider>
    </Provider>
  </React.StrictMode>,
)

// Reset reload budget only after the shell has been stable long enough for lazy chunks
// to load — clearing on every boot caused infinite reload loops with stale index.html.
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    window.setTimeout(() => clearEmergencyReloadBudget(), 20_000)
  })
}

// Initialize PWA features (service worker registration, online detection)
// Delay initialization significantly to ensure app is fully loaded and Redux is set up
// This is non-critical and won't block app startup
setTimeout(() => {
  try {
    initPWA()
  } catch (error) {
    // Silently fail - PWA is a progressive enhancement, not critical for app functionality
    if (import.meta.env.DEV) {
      console.warn("PWA initialization failed (non-critical):", error)
    }
  }
}, 2000) // Wait 2 seconds to ensure app is fully initialized

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
