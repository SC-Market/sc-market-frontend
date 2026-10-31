/**
 * Build-time placeholders for the server-rendered routes.
 *
 * With `ssr: false`, React Router only lets routes it prerenders export a
 * server `loader`, and a route needs one to hydrate server HTML in place
 * (without it, React Router reruns the clientLoader on hydration and shows
 * the root HydrateFallback over the page). So react-router.config.ts adds
 * one placeholder path per server-rendered route to `prerender`:
 * entry.server.tsx answers it with an empty page, the loaders do nothing
 * without an SSR context, and scripts/build/finalize.ts deletes the files.
 * The client build is the same as for a prerendered page; the SSR Pages
 * Function renders the real paths at request time.
 */
export const SSR_PLACEHOLDER_SEGMENT = "__ssr-route"

const P = SSR_PLACEHOLDER_SEGMENT

/** One path per server-rendered route pattern (src/routes.ts). */
export const SSR_ROUTE_PLACEHOLDERS: readonly string[] = [
  `/market/${P}`,
  `/shops/${P}`,
  `/shops/${P}/${P}`,
  `/contractor/${P}`,
  `/contractor/${P}/${P}`,
  `/user/${P}`,
  `/user/${P}/${P}`,
]

export function isSsrPlaceholderPath(pathname: string): boolean {
  return pathname.split("/").includes(SSR_PLACEHOLDER_SEGMENT)
}
