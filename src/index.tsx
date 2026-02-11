import React from "react"
import "./fonts.css"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { createRoot } from "react-dom/client"
import { initPWA } from "./util/pwa"
import { initializeBugsnagAsync, getBugsnagErrorBoundary } from "./util/monitoring/bugsnagLoader"

const container = document.getElementById("root")
const root = createRoot(container!)

// Get error boundary (will use fallback if Bugsnag not loaded yet)
const ErrorBoundary = getBugsnagErrorBoundary(React)

// Initialize Bugsnag asynchronously (non-blocking)
// This happens after page is interactive to avoid blocking critical rendering
initializeBugsnagAsync(import.meta.env.VITE_BUGSNAG_API_KEY || "").catch((error) => {
  // Silently fail - error monitoring is not critical for app functionality
  if (import.meta.env.DEV) {
    console.warn("Bugsnag initialization failed (non-critical):", error)
  }
})

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

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
