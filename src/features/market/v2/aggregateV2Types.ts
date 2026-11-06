import { type StandingBuyOrder } from "../../../store/api/v2/market"

/** Row shape for aggregate listings table */
export interface AggregateListingV2Row {
  listing_id: string
  shop_id: string
  shop_slug: string
  shop_name: string
  shop_rating: number
  price_min: number
  price_max: number
  quantity_available: number
  quality_tier_min: number | null
  quality_tier_max: number | null
  variant_count: number
}

/** Row shape for buy orders table */
/** Buy order row type — uses generated StandingBuyOrder + computed total */
export type BuyOrderV2Row = StandingBuyOrder & { total?: number | null }

/** Game item aggregate data */
export interface GameItemAggregateV2 {
  game_item: {
    id: string
    name: string
    type: string
    description: string
    image_url: string
  }
  quality_distribution: Array<{
    quality_tier: number
    listing_count: number
    total_quantity: number
    min_price: number
    avg_price: number
    max_price: number
    shop_count: number
  }>
  listings: AggregateListingV2Row[]
  buy_orders: BuyOrderV2Row[]
  price_history: Array<{
    timestamp: string
    quality_tier: number | null
    avg_price: number
    min_price: number
    max_price: number
    volume: number
  }>
}
