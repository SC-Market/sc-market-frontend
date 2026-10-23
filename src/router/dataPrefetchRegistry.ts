/**
 * Data prefetch registry: maps public route patterns (as declared in
 * src/App.tsx) to the page's data prefetch function. Used for hover/intent
 * prefetch today; each entry is the future react-router loader for its route.
 */
import { matchRoutes } from "react-router-dom"
import type { DataPrefetchFn, PrefetchDispatch, RouteParams } from "./dataPrefetch"
import {
  prefetchWikiCommodityPage,
  prefetchWikiItemPage,
  prefetchWikiShipPage,
} from "../pages/wiki/prefetch"
import {
  prefetchMiningLocationPage,
  prefetchMiningOrePage,
} from "../pages/mining/prefetch"
import { prefetchBlueprintPage } from "../pages/blueprints/prefetch"
import { prefetchResourcePage } from "../pages/resources/prefetch"
import { prefetchListingPage } from "../features/market/v2/prefetch"
import { prefetchShopPage } from "../features/shops/prefetch"
import { prefetchOrgPage } from "../features/contractor/prefetch"
import { prefetchUserProfilePage } from "../features/profile/prefetch"

export interface DataPrefetchRoute {
  path: string
  prefetch: DataPrefetchFn
}

export const DATA_PREFETCH_ROUTES: readonly DataPrefetchRoute[] = [
  { path: "/wiki/commodities/:id", prefetch: prefetchWikiCommodityPage },
  { path: "/wiki/items/:id", prefetch: prefetchWikiItemPage },
  { path: "/wiki/ships/:id", prefetch: prefetchWikiShipPage },
  { path: "/mining/ores/:name", prefetch: prefetchMiningOrePage },
  { path: "/mining/locations/:name", prefetch: prefetchMiningLocationPage },
  { path: "/blueprints/:slug", prefetch: prefetchBlueprintPage },
  { path: "/resources/:resource_id", prefetch: prefetchResourcePage },
  { path: "/market/:id", prefetch: prefetchListingPage },
  { path: "/shops/:slug", prefetch: prefetchShopPage },
  { path: "/shops/:slug/:tab", prefetch: prefetchShopPage },
  { path: "/contractor/:id", prefetch: prefetchOrgPage },
  { path: "/contractor/:id/:tab", prefetch: prefetchOrgPage },
  { path: "/user/:username", prefetch: prefetchUserProfilePage },
  { path: "/user/:username/:tab", prefetch: prefetchUserProfilePage },
]

/**
 * Static src/App.tsx routes at the same depth as a dynamic pattern above.
 * react-router ranks static segments over dynamic ones (so "/market/cart"
 * renders the cart, not a listing called "cart"); matching against them too
 * keeps this registry's ranking identical to the router's.
 */
const STATIC_SIBLING_PATHS: readonly string[] = [
  "/market/services",
  "/market/create",
  "/market/me",
  "/market/manage",
  "/market/manage-stock",
  "/market/cart",
  "/shops/create",
  "/blueprints/inventory",
]

const ROUTES_BY_PATH = new Map(DATA_PREFETCH_ROUTES.map((r) => [r.path, r]))
const MATCH_ROUTES = [
  ...DATA_PREFETCH_ROUTES.map(({ path }) => ({ path })),
  ...STATIC_SIBLING_PATHS.map((path) => ({ path })),
]

export interface DataPrefetchMatch {
  route: DataPrefetchRoute
  params: RouteParams
}

/** Strip query string and hash from an app-relative link target. */
function toPathname(to: string): string {
  return to.split(/[?#]/)[0]
}

/**
 * Find the data prefetch route for an app-relative link target (which may
 * carry a query string or hash), ranked the same way react-router ranks
 * src/App.tsx routes. Returns null when the target has no data prefetch.
 */
export function matchDataPrefetchRoute(to: string): DataPrefetchMatch | null {
  const matches = matchRoutes(MATCH_ROUTES, toPathname(to))
  const match = matches?.[matches.length - 1]
  const route = match?.route.path ? ROUTES_BY_PATH.get(match.route.path) : undefined
  if (!match || !route) return null
  return { route, params: match.params }
}

/** Data prefetch promises by pathname, so each URL is prefetched once. */
const prefetchedPaths = new Map<string, Promise<void>>()

/**
 * Prefetch the data a link target's page needs on first render. Runs at most
 * once per pathname; later calls return the first call's promise. Resolves
 * when every query has settled; never rejects.
 */
export function prefetchDataForPath(
  dispatch: PrefetchDispatch,
  to: string,
): Promise<void> {
  const pathname = toPathname(to)
  const existing = prefetchedPaths.get(pathname)
  if (existing) return existing

  const match = matchDataPrefetchRoute(pathname)
  if (!match) return Promise.resolve()

  const promise = match.route
    .prefetch(dispatch, match.params)
    .catch((error: unknown) => {
      console.warn(`Failed to prefetch data for ${pathname}:`, error)
    })
  prefetchedPaths.set(pathname, promise)
  return promise
}

/** Clear the once-per-URL record (useful for testing). */
export function clearDataPrefetchCache(): void {
  prefetchedPaths.clear()
}
