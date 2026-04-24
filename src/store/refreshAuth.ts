/**
 * Shared auth refresh — single mutex for the entire app.
 *
 * Every API slice and the proactive refresh timer funnel through
 * `refreshAuth()`. Only one POST /api/auth/refresh is ever in flight;
 * all other callers await the same promise.
 */

import { BACKEND_URL } from "../util/constants"

let inflight: Promise<boolean> | null = null
let failedAt = 0
const BACKOFF_MS = 30_000

/**
 * Attempt to refresh the access token. Returns true on success.
 * Concurrent callers share a single network request.
 */
export function refreshAuth(): Promise<boolean> {
  // Circuit breaker — don't hammer the endpoint after a failure
  if (Date.now() - failedAt < BACKOFF_MS) return Promise.resolve(false)

  if (!inflight) {
    inflight = fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          failedAt = 0
          return true
        }
        failedAt = Date.now()
        return false
      })
      .catch(() => {
        failedAt = Date.now()
        return false
      })
      .finally(() => {
        inflight = null
      })
  }

  return inflight
}

/** Reset the circuit breaker (e.g. after a fresh login). */
export function resetRefreshBackoff(): void {
  failedAt = 0
}
