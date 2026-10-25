/**
 * Shared auth refresh — single mutex for the entire app.
 *
 * Every API slice (via browserNetworkEnv.onUnauthorized) and the proactive
 * refresh timer funnel through `refreshAuth()`. Only one POST
 * /api/auth/refresh is ever in flight; all other callers await the same
 * promise.
 *
 * BROWSER-ONLY: `inflight` and `failedAt` are module-level, i.e. one tab's
 * session. On a server they would be shared across every request, so nothing
 * outside the browser NetworkEnv / proactive refresh may import this.
 */

import { BACKEND_URL } from "../util/constants"
import {
  markSessionAnonymous,
  pendingSessionCheck,
  sessionCheckResult,
} from "./sessionCheck"

let inflight: Promise<boolean> | null = null
let failedAt = 0
const BACKOFF_MS = 30_000

/**
 * Attempt to refresh the access token. Returns true on success.
 * Concurrent callers share a single network request.
 */
export function refreshAuth(): Promise<boolean> {
  // The app-start session check (./sessionCheck) already performs the same
  // refresh-token rotation, so:
  //   - while it is in flight, a 401 was for a request sent before it could
  //     rotate — wait for it; if it authenticated, the new cookies are set and
  //     the caller can simply retry (a second rotation would only race it).
  //   - once it said anonymous there is no refresh token to rotate; skip the
  //     request (it could only 401 and log a console error).
  // "unsupported" (old backend) falls through to the original behaviour.
  const pending = pendingSessionCheck()
  if (pending) {
    return pending.then((session) => {
      if (session === "authenticated") return true
      if (session === "anonymous") return false
      return refreshWithToken()
    })
  }
  if (sessionCheckResult() === "anonymous") return Promise.resolve(false)
  return refreshWithToken()
}

function refreshWithToken(): Promise<boolean> {
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
        // 401/403: the server rejected (and cleared) the refresh token — the
        // session is over, stop probing. Other failures may be transient.
        if (res.status === 401 || res.status === 403) markSessionAnonymous()
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
