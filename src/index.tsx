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
import { isPrefetchInFlight } from "./router/routePrefetch"

// Handle failed dynamic import()s. vite:preloadError is Vite's typed,
// cross-browser signal for a failed dynamic import — the robust way to detect a
// stale/missing route chunk WITHOUT coupling to browser-specific error text.
//
// This handler's ONLY job is to swallow PREFETCH failures. A hover-prefetch of a
// stale chunk (removed by a deploy) also fires this event; without preventDefault
// Vite re-throws and the unhandled rejection is noisy for a background fetch the
// user never asked for. prefetchRoute's own try/catch already handles it.
//
// Real NAVIGATION failures are deliberately NOT preventDefault()'d here:
//   - preventDefault() would make the awaited import() resolve to `undefined`
//     instead of rejecting, silently defeating the retry in retryDynamicImport.
//   - Reloading on the first failed attempt would preempt the retry entirely.
// Instead, navigation imports are wrapped in retryDynamicImport (see App.tsx),
// which retries transient blips in place and, only once retries are exhausted,
// escalates to a rate-limited reload (deploy recovery) or lets the error reach
// the route error boundary.
window.addEventListener("vite:preloadError", (event) => {
  if (isPrefetchInFlight()) {
    event.preventDefault()
  }
})

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
      titleTemplate: (title) => {
        if (!title) return "SC Market"
        return title.includes("SC Market") ? title : `${title} - SC Market`
      },
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
    <UnheadProvider head={head}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </UnheadProvider>
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
