/**
 * The browser's NetworkEnv: cookie session (credentials "include") and a
 * 401 → POST /api/auth/refresh → retry-once strategy.
 *
 * Browser-only. refreshAuth() keeps module-level mutex/backoff state that is
 * correct for exactly one user (this tab); never use this env on a server.
 */
import type { NetworkEnv } from "./networkEnv"
import { refreshAuth } from "./refreshAuth"

export const browserNetworkEnv: NetworkEnv = {
  credentials: "include",
  headers: {},
  onUnauthorized: refreshAuth,
}
