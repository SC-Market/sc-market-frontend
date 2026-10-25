/**
 * The browser's NetworkEnv: cookie session (credentials "include"), the
 * GET /api/auth/session app-start check, and a
 * 401 → POST /api/auth/refresh → retry-once strategy.
 *
 * Browser-only. refreshAuth() and checkSession() keep module-level state
 * that is correct for exactly one user (this tab); never use this env on a
 * server.
 */
import type { NetworkEnv } from "./networkEnv"
import { refreshAuth } from "./refreshAuth"
import { checkSession, markSessionAnonymous } from "./sessionCheck"

export const browserNetworkEnv: NetworkEnv = {
  credentials: "include",
  headers: {},
  onUnauthorized: refreshAuth,
  checkSession,
  onLoggedOut: markSessionAnonymous,
}
