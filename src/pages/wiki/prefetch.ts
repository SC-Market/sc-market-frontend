/**
 * Data prefetch functions for wiki detail pages. Args mirror the components'
 * `use*Query` calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"

/**
 * /wiki/commodities/:id — WikiCommodityDetail.
 * MiningDataSection searches ores by the resolved resource name, so that
 * query can only start once the resource has loaded.
 */
export async function prefetchWikiCommodityPage(
  dispatch: PrefetchDispatch,
  params: { id?: string },
): Promise<void> {
  const { id } = params
  if (!id) return

  const { data } = await settleQuery(
    dispatch(marketV2Api.endpoints.getResource.initiate({ resourceId: id })),
  )
  const resourceName = data?.resource?.resource_name
  if (!resourceName) return

  await settleQuery(
    dispatch(
      marketV2Api.endpoints.searchOres.initiate({
        text: resourceName,
        pageSize: 5,
      }),
    ),
  )
}

/**
 * /wiki/items/:id — WikiItemDetail (item detail and the "how to get it"
 * acquisition document) plus the Overview tab's PriceHistoryChartV2 and
 * QualityDistributionChart (default tab). Every query takes the route id
 * (UUID or short slug), so they all start at once.
 */
export async function prefetchWikiItemPage(
  dispatch: PrefetchDispatch,
  params: { id?: string },
): Promise<void> {
  const { id } = params
  if (!id) return

  await Promise.all([
    settleQuery(dispatch(marketV2Api.endpoints.getItemDetail.initiate({ id }))),
    settleQuery(
      dispatch(marketV2Api.endpoints.getAcquisition.initiate({ id })),
    ),
    settleQuery(
      dispatch(
        marketV2Api.endpoints.getPriceHistory.initiate({
          gameItemId: id,
          interval: "day",
        }),
      ),
    ),
    settleQuery(
      dispatch(
        marketV2Api.endpoints.getQualityDistribution.initiate({
          gameItemId: id,
        }),
      ),
    ),
  ])
}

/**
 * /wiki/ships/:id — WikiShipDetailGate. Mobile renders WikiShipDetail
 * (getShipDetail); desktop renders WikiShipBrowser (getShips) with
 * ShipDetailModal (getShipDetail). Hover intent implies desktop, so both
 * are prefetched.
 */
export async function prefetchWikiShipPage(
  dispatch: PrefetchDispatch,
  params: { id?: string },
): Promise<void> {
  const { id } = params
  if (!id) return

  await Promise.all([
    settleQuery(dispatch(marketV2Api.endpoints.getShipDetail.initiate({ id }))),
    settleQuery(
      dispatch(marketV2Api.endpoints.getShips.initiate({ pageSize: 500 })),
    ),
  ])
}
