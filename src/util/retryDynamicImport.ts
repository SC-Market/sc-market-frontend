/**
 * retryDynamicImport — wraps a dynamic `import()` so a transient failure (a brief
 * network drop, a flaky connection) is retried in place before giving up, instead
 * of immediately surfacing as a route error or a full-page emergency reload.
 *
 * Why this exists: React Router `lazy()` loaders do `(await import(...)).Export`.
 * When the chunk fetch fails, Vite's `__vitePreload` dispatches `vite:preloadError`;
 * our global handler (src/index.tsx) historically `preventDefault()`d it, which made
 * the rejected import resolve to `undefined` — so `.Export` threw the confusing
 * "Can't access <Export> of undefined" TypeError. A ~1s blip should never reach
 * that path: a single retry after a short backoff absorbs it with no reload and no
 * error page.
 *
 * A retry only helps for TRANSIENT failures. A genuinely missing chunk (stale
 * chunk removed by a deploy) fails every attempt; once retries are exhausted we
 * escalate to the deploy-recovery path: a rate-limited full reload to fetch a
 * fresh index.html + chunks. If the reload budget is spent, we rethrow so the
 * route error boundary shows an error page instead of looping.
 *
 * This module owns final-failure recovery. Nothing may preventDefault()
 * `vite:preloadError` (see src/index.tsx): that turns the rejection into an
 * `undefined` resolution. As a second line of defence, an import that resolves
 * to a non-object is treated as a failed attempt here, so a lazy route can never
 * resolve to `undefined` and always goes retry → reload → error page.
 */

import { tryEmergencyReload } from "./assetReloadGuard"

interface RetryOptions {
  /** Number of retry attempts after the initial try. */
  retries?: number
  /** Base backoff in ms; attempt N waits roughly baseDelayMs * 2^(N-1). */
  baseDelayMs?: number
}

const DEFAULT_RETRIES = 2
const DEFAULT_BASE_DELAY_MS = 400

/** A dynamic import resolved to something that is not a module namespace. */
export class MissingModuleError extends Error {
  constructor(value: unknown) {
    super(
      `Dynamic import resolved to ${value === null ? "null" : typeof value} instead of a module`,
    )
    this.name = "MissingModuleError"
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Run a dynamic-import thunk with retry + exponential backoff. Returns the
 * resolved module namespace. Rethrows the last error once retries are exhausted
 * so callers/route boundaries handle a truly missing chunk as before.
 */
export async function retryDynamicImport<T>(
  importFn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { retries = DEFAULT_RETRIES, baseDelayMs = DEFAULT_BASE_DELAY_MS } =
    options

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const module = await importFn()
      if (module === null || typeof module !== "object") {
        // A failed import whose vite:preloadError was cancelled resolves to
        // undefined instead of rejecting. Treat it as the failure it is.
        throw new MissingModuleError(module)
      }
      return module
    } catch (error) {
      lastError = error
      if (attempt === retries) break
      await delay(baseDelayMs * 2 ** attempt)
    }
  }

  // Retries exhausted — this is no longer a transient blip. Most likely a stale
  // chunk removed by a deploy, so escalate to a rate-limited full reload to fetch
  // a fresh index.html + chunks. tryEmergencyReload() is a no-op once the budget
  // is spent; in either case we rethrow so a scheduled reload preempts rendering
  // and, if the budget is spent, the route error boundary shows an error page.
  tryEmergencyReload()
  throw lastError
}
