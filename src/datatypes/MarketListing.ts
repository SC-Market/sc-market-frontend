import { MinimalUser } from "./User"
import { MinimalContractor } from "./Contractor"
import { Order } from "./Order"
import { Moment } from "moment/moment"

export const item_types = [
  "Armor",
  "Clothing",
  "Weapon",
  "Paint",
  "Bundle",
  "Flair",
  "Addon",
  "Consumable",
  "Other",
] as const
export const item_types_lower = [
  "armor",
  "clothing",
  "weapon",
  "paint",
  "bundle",
  "flair",
  "addon",
  "consumable",
  "other",
] as const

export type ItemType = (typeof item_types_lower)[number]

export type SellerListingType =
  | UniqueListing
  | MarketMultiple
  | MarketAggregateListingComposite
  | MarketMultipleListingComposite

export type StockManageType = UniqueListing | MarketAggregateListingComposite

export type BaseListingType =
  | UniqueListing
  | MarketAggregateListingComposite
  | MarketMultipleListingComposite
  | MarketMultipleListing

export type MarketListingType =
  | SellerListingType
  | MarketAggregate
  | UniqueListing
  | MarketAggregateListingComposite
  | MarketMultiple
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

export interface MinimalAggregate {
  aggregate_id: string
  wiki_id: string | number
  details: ListingDetails
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

export interface MarketMultiple {
  type: "multiple"
  multiple_id: string
  details: ListingDetails
  photos: string[]
  default_listing: MarketMultipleListing
  listings: MarketMultipleListing[]
  contractor_seller: MinimalContractor | null
  user_seller: MinimalUser | null
}

export interface ListingDetails {
  details_id: string
  item_type: string
  title: string
  description: string
  item_name: string | null
  game_item_id: string | null
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

// export interface MarketAggregateListingComposite {
//     aggregate_id: string | number,
//     listing_id: string,
//     user_seller?: MinimalUser | null,
//     contractor_seller?: MinimalContractor | null,
//     price: number,
//     timestamp: number,
//     quantity_available: number,
//     status: string,
//     aggregate: MarketAggregate
// }

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
  end_time: Moment | null
  spectrum_id?: string | null
}

export interface MarketBuyOrderBody {
  price?: number | null
  quantity: number
  game_item_id: string | null
  expiry: Moment
  negotiable?: boolean
}

export interface MarketMultipleBody {
  title: string
  description: string
  item_type: string
  default_listing_id: string
  listings: string[]
}

export interface AggregateMarketListingBody {
  price: number
  quantity_available: number
  wiki_id: number | string
  status: string
  internal: boolean
}

export interface AggregateMarketListing {
  price: number
  quantity_available: number
  aggregate_id: number | string
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

export interface AggregateListingUpdateBody {
  title?: string
  description?: string
  photo?: string
}

// {
//     title: string,
//     description: string,
//     saleType: string,
//     itemType: string,
//     currentPrice: number,
//     quantityAvailable: number
// }

// export function makeMarketListings(): MarketListing[] {
//     return [
//         {
//             price: 100000,
//             kind: "auction",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 0,
//             rating: 4.5
//         },
//         {
//             price: 133134,
//             kind: "auction",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 1,
//             rating: 4.5
//         },
//         {
//             price: 200810,
//             kind: "auction",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 2,
//             rating: 4.5
//         },
//         {
//             price: 50000,
//             kind: "service",
//             title: "Drive Overclocking",
//             description: "Hand overclocking drives",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 3,
//             rating: 4.5
//         },
//         {
//             price: 2000,
//             kind: "service",
//             title: "Drive Recycling",
//             description: "Hand recycled drives",
//             seller: "Henry",
//             photo: "https://media.robertsspaceindustries.com/wj92rqzvhnecb/source.jpg",
//             listing_id: 4,
//             rating: 4.5
//         },
//         {
//             price: 500000,
//             kind: "sale",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 5,
//             rating: 4.5
//         },
//         {
//             price: 500000,
//             kind: "sale",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 6,
//             rating: 4.5
//         },
//         {
//             price: 500000,
//             kind: "sale",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 7,
//             rating: 4.5
//         },
//         {
//             price: 500000,
//             kind: "sale",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 8,
//             rating: 4.5
//         },
//         {
//             price: 500000,
//             kind: "sale",
//             title: "TS-2 Drive Overclocked",
//             description: "Hand overclocked TS-2 drive",
//             seller: "Henry",
//             photo: "https://starcitizen.tools/images/6/6b/QuantumDrive-WETK-TS2.jpg",
//             listing_id: 9,
//             rating: 4.5
//         },
//     ]
// }

export interface GameItemCategory {
  category: string
  subcategory: string
}

export interface GameItem {
  type: string
  name: string
  id: string
  component_size?: number
  component_grade?: string
  component_class?: string
  manufacturer?: string
  component_type?: string
  armor_class?: string
  color?: string
  attributes?: Record<string, string>
}

export interface GameItemDescription {
  id: string
  name: string
  type: string
  description: string
  image_url: string | null
}
