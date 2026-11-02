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
import { contractorsApi as whiteLabelApi } from "../store/api/contractors"
import { userApi } from "../features/profile/api/profileApi"
import {
  prefetchWikiCommodityPage,
  prefetchWikiItemPage,
} from "../pages/wiki/prefetch"
import { prefetchResourcePage } from "../pages/resources/prefetch"

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
    if (result.error) {
      // Rate limited, a 5xx, a timeout: the page would render its error
      // state, and that would be cached as the page. Fail open instead.
      ssr.failed = `primary ${String(errorStatus(result) ?? "error")}`
      return null
    }
    const whiteLabel = ssr.requestContext.whiteLabel
    await Promise.all([
      prefetch(dispatch, params),
      whiteLabel
        ? prefetchWhiteLabelChrome(dispatch, whiteLabel.domain.spectrum_id)
        : undefined,
    ])
    return null
  }
}

/**
 * On an org's white-label host (the SSR `host` variant): what the app's
 * frame reads for the org on every page, the org itself (the sidebar's
 * brand, Page's favicon) and its sidebar settings (useWhiteLabelSidebar),
 * so the server render and the hydrating render show the same frame.
 */
export async function prefetchWhiteLabelChrome(
  dispatch: PrefetchDispatch,
  spectrumId: string,
): Promise<void> {
  await Promise.all([
    settleQuery(
      dispatch(
        contractorsApi.endpoints.getContractorBySpectrumID.initiate(spectrumId),
      ),
    ),
    settleQuery(
      dispatch(
        whiteLabelApi.endpoints.getWhitelabelSidebar.initiate(spectrumId),
      ),
    ),
  ])
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

// ---------------------------------------------------------------------------
// Game-data detail pages. The detail gates (ships, ores, mining locations,
// blueprints, missions) render their standalone detail page on the server
// and while hydrating (useShowDetailPage), so these load that page's data
// only, never the desktop browser list behind the modal. Every page also
// gets the LIVE game version (the freshness stamp).

const activeVersions = (dispatch: PrefetchDispatch) =>
  settleQuery(dispatch(marketV2Api.endpoints.getActiveVersions.initiate()))

/** The page's own prefetch plus the active game version. */
function withVersions(prefetch: DataPrefetchFn): DataPrefetchFn {
  return async (dispatch, params) => {
    await Promise.all([prefetch(dispatch, params), activeVersions(dispatch)])
  }
}

/** Nothing beyond the primary query (it is the page's data). */
const primaryOnly: DataPrefetchFn = async () => {}

export const itemLoader = ssrLoader(withVersions(prefetchWikiItemPage), {
  query: (dispatch, { id }) =>
    id
      ? settleQuery(
          dispatch(marketV2Api.endpoints.getItemDetail.initiate({ id })),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const commodityLoader = ssrLoader(
  withVersions(prefetchWikiCommodityPage),
  {
    query: (dispatch, { id }) =>
      id
        ? settleQuery(
            dispatch(
              marketV2Api.endpoints.getResource.initiate({ resourceId: id }),
            ),
          )
        : null,
    notFound: V2_NOT_FOUND,
  },
)

export const resourceLoader = ssrLoader(withVersions(prefetchResourcePage), {
  query: (dispatch, { resource_id }) =>
    resource_id
      ? settleQuery(
          dispatch(
            marketV2Api.endpoints.getResource.initiate({
              resourceId: resource_id,
            }),
          ),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const shipLoader = ssrLoader(withVersions(primaryOnly), {
  query: (dispatch, { id }) =>
    id
      ? settleQuery(
          dispatch(marketV2Api.endpoints.getShipDetail.initiate({ id })),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const oreLoader = ssrLoader(withVersions(primaryOnly), {
  query: (dispatch, { name }) =>
    name
      ? settleQuery(
          dispatch(marketV2Api.endpoints.getOreDetail.initiate({ name })),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const miningLocationLoader = ssrLoader(withVersions(primaryOnly), {
  query: (dispatch, { name }) =>
    name
      ? settleQuery(
          dispatch(marketV2Api.endpoints.getLocationDetail.initiate({ name })),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const blueprintLoader = ssrLoader(withVersions(primaryOnly), {
  query: (dispatch, { slug }) =>
    slug
      ? settleQuery(
          dispatch(
            marketV2Api.endpoints.getBlueprintDetail.initiate({
              blueprintId: slug,
            }),
          ),
        )
      : null,
  notFound: V2_NOT_FOUND,
})

export const missionLoader = ssrLoader(withVersions(primaryOnly), {
  query: (dispatch, { slug }) =>
    slug
      ? settleQuery(
          dispatch(
            marketV2Api.endpoints.getMissionDetail.initiate({
              missionId: slug,
            }),
          ),
        )
      : null,
  notFound: V2_NOT_FOUND,
})
