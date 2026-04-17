/**
 * Rate-limited full page reload when assets fail (post-deploy hash mismatch, etc.).
 * Must stay in sync with the inline script in index.html (same keys / limits).
 */
const ATTEMPTS_KEY = "scmarket_asset_reload_attempts"
const WINDOW_START_KEY = "scmarket_asset_reload_window_start"

const MAX_ATTEMPTS = 2
const WINDOW_MS = 120_000

function parseAttempts(): { n: number; windowStart: number } {
  const now = Date.now()
  let windowStart = parseInt(
    sessionStorage.getItem(WINDOW_START_KEY) || "0",
    10,
  )
  let n = parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || "0", 10)
  if (!windowStart || now - windowStart > WINDOW_MS) {
    windowStart = now
    n = 0
    sessionStorage.setItem(WINDOW_START_KEY, String(windowStart))
    sessionStorage.setItem(ATTEMPTS_KEY, "0")
  }
  return { n, windowStart }
}

/** Returns true if a reload was triggered. */
export function tryEmergencyReload(): boolean {
  try {
    const { n } = parseAttempts()
    if (n >= MAX_ATTEMPTS) return false
    sessionStorage.setItem(ATTEMPTS_KEY, String(n + 1))
    window.location.reload()
    return true
  } catch {
    return false
  }
}

/** Call after the app has been stable so a future deploy can auto-retry again. */
export function clearEmergencyReloadBudget(): void {
  try {
    sessionStorage.removeItem(ATTEMPTS_KEY)
    sessionStorage.removeItem(WINDOW_START_KEY)
  } catch {
    /* ignore */
  }
}
