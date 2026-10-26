/**
 * Stale-chunk detection and the user-initiated "new version" reload.
 *
 * A failed lazy chunk is almost always a deploy: the page's index.js points at
 * hashed chunks the new deployment no longer serves. Recovery is a full page
 * load of the SAME URL, which fetches the current index.html and chunks.
 *
 * Automatic recovery stays in retryDynamicImport + assetReloadGuard (retry in
 * place, then a rate-limited reload). This module only (a) recognises the
 * error so the error UI can say "new version, reload" and keep the URL, and
 * (b) performs the reload when the USER clicks. A click is not a loop, so it
 * does not consult or spend the automatic reload budget.
 */
import { MissingModuleError } from "./retryDynamicImport"
import { safeRedirectPath } from "./safeRedirect"

// Browser messages for a dynamic import() / modulepreload that failed to load.
const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i, // Chromium
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /Unable to preload CSS/i, // Vite's CSS preload helper
]

/** True for an error (or an error's string form) caused by a chunk that failed to load. */
export function isChunkLoadError(error: unknown): boolean {
  if (error == null) return false
  if (error instanceof MissingModuleError) return true
  if (error instanceof Error && error.name === "MissingModuleError") return true
  const text =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error)
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(text))
}

/**
 * User-initiated full page load of `target` (default: the current URL).
 * `target` comes from the URL (/error?target=), so it is validated as a
 * same-origin path first.
 */
export function reloadForNewVersion(target?: string | null): void {
  const current =
    window.location.pathname + window.location.search + window.location.hash
  const path = safeRedirectPath(target, current)
  if (path === current) {
    window.location.reload()
  } else {
    window.location.assign(path)
  }
}
