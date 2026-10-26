/**
 * retryDynamicImport — wraps a dynamic `import()` so a transient failure (a brief
 * network drop, a flaky connection) is retried in place before giving up, instead
 * of immediately surfacing as a route error or a full-page emergency reload.
 *
 * Why this exists: React Router `lazy()` loaders do `(await import(...)).Export`.
 * When the chunk fetch fails, Vite's `__vitePreload` dispatches `vite:preloadError`;
 * our global handler (src/entry.client.tsx) historically `preventDefault()`d it, which made
 * the rejected import resolve to `undefined` — so `.Export` threw the confusing
 * "Can't access <Export> of undefined" TypeError. A ~1s blip should never reach
 * that path: a single retry after a short backoff absorbs it with no reload and no
 * error page.
 *
 * Two kinds of chunk failure, told apart with one probe of the live app shell:
 *
 * - STALE TAB: a deploy replaced the build this page runs, so its chunks are
 *   gone for good. Waiting cannot help, so after the first failure we go
 *   straight to the rate-limited reload (fresh index.html + chunks).
 * - POST-DEPLOY FLAP: for 10–15 s after a deploy, Cloudflare serves the new
 *   index.html but some requests for the new build's own chunks still 404
 *   (measured on prod, 2026-10-26). The running build IS the live one, so we
 *   keep the route's skeleton up and wait ~15 s (backoff 0.5, 1, 2, 4, 8 s)
 *   before the reload, so the reload lands after the flap.
 *
 * Chromium remembers a failed module fetch for the life of the document: a
 * second import() of the same URL fails without a request (verified in Chrome
 * 155, also for a failed nested dependency). The in-place retries therefore
 * mostly buy time for the reload; they still recover where the browser does
 * refetch and for imports that resolve to undefined. If the reload budget is
 * spent we rethrow so the error UI shows instead of looping.
 *
 * This module owns final-failure recovery. Nothing may preventDefault()
 * `vite:preloadError` (see src/entry.client.tsx): that turns the rejection into an
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

// 5 retries at 0.5, 1, 2, 4, 8 s: ~15.5 s before the reload budget is touched.
const DEFAULT_RETRIES = 5
const DEFAULT_BASE_DELAY_MS = 500

// A failed chunk fetch names its URL (Chromium, Firefox); Safari's message has none.
const FAILED_CHUNK_MESSAGE =
  /dynamically imported module|Importing a module script failed/i

// Any SPA path that is plain static (not a Pages Function, see _routes.json):
// _redirects serves it the current index.html.
const SHELL_PROBE_PATH = "/__app_shell_probe"
const ENTRY_SCRIPT = /\/assets\/index-[A-Za-z0-9_-]+\.js/

/**
 * True when the live index.html references a different entry bundle than the
 * one this page is running, i.e. a deploy replaced our build. Any doubt
 * (dev server, offline, odd HTML) answers false, which only means "wait the
 * normal backoff before reloading".
 */
export async function isRunningBuildStale(): Promise<boolean> {
  try {
    const ours = document.querySelector<HTMLScriptElement>(
      'script[type="module"][src*="/assets/index-"]',
    )?.src
    if (!ours) return false
    const res = await fetch(SHELL_PROBE_PATH, {
      cache: "no-store",
      credentials: "omit",
    })
    if (!res.ok) return false
    const live = (await res.text()).match(ENTRY_SCRIPT)?.[0]
    if (!live) return false
    return new URL(ours, window.location.href).pathname !== live
  } catch {
    return false
  }
}

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
      // Stale tab: the chunk will never come back, reload now.
      if (
        attempt === 0 &&
        FAILED_CHUNK_MESSAGE.test(String(error)) &&
        (await isRunningBuildStale())
      ) {
        break
      }
      await delay(baseDelayMs * 2 ** attempt)
    }
  }

  // Retries exhausted (or the build is stale): escalate to a rate-limited full reload to fetch
  // a fresh index.html + chunks. tryEmergencyReload() is a no-op once the budget
  // is spent; in either case we rethrow so a scheduled reload preempts rendering
  // and, if the budget is spent, the route error boundary shows an error page.
  tryEmergencyReload()
  throw lastError
}
