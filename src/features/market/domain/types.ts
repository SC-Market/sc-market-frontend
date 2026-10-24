/**
 * Market feature domain types.
 * - API/search types (from former store/market) are defined here.
 * - Core listing types are re-exported from datatypes/MarketListing.
 */

import type { MinimalUser } from "../../../datatypes/User"

// Re-export core listing types from datatypes (used by API and views).
// We omit MarketBid from datatypes to avoid conflict with API MarketBid (see MarketBidApi below).
export type {
  MarketListing,
  BaseListingType,
  ListingStats,
  MarketListingBody,
  UniqueListing,
  ListingDetails,
  MarketAggregate,
  MarketAggregateListing,
  MarketAggregateListingComposite,
  MarketMultipleListing,
  MarketMultipleListingComposite,
  MarketOffer,
  BuyOrder,
  MarketBid as DatatypesMarketBid,
  MarketListingUpdateBody,
  GameItemDescription,
} from "../../../datatypes/MarketListing"

// --- API / search types (from former store/market) ---

export interface BaseMarketListingSearchResult {
  listing_id: string
  item_type: string
  item_name: string | null
  game_item_id: string | null
  price: number
  expiration: string
  minimum_price: number
  maximum_price: number
  quantity_available: number
  timestamp: string
  total_rating: number
  avg_rating: number
  details_id: string
  status: "active" | "inactive" | "archived"
  user_seller: string | null
  contractor_seller: string | null
  rating_count: number
  rating_streak: number
  total_orders: number
  total_assignments: number
  response_rate: number
  title: string
  photo: string
  internal: boolean
  badges?: {
    badge_ids: string[]
    metadata: unknown
  } | null
  languages?: Array<{ code: string; name: string }>
  bulk_discount_tiers?: Array<{ min_quantity: number; discount_percent: number }> | null
}

export type ExtendedUniqueSearchResult = BaseMarketListingSearchResult & {
  listing_type: "unique"
  sale_type: "sale" | "auction"
  auction_end_time?: string | null
}

export type ExtendedAggregateSearchResult = BaseMarketListingSearchResult & {
  listing_type: "aggregate"
  sale_type: "aggregate"
}

export type ExtendedMultipleSearchResult = BaseMarketListingSearchResult & {
  listing_type: "multiple"
  sale_type: "multiple"
}

export type MarketListingSearchResult =
  | ExtendedUniqueSearchResult
  | ExtendedAggregateSearchResult
  | ExtendedMultipleSearchResult

/** API response shape for a bid (getListingBids / createListingBid). */
export interface MarketBidApi {
  bid_id: string
  listing_id: string
  bidder: {
    user_id?: string | null
    contractor_id?: string | null
    username: string
    display_name: string
  }
  bid_amount: number
  timestamp: string
}

export type SaleType = "sale" | "aggregate" | "multiple" | "auction"

export type MarketSearchParams = Partial<{
  query: string
  statuses: string
  sale_type: SaleType | "any"
  item_type: string
  minCost: number | string | null
  maxCost: number | string | null
  user_seller: string
  contractor_seller: string
  page: number | string
  rating: string | null | number
  quantityAvailable: string | number
  sort: string | null
  seller_rating: string | number
  index: string | number
  page_size: string | number
  listing_type: string | null
  language_codes: string
}>

export interface MarketSearchResult {
  total: number
  listings: MarketListingSearchResult[]
}

export interface MarketStats {
  total_orders: number
  total_order_value: number
  week_orders: number
  week_order_value: number
}

/** UI/search state for market filters (URL-synced). */
export interface MarketSearchState {
  sale_type?: (SaleType | "any") | undefined
  item_type?: string | undefined
  minCost?: number
  maxCost?: number | null
  quantityAvailable?: number
  query: string
  sort?: string | null | undefined
  statuses?: string
  index?: number
  page_size?: number
  listing_type?: string
  language_codes?: string[]
  attributes?: Record<string, string[]>
}

export type SaleTypeSelect = SaleType | "any"
