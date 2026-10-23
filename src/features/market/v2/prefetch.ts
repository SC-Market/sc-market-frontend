/**
 * Data prefetch for /market/:id. Args mirror the components' `use*Query`
 * calls exactly so the page's subscriptions hit the warm cache.
 * See src/router/dataPrefetch.ts for the contract.
 */
import { marketV2Api } from "../../../store/api/v2/market"
import { PrefetchDispatch, settleQuery } from "../../../router/dataPrefetch"

/**
 * /market/:id — ListingDetailV2 and the sections it renders once the listing
 * has loaded: SellerReviews, AggregateMarketDataV2, SellerOtherListingsV2,
 * RelatedListingsV2 and, for auctions, BidAreaV2. Those depend on the
 * resolved listing, so they start after getListingDetail settles.
 *
 * Skipped (auth-only): getUserProfile, getContractorBySpectrumID (only for
 * members of the seller org), getOrdersByListing (ListingOrdersSection,
 * seller only).
 */
export async function prefetchListingPage(
  dispatch: PrefetchDispatch,
  params: { id?: string },
): Promise<void> {
  const { id } = params
  if (!id) return

  const { data } = await settleQuery(
    dispatch(marketV2Api.endpoints.getListingDetail.initiate({ id })),
  )
  const listing = data?.listing
  const seller = data?.seller
  if (!data || !listing || !seller) return

  const items = data.items ?? []
  const firstGameItem = items[0]?.game_item
  const hasPrices = items.some((item) => item.variants.length > 0)

  const queries: Promise<unknown>[] = []

  if (seller.shop_id) {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.getShopReviews.initiate({
            shopId: seller.shop_id,
            pageSize: 3,
          }),
        ),
      ),
    )
  }

  if (firstGameItem?.id && hasPrices) {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.getPriceHistory.initiate({
            gameItemId: firstGameItem.id,
          }),
        ),
      ),
    )
  }

  if (seller.slug) {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.searchListings.initiate({
            shopSlug: seller.slug,
            pageSize: 8,
            sortBy: "created_at",
            sortOrder: "desc",
          }),
        ),
      ),
    )
  }

  if (firstGameItem?.type) {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.searchListings.initiate({
            itemType: firstGameItem.type,
            pageSize: 8,
            sortBy: "created_at",
            sortOrder: "desc",
          }),
        ),
      ),
    )
  }

  if (listing.sale_type === "auction") {
    queries.push(
      settleQuery(
        dispatch(
          marketV2Api.endpoints.getAuctionDetail.initiate({
            listingId: listing.listing_id,
          }),
        ),
      ),
    )
  }

  await Promise.all(queries)
}
