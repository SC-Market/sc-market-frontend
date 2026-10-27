/**
 * The listings search request for the market page (/market): its URL
 * params (V2 names, or the V1 ones still in old links) and the page size for
 * the viewport. ListingSearchV2 sends exactly this, and the first-page data
 * prefetch (src/router/firstPageData.ts) starts the same request before the
 * page has rendered, so both must build it here.
 */
import type { SearchListingsApiArg } from "../../../store/api/v2/market"

/** Results per page when the URL doesn't say (`isMobile`: below `md`). */
export function defaultListingPageSize(isMobile: boolean): number {
  return isMobile ? 12 : 48
}

export function listingSearchArgs(
  searchParams: URLSearchParams,
  isMobile: boolean,
): SearchListingsApiArg {
  const text =
    searchParams.get("text") || searchParams.get("query") || undefined
  const gameItemId = searchParams.get("game_item_id") || undefined
  const qualityTierMin = searchParams.get("quality_tier_min")
  const qualityTierMax = searchParams.get("quality_tier_max")
  const qualityValueMin = searchParams.get("quality_value_min")
  const qualityValueMax = searchParams.get("quality_value_max")
  const priceMin = searchParams.get("price_min") || searchParams.get("minCost")
  const priceMax = searchParams.get("price_max") || searchParams.get("maxCost")
  const page = searchParams.get("page") || searchParams.get("index")
  const pageSize = searchParams.get("page_size")
  const sortBy = (searchParams.get("sort_by") ||
    searchParams.get("sort")) as SearchListingsApiArg["sortBy"]
  const sortOrder = searchParams.get("sort_order") as "asc" | "desc" | undefined
  const itemType =
    searchParams.get("item_type") || searchParams.get("type") || undefined
  const quantityMin =
    searchParams.get("quantity_min") || searchParams.get("quantityAvailable")
  const status = (searchParams.get("status") ||
    searchParams.get("statuses") ||
    undefined) as "active" | "sold" | "expired" | "cancelled" | undefined
  const shopSlug =
    searchParams.get("shop_slug") || searchParams.get("shop") || undefined

  return {
    text,
    gameItemId,
    qualityTierMin: qualityTierMin ? Number(qualityTierMin) : undefined,
    qualityTierMax: qualityTierMax ? Number(qualityTierMax) : undefined,
    qualityValueMin: qualityValueMin ? Number(qualityValueMin) : undefined,
    qualityValueMax: qualityValueMax ? Number(qualityValueMax) : undefined,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : defaultListingPageSize(isMobile),
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    itemType,
    quantityMin: quantityMin ? Number(quantityMin) : 1,
    status,
    languageCodes: searchParams.get("language_codes") || undefined,
    pickupMethod: (searchParams.get("pickup_method") || undefined) as
      | "delivery"
      | "pickup"
      | "any"
      | undefined,
    shopSlug,
    inStock: searchParams.get("in_stock") === "true" ? true : undefined,
    hasPhotos: searchParams.get("has_photos") === "true" ? true : undefined,
    bulkDiscount:
      searchParams.get("bulk_discount") === "true" ? true : undefined,
  }
}
