import { useSearchOrdersQuery } from "../api/ordersApi"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"

/**
 * Hook to get the count of orders needing the seller's attention for a
 * specific shop (not-started + in-progress).
 *
 * Reuses the existing order search endpoint, which returns `item_counts`
 * computed over the full filtered set (independent of pagination), so a
 * page_size of 1 is enough to read the counts cheaply.
 */
export function useShopPendingOrderCount(slug: string | null | undefined): number {
  const { data: shops = [] } = useGetMyShopsQuery(undefined, { skip: !slug })
  const shopId = slug ? shops.find((s) => s.slug === slug)?.shop_id : undefined

  const { data } = useSearchOrdersQuery(
    { shop_id: shopId, page_size: 1, index: 0 },
    { skip: !shopId },
  )

  const counts = data?.item_counts
  if (!counts) return 0
  return (counts["not-started"] || 0) + (counts["in-progress"] || 0)
}
