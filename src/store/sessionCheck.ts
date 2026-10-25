/**
 * App-start session check — GET /api/auth/session.
 *
 * The auth cookies are httpOnly and host-only on the API origin, so the app
 * cannot see whether it is logged in. Before this check it probed: GET
 * /api/profile → 401 → POST /api/auth/refresh → 401, plus a 401 from every
 * other auth-only query, all logged as console errors for every anonymous
 * visitor. The session endpoint instead always answers 200:
 * `{ authenticated: true }` (it rotates an expired access token from the
 * refresh cookie, exactly as /api/auth/refresh would) or
 * `{ authenticated: false }`.
 *
 * Raw fetch, like refreshAuth(): this is part of the auth transport that the
 * base query itself depends on (refreshAuth awaits it), not app data, and it
 * is an express auth route with no generated client.
 *
 * Deploy-order tolerant: anything but a 200 with a boolean `authenticated`
 * (old backend 404, 5xx, 429, network error) resolves "unsupported", and
 * every caller then behaves exactly as before the check existed.
 *
 * BROWSER-ONLY, for the same reason as refreshAuth: the cached result is
 * module-level, i.e. one tab's session.
 */

import { BACKEND_URL } from "../util/constants"
import type { SessionCheckResult } from "./networkEnv"

let result: SessionCheckResult | null = null
let inflight: Promise<SessionCheckResult> | null = null

async function fetchSessionCheck(): Promise<SessionCheckResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/session`, {
      credentials: "include",
      cache: "no-store",
    })
    if (!res.ok) return "unsupported"
    const body: unknown = await res.json()
    const authenticated =
      typeof body === "object" && body !== null && "authenticated" in body
        ? body.authenticated
        : undefined
    if (authenticated === true) return "authenticated"
    if (authenticated === false) return "anonymous"
    return "unsupported"
  } catch {
    return "unsupported"
  }
}

/**
 * Resolve the session state. The first call hits the network; concurrent
 * callers share it and later callers get the cached answer for the rest of
 * the page's life (a login is always a full-page OAuth redirect, which
 * starts a fresh check).
 */
export function checkSession(): Promise<SessionCheckResult> {
  if (result) return Promise.resolve(result)
  if (!inflight) {
    inflight = fetchSessionCheck().then((r) => {
      // A logout during the request wins over its (stale) answer.
      if (!result) result = r
      inflight = null
      return result
    })
  }
  return inflight
}

/** The check's in-flight request, if one is running. */
export function pendingSessionCheck(): Promise<SessionCheckResult> | null {
  return inflight
}

/** The settled answer, or null while unknown / in flight. */
export function sessionCheckResult(): SessionCheckResult | null {
  return result
}

/**
 * The session is gone: logout, or the server rejected the refresh token.
 * Auth-only queries and refresh attempts stop hitting the network.
 */
export function markSessionAnonymous(): void {
  result = "anonymous"
}

/** Test-only: forget the cached answer. */
export function resetSessionCheck(): void {
  result = null
  inflight = null
}
