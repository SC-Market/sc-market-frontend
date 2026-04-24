/**
 * Proactive JWT token refresh.
 *
 * The access token expires after 15 minutes. This module refreshes it
 * every 13 minutes so it never expires while the tab is open.
 * Also refreshes when the tab becomes visible after being hidden.
 */

import { refreshAuth } from "./refreshAuth"

const REFRESH_INTERVAL_MS = 13 * 60 * 1000 // 13 minutes
let intervalId: ReturnType<typeof setInterval> | null = null
let lastRefreshAt = 0

function onVisibilityChange(): void {
  if (document.visibilityState !== "visible") return
  if (Date.now() - lastRefreshAt > REFRESH_INTERVAL_MS) {
    refreshAuth().then((ok) => { if (ok) lastRefreshAt = Date.now() })
  }
}

export function startProactiveRefresh(): void {
  if (intervalId) return
  lastRefreshAt = Date.now()
  intervalId = setInterval(() => {
    refreshAuth().then((ok) => { if (ok) lastRefreshAt = Date.now() })
  }, REFRESH_INTERVAL_MS)
  document.addEventListener("visibilitychange", onVisibilityChange)
}

export function stopProactiveRefresh(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  document.removeEventListener("visibilitychange", onVisibilityChange)
}
