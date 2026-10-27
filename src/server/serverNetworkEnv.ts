/**
 * NetworkEnv for the build-time render (entry.server.tsx): anonymous, like
 * every visitor's first render of a prerendered page. No cookies, never a
 * refresh, and the session check answers "anonymous" so auth-only queries
 * are skipped. A new one per render (no shared state).
 */
import type { NetworkEnv } from "../store/networkEnv"

export function createServerNetworkEnv(): NetworkEnv {
  return {
    credentials: "omit",
    headers: {},
    onUnauthorized: async () => false,
    checkSession: async () => "anonymous",
    onLoggedOut: () => {},
  }
}
