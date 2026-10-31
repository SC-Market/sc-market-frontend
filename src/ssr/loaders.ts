/**
 * React Router `loader`s of the server-rendered entity pages
 * (docs/ssr-worker.md).
 *
 * On the SSR Pages Function a loader runs the page's prefetch function (the
 * same `prefetchXPage` the link-intent prefetch uses: generated endpoints
 * only, exactly the args the page's hooks pass) on the request's store, so
 * the single render that follows has the page's data. If the page's primary
 * entity doesn't exist it marks the request not found (the Function then
 * answers 404).
 *
 * At build time (no SSR context: the route placeholders React Router
 * "prerenders", see src/ssr/routePlaceholders.ts) they do nothing.
 *
 * In the browser they never run: each route keeps its clientLoader, which
 * doesn't call the server loader, so client navigations never request
 * `.data` from the Function. React Router strips `loader` from the client
 * bundle.
 */
import type { LoaderFunctionArgs } from "react-router"
import {
  settleQuery,
  type DataPrefetchFn,
  type PrefetchDispatch,
  type RouteParams,
} from "../router/dataPrefetch"
import { getSsrRequest } from "./context"
import { prefetchListingPage } from "../features/market/v2/prefetch"
import { prefetchShopPage } from "../features/shops/prefetch"
import { prefetchOrgPage } from "../features/contractor/prefetch"
import { prefetchUserProfilePage } from "../features/profile/prefetch"
import { marketV2Api } from "../store/api/v2/market"
import { contractorsApi } from "../features/contractor/api/contractorApi"
import { userApi } from "../features/profile/api/profileApi"

/** v2 answers 404 for an unknown entity; v1 (orgs, users) 400 or 404. */
const V2_NOT_FOUND: readonly unknown[] = [404]
const V1_NOT_FOUND: readonly unknown[] = [400, 404]

/**
 * The page's primary query (the same one its prefetch function starts
 * first, so the prefetch reuses the answer) and its "doesn't exist" statuses.
 */
interface Primary {
  query: (
    dispatch: PrefetchDispatch,
    params: RouteParams,
  ) => Promise<{ error?: unknown }> | null
  notFound: readonly unknown[]
}

function errorStatus(result: { error?: unknown }): unknown {
  return (result.error as { status?: unknown } | undefined)?.status
}

function ssrLoader(prefetch: DataPrefetchFn, primary: Primary) {
  return async function loader({
    params,
    context,
  }: LoaderFunctionArgs): Promise<null> {
    const ssr = getSsrRequest(context)
    if (!ssr) return null
    const { dispatch } = ssr.store
    const result = await primary.query(dispatch, params)
    if (!result || primary.notFound.includes(errorStatus(result))) {
      ssr.notFound = true
      return null
    }
    await prefetch(dispatch, params)
    return null
  }
}

export const listingLoader = ssrLoader(prefetchListingPage, {
  query: (dispatch, { id }) =>
    id
      ? settleQuery(
          dispatch(marketV2Api.endpoints.getListingDetail.initiate({ id })),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const shopLoader = ssrLoader(prefetchShopPage, {
  query: (dispatch, { slug }) =>
    slug
      ? settleQuery(dispatch(marketV2Api.endpoints.getShop.initiate({ slug })))
      : null,
  notFound: V2_NOT_FOUND,
})

export const orgLoader = ssrLoader(prefetchOrgPage, {
  query: (dispatch, { id }) =>
    id
      ? settleQuery(
          dispatch(
            contractorsApi.endpoints.getContractorBySpectrumID.initiate(id),
          ),
        )
      : null,
  notFound: V1_NOT_FOUND,
})

export const userLoader = ssrLoader(prefetchUserProfilePage, {
  query: (dispatch, { username }) =>
    username
      ? settleQuery(
          dispatch(userApi.endpoints.profileGetUserByName.initiate(username)),
        )
      : null,
  notFound: V1_NOT_FOUND,
})
