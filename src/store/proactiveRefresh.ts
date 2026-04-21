/**
 * Proactive JWT token refresh.
 *
 * The access token expires after 15 minutes. This module refreshes it
 * every 13 minutes so it never expires while the tab is open.
 * Also refreshes when the tab becomes visible after being hidden.
 */

import { BACKEND_URL } from "../util/constants"

const REFRESH_INTERVAL_MS = 13 * 60 * 1000 // 13 minutes
let intervalId: ReturnType<typeof setInterval> | null = null
let lastRefreshAt = 0

async function doRefresh(): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    if (res.ok) {
      lastRefreshAt = Date.now()
    }
  } catch {
    // Silent — reactive refresh (401 handler) is the fallback
  }
}

function onVisibilityChange(): void {
  if (document.visibilityState !== "visible") return
  // If the tab was hidden long enough for the token to expire, refresh now
  const elapsed = Date.now() - lastRefreshAt
  if (elapsed > REFRESH_INTERVAL_MS) {
    doRefresh()
  }
}

export function startProactiveRefresh(): void {
  if (intervalId) return
  lastRefreshAt = Date.now() // Assume token is fresh on login/page load
  intervalId = setInterval(doRefresh, REFRESH_INTERVAL_MS)
  document.addEventListener("visibilitychange", onVisibilityChange)
}

export function stopProactiveRefresh(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  document.removeEventListener("visibilitychange", onVisibilityChange)
}
