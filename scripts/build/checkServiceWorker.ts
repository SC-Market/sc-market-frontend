/**
 * The service worker must stay push-only: no precache, no routing, no fetch
 * handler. An asset-caching SW served stale chunks after deploys and caused
 * crash loops ("hard refresh works, normal refresh crashes"); see src/sw.ts.
 *
 * Run on the BUILT sw.js by scripts/build/finalize.ts (so a dependency that
 * sneaks one in is caught too) and on src/sw.ts by its unit test.
 */
const FORBIDDEN: Array<[RegExp, string]> = [
  [/precacheAndRoute\s*\(/, "precacheAndRoute()"],
  [/registerRoute\s*\(/, "registerRoute()"],
  [/__WB_MANIFEST/, "a workbox precache manifest"],
  [/addEventListener\(\s*["'`]fetch["'`]/, 'addEventListener("fetch")'],
  [/\bonfetch\s*=/, "an onfetch handler"],
  [/workbox-(precaching|routing|strategies)/, "workbox precaching/routing"],
]

export function serviceWorkerViolations(code: string): string[] {
  return FORBIDDEN.filter(([pattern]) => pattern.test(code)).map(
    ([, what]) => what,
  )
}

export function checkServiceWorker(code: string): void {
  const violations = serviceWorkerViolations(code)
  if (violations.length > 0) {
    throw new Error(
      `sw.js must not precache or handle fetches (see src/sw.ts); found: ${violations.join(", ")}`,
    )
  }
}
