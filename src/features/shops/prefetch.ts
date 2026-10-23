/**
 * Data prefetch for /shops/:slug[/:tab]. Args mirror the components'
 * `use*Query` calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { marketV2Api } from "../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../router/dataPrefetch"
import {
  SHOP_LISTINGS_PAGE_SIZE,
  SHOP_LISTINGS_TAB,
  shopTabIndex,
} from "./hooks/useShopTab"

/**
 * ShopProfile renders ShopRatingSummary (shop reviews, also used by the
 * reviews tab) once the shop has loaded, plus only the active tab's content.
 *
 * Skipped: the services tab (ServiceListings' args come from the app-wide
 * ServiceSearchContext, which the URL doesn't determine). The about and
 * order tabs issue no queries.
 */
export async function prefetchShopPage(
  dispatch: PrefetchDispatch,
  params: { slug?: string; tab?: string },
): Promise<void> {
  const { slug, tab } = params
  if (!slug) return

  const shopQuery = settleQuery(
    dispatch(marketV2Api.endpoints.getShop.initiate({ slug })),
  ).then(({ data: shop }) => {
    if (!shop) return
    return settleQuery(
      dispatch(
        marketV2Api.endpoints.getShopReviews.initiate({
          shopId: shop.shop_id,
          pageSize: 200,
        }),
      ),
    )
  })

  const queries: Promise<unknown>[] = [shopQuery]

  if (shopTabIndex(tab) === SHOP_LISTINGS_TAB) {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.searchListings.initiate({
            shopSlug: slug,
            page: 1,
            pageSize: SHOP_LISTINGS_PAGE_SIZE,
            sortBy: "created_at",
            sortOrder: "desc",
          }),
        ),
      ),
    )
  }

  await Promise.all(queries)
}
