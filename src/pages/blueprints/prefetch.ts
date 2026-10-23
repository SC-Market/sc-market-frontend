/**
 * Data prefetch for /blueprints/:slug. Args mirror the components'
 * `use*Query` calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"

/**
 * /blueprints/:slug — BlueprintDetailGate. Mobile renders BlueprintDetail;
 * desktop renders BlueprintBrowser (VersionSelector, categories, the search
 * list) with BlueprintDetailModal auto-opened from :slug. Hover intent
 * implies desktop, so the desktop queries are prefetched too.
 *
 * The search list uses refetchOnMountOrArgChange, so the page still
 * revalidates on mount; the warm entry lets it render immediately instead of
 * showing a skeleton. Its args are the ones BlueprintBrowser uses when the
 * URL has no search params, which is the shape of every detail link.
 *
 * Skipped (auth-only): getUserProfile, getOrgBlueprintOwners (needs the
 * current user's org), getUserBlueprintInventory (logged-in inventory view).
 */
export async function prefetchBlueprintPage(
  dispatch: PrefetchDispatch,
  params: { slug?: string },
): Promise<void> {
  const { slug } = params
  if (!slug) return

  await Promise.all([
    settleQuery(
      dispatch(
        marketV2Api.endpoints.getBlueprintDetail.initiate({ blueprintId: slug }),
      ),
    ),
    settleQuery(dispatch(marketV2Api.endpoints.getActiveVersions.initiate())),
    settleQuery(dispatch(marketV2Api.endpoints.getBlueprintCategories.initiate({}))),
    settleQuery(
      dispatch(
        marketV2Api.endpoints.searchBlueprints.initiate({ page: 1, pageSize: 40 }),
      ),
    ),
  ])
}
