import type { SearchBuyOrdersApiArg } from "../../../store/api/v2/market"

/**
 * The /buyorders page shares the market filter sidebar (MarketSearchAreaV2),
 * whose "Sort By" select writes listing-search values (`sort_by=price`,
 * `quality`, ...) to the URL. The buy-order search endpoint has its own sort
 * keys, so those values are mapped here. Before this existed the page never
 * forwarded `sort_by` / `sort_order` at all, so changing the sort only changed
 * the URL.
 */
export const BUY_ORDER_SORT_FIELDS: Readonly<Record<string, string>> = {
  price: "price_per_unit",
  created_at: "created_at",
  quality: "quality_tier_min",
}

/** Sort args for useSearchBuyOrdersQuery from the page's URL search params. */
export function buyOrderSortArgs(
  searchParams: URLSearchParams,
): Pick<SearchBuyOrdersApiArg, "sortBy" | "sortOrder"> {
  const field = searchParams.get("sort_by") || searchParams.get("sort") || ""
  const sortBy = BUY_ORDER_SORT_FIELDS[field]
  if (!sortBy) return {}
  const order = searchParams.get("sort_order")
  return {
    sortBy,
    sortOrder: order === "asc" ? "asc" : "desc",
  }
}
