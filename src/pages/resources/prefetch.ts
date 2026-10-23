/**
 * Data prefetch for /resources/:resource_id. Args mirror the component's
 * `use*Query` call exactly so the page's subscription hits the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"

/** /resources/:resource_id — ResourceDetail. */
export async function prefetchResourcePage(
  dispatch: PrefetchDispatch,
  params: { resource_id?: string },
): Promise<void> {
  const { resource_id } = params
  if (!resource_id) return

  await settleQuery(
    dispatch(
      marketV2Api.endpoints.getResource.initiate({ resourceId: resource_id }),
    ),
  )
}
