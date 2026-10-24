import { MinimalUser } from "./User"
import { MinimalContractor } from "../features/contractor/domain/types"
import { Order } from "../features/orders/domain/types"

export type BaseListingType =
  | UniqueListing
  | MarketAggregateListingComposite
  | MarketMultipleListingComposite
  | MarketMultipleListing

export interface MarketListing {
  listing_id: string
  sale_type: "auction" | "sale" | "multiple" | "aggregate"
  price: number
  timestamp: string
  quantity_available: number
  status: "active" | "inactive" | "archived"
  user_seller?: MinimalUser | null
  contractor_seller?: MinimalContractor | null
  orders?: Order[] | null
  expiration: string
  internal: boolean
  languages?: Array<{ code: string; name: string }>
  stock_locations?: string[]
}

export interface UniqueListing {
  type: "unique"
  details: ListingDetails
  listing: MarketListing
  accept_offers: boolean
  photos: string[]
  offers?: MarketOffer[]
  bids?: MarketBid[]
  auction_details?: {
    listing_id: string
    status: string
    minimum_bid_increment: number
    end_time: number
  }
  stats?: ListingStats
  view_count?: number
}

export interface ListingStats {
  order_count: number
  offer_count: number
  view_count: number
}

export interface BuyOrder {
  aggregate_id: string
  buy_order_id: string
  quantity: number
  price: number | null
  negotiable?: boolean
  buyer: MinimalUser
  expiry: string
  fulfilled_timestamp: string
}

export interface MarketAggregate {
  type: "aggregate"
  details: ListingDetails
  photos: string[]
  listings: MarketAggregateListing[]
  buy_orders: BuyOrder[]
}

export interface MarketMultipleListingComposite {
  type: "multiple_listing"
  multiple_id: string | number
  details: ListingDetails
  listing: MarketListing
  photos: string[]
}

export interface MarketMultipleListing {
  type: "multiple_listing"
  multiple_id: string | number
  details: ListingDetails
  listing: MarketListing
  photos: string[]
}

export interface ListingDetails {
  details_id: string
  item_type: string
  title: string
  description: string
  item_name: string | null
  game_item_id: string | null
  delivery_preference?: string | null
}

export interface MarketAggregateListingComposite {
  type: "aggregate_composite"
  listing: MarketListing
  aggregate_id: string
  aggregate: {
    aggregate_id: string
    wiki_id: number
    details_id: string
  }
  details: ListingDetails
  photos: string[]
}

export interface MarketAggregateListing {
  aggregate_id: string | number
  listing_id: string
  user_seller?: MinimalUser | null
  contractor_seller?: MinimalContractor | null
  price: number
  timestamp: number
  quantity_available: number
  status: string
}

export interface MarketOffer {
  offer_id: string
  user: MinimalUser | null
  contractor: MinimalContractor | null
  listing_id: string
  quantity: number
  timestamp: number
  offer: number
}

export interface MarketBid {
  bid_id: string
  user_bidder: MinimalUser | null
  contractor_bidder: MinimalContractor | null
  listing_id: string
  timestamp: number
  bid: number
}

export interface MarketListingBody {
  price: number
  title: string
  description: string
  sale_type: string
  item_type: string
  item_name: string | null
  quantity_available: number
  photos: string[]
  minimum_bid_increment: number
  internal: boolean
  status: string
  end_time: Date | null
  spectrum_id?: string | null
  delivery_preference?: string | null
  bulk_discount_tiers?: Array<{ min_quantity: number; discount_percent: number }>
}

export interface MarketListingUpdateBody {
  status?: string
  price?: number
  title?: string
  description?: string
  item_type?: string
  item_name?: string | null
  quantity_available?: number
  photos?: string[]
  minimum_bid_increment?: number
  internal?: boolean
}

export interface GameItemDescription {
  id: string
  name: string
  type: string
  description: string
  image_url: string | null
}
