import React from "react"
import "./fonts.css"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { createRoot } from "react-dom/client"
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
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
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
