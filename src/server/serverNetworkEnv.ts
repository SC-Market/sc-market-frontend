/**
 * NetworkEnv for server renders (the build-time prerender and the SSR Pages
 * Function): anonymous, like every visitor's first render. No cookies,
 * never a refresh, and the session check answers "anonymous" so auth-only
 * queries are skipped. A new one per render (no shared state).
 *
 * The SSR Function passes its own fetch (src/ssr/apiFetch.ts: timeout,
 * edge cache, never the visitor's headers); there the credentials option
 * is left out, Workers' fetch doesn't implement it.
 */
import type { NetworkEnv } from "../store/networkEnv"

export function createServerNetworkEnv(
  options: { fetchFn?: typeof fetch; retry?: boolean } = {},
): NetworkEnv {
  return {
    ...(options.retry === false ? { retry: false } : {}),
    ...(options.fetchFn
      ? { fetchFn: options.fetchFn }
      : { credentials: "omit" as const }),
    headers: {},
    onUnauthorized: async () => false,
    checkSession: async () => "anonymous",
    onLoggedOut: () => {},
  }
}
