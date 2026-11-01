/**
 * Network environment — the environment-specific parts of every API request.
 *
 * The API slices (serviceApi, generatedApi, generatedApiV2) are module-level
 * singletons, so they must not close over anything that differs between
 * environments. Instead, each store is created with a NetworkEnv
 * (`makeStore({ networkEnv })`), which RTK passes to the base query as the
 * thunk `extra` argument. One store = one environment.
 *
 * Today only the browser environment exists (`browserNetworkEnv`, built in
 * ./browserNetworkEnv). A future server render would create its own NetworkEnv
 * PER REQUEST (e.g. credentials "omit", onUnauthorized resolving false,
 * checkSession resolving "anonymous", an SSR service-token header) and must never import the browser one: its refresh
 * mutex/backoff state is module-level and would be shared by every request.
 */

export interface NetworkEnv {
  /**
   * fetch() credentials mode for API requests. Unset on Cloudflare: Workers'
   * fetch doesn't implement the option (and keeps no cookies anyway).
   */
  credentials?: RequestCredentials
  /**
   * The fetch API requests go through (default: the global fetch). The SSR
   * render passes one with a timeout and an edge cache (src/ssr/networkEnv.ts).
   */
  fetchFn?: typeof fetch
  /** Headers added to every API request. */
  headers: Record<string, string>
  /**
   * False: never retry a failed request (the base query's transient-error
   * retries are skipped). The SSR render sets it: it has a 2.5 s budget, and
   * a retried call (backoff included) outlasts it, so the render would time
   * out instead of failing open at once. Default: retry.
   */
  retry?: boolean
  /**
   * Called when a request returns 401. Resolve true if the session was
   * refreshed and the request should be retried once.
   */
  onUnauthorized: () => Promise<boolean>
  /**
   * The app-start session check (GET /api/auth/session). Resolves whether
   * the current cookies are a logged-in session, so auth-only queries can be
   * skipped for anonymous visitors instead of probed (each probe is a 401 in
   * the console). Single-flight and cached for the page: every caller gets
   * the same answer. "unsupported" means the check is unavailable (old
   * backend 404, network/5xx) — callers then fall back to probing.
   */
  checkSession: () => Promise<SessionCheckResult>
  /** The user logged out: from now on the session check reports anonymous. */
  onLoggedOut: () => void
}

export type SessionCheckResult = "authenticated" | "anonymous" | "unsupported"

/** Shape of the thunk `extra` argument every store is created with. */
export interface StoreExtra {
  networkEnv: NetworkEnv
}

/** Read the NetworkEnv a store was created with from RTK's `extra` argument. */
export function getNetworkEnv(extra: unknown): NetworkEnv {
  const networkEnv = (extra as Partial<StoreExtra> | undefined)?.networkEnv
  if (!networkEnv) {
    throw new Error(
      "No NetworkEnv on the store. Create stores with makeStore({ networkEnv }).",
    )
  }
  return networkEnv
}
