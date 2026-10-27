/**
 * First page load: start the current page's primary data queries before the
 * app's first render.
 *
 * Without this a page's queries start in its components' effects, i.e. after
 * the first commit of the whole app (the route chunk, the session check and
 * a long first render at 4x CPU: ~2 s on a phone). entry.client.tsx calls
 * prefetchFirstPageData() right after creating the store, in parallel with
 * the page chunk and the session check, so the request is already in flight
 * (often answered) when the page mounts.
 *
 * Every request here must be EXACTLY the one the page's component sends on
 * its first render (same endpoint, same args), so its hook subscription
 * reuses the cache entry instead of fetching again. Where the args are not
 * plain constants they come from a helper the component uses too
 * (listingSearchArgs). Like the hover prefetch (router/dataPrefetch.ts), each
 * query is released once it settles; the data stays cached for the
 * endpoint's keepUnusedDataFor, long past the page's mount.
 *
 * Only the first page load: client navigations get their data through the
 * page (and the link-intent prefetch).
 */
import type { AppDispatch, RootState } from "../store/store"
import { settleQuery } from "./dataPrefetch"
import { marketV2Api } from "../store/api/v2/market"
import { marketApi } from "../features/market/api/marketApi"
import { servicesApi } from "../features/services/api/servicesApi"
import { ordersApi } from "../features/orders/api/ordersApi"
import { offersApi } from "../features/offers/api/offerApi"
import { userApi } from "../features/profile/api/profileApi"
import { listingSearchArgs } from "../features/market/v2/listingSearchArgs"
import {
  LATEST_LISTINGS_ARGS,
  WANTED_NOW_ARGS,
} from "../components/landing/landingLinks"
import { TOP_RATED_SHOPS_COUNT } from "../components/landing/TopRatedShops.skeleton"
import { SERVICE_LISTINGS_PAGE_SIZE } from "../components/skeletons/ServiceListingSkeleton"
import { breakpointsValues } from "../hooks/styles/theme/constants"
import type { SessionCheckResult } from "../store/networkEnv"

export interface FirstPageDataEnv {
  /** The viewport is below `md` (the app's useIsMobile()). */
  isMobile: boolean
  /** The main site (not an org's white-label domain). */
  mainSite: boolean
  /** The session check (auth-only pages wait for "authenticated"). */
  session: Promise<SessionCheckResult>
}

/** useIsMobile() outside React: MUI's `theme.breakpoints.down("md")`. */
export function matchesMobile(): boolean {
  return window.matchMedia(`(max-width:${breakpointsValues.md - 0.05}px)`)
    .matches
}

type Store = { dispatch: AppDispatch; getState: () => RootState }

/**
 * Start the primary queries of the page at `url`. Resolves when they have
 * settled (never rejects); the caller doesn't need to wait for it.
 */
export async function prefetchFirstPageData(
  store: Store,
  url: { pathname: string; search: string },
  env: FirstPageDataEnv,
): Promise<void> {
  const { dispatch } = store
  const { pathname } = url
  const queries: Promise<unknown>[] = []

  // /market/services: ServiceListings' first page (features/services).
  if (pathname === "/market/services") {
    queries.push(
      settleQuery(
        dispatch(
          servicesApi.endpoints.getPublicServices.initiate({
            page: 0,
            pageSize: SERVICE_LISTINGS_PAGE_SIZE,
            sortBy: "timestamp",
            sortOrder: "desc",
          }),
        ),
      ),
    )
  }

  // /market and /market/category/*: ListingSearchV2's results grid.
  if (pathname === "/market" || pathname.startsWith("/market/category/")) {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.searchListings.initiate(
            listingSearchArgs(new URLSearchParams(url.search), env.isMobile),
          ),
        ),
      ),
    )
  }

  // /: the hero (stats, live listings total = "Latest listings", "Wanted
  // now") and "Top rated shops". A white-label domain redirects instead.
  if (pathname === "/" && env.mainSite) {
    queries.push(
      settleQuery(dispatch(marketApi.endpoints.getMarketStats.initiate())),
      settleQuery(
        dispatch(
          marketV2Api.endpoints.searchListings.initiate(LATEST_LISTINGS_ARGS),
        ),
      ),
      settleQuery(
        dispatch(
          marketV2Api.endpoints.searchBuyOrders.initiate(WANTED_NOW_ARGS),
        ),
      ),
      settleQuery(
        dispatch(
          marketV2Api.endpoints.browseShops.initiate({
            page: 1,
            pageSize: TOP_RATED_SHOPS_COUNT,
            sortBy: "rating",
            sortOrder: "desc",
          }),
        ),
      ),
    )
  }

  // /dashboard (MemberDashboard, personal): the assigned orders and the
  // received offers (its primary content), for a returning signed-in
  // visitor whose profile is cached (the args carry the username). Auth-only:
  // nothing is sent unless the session check says signed in.
  // (Read after the session check: the seeded profile lands in the store
  // asynchronously.)
  if (pathname === "/dashboard" && (await env.session) === "authenticated") {
    const username = userApi.endpoints.profileGetUserProfile.select()(
      store.getState(),
    ).data?.username
    if (username) {
      queries.push(
        settleQuery(
          dispatch(
            ordersApi.endpoints.searchOrders.initiate({
              status: "active",
              index: 0,
              page_size: 5,
              assigned: username,
              sort_method: "timestamp",
              reverse_sort: true,
            }),
          ),
        ),
        settleQuery(
          dispatch(
            offersApi.endpoints.searchOfferSessions.initiate({
              status: "to-seller",
              index: 0,
              page_size: 5,
              assigned: username,
              sort_method: "timestamp",
              reverse_sort: true,
            }),
          ),
        ),
      )
    }
  }

  await Promise.all(queries)
}
