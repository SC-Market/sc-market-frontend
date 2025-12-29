import React from "react"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { createRoot } from "react-dom/client"
import { initPWA } from "./util/pwa"

const container = document.getElementById("root")
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <App />
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
