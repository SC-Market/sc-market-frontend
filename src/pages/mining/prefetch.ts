/**
 * Data prefetch functions for mining detail pages. Args mirror the components'
 * `use*Query` calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 *
 * Both detail routes are viewport gates: mobile renders the full-page detail,
 * desktop renders MiningPage (VersionSelector + the browser for the tab the
 * path selects) with the detail modal auto-opened from :name. Hover intent
 * implies desktop, so the desktop queries are prefetched too. The browser's
 * list query is prefetched with the args it uses when the URL has no search
 * params, which is the shape of every detail link.
 */
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"
import { MINING_LOCATION_PAGE_SIZE, MINING_ORE_PAGE_SIZE } from "./constants"

/** /mining/ores/:name — MiningOreDetailGate. */
export async function prefetchMiningOrePage(
  dispatch: PrefetchDispatch,
  params: { name?: string },
): Promise<void> {
  const { name } = params
  if (!name) return

  await Promise.all([
    settleQuery(dispatch(marketV2Api.endpoints.getOreDetail.initiate({ name }))),
    settleQuery(dispatch(marketV2Api.endpoints.getActiveVersions.initiate())),
    settleQuery(
      dispatch(
        marketV2Api.endpoints.searchOres.initiate({
          page: 1,
          pageSize: MINING_ORE_PAGE_SIZE,
        }),
      ),
    ),
  ])
}

/** /mining/locations/:name — MiningLocationDetailGate. */
export async function prefetchMiningLocationPage(
  dispatch: PrefetchDispatch,
  params: { name?: string },
): Promise<void> {
  const { name } = params
  if (!name) return

  await Promise.all([
    settleQuery(
      dispatch(marketV2Api.endpoints.getLocationDetail.initiate({ name })),
    ),
    settleQuery(dispatch(marketV2Api.endpoints.getActiveVersions.initiate())),
    settleQuery(
      dispatch(
        marketV2Api.endpoints.searchLocations.initiate({
          page: 1,
          pageSize: MINING_LOCATION_PAGE_SIZE,
        }),
      ),
    ),
  ])
}
