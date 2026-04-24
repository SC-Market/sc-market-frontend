import type { MinimalUser } from "../../../datatypes/User"
import type { MinimalContractor } from "../../contractor/domain/types"
import type { OrderAvailability, Service } from "../../orders/domain/types"
import type { UniqueListing } from "../../market"

// ── Offer Status ──

/** Status values as returned by the API (both V1 and V2) */
export type OfferSessionStatus =
  | "to-seller"
  | "to-customer"
  | "accepted"
  | "rejected"
  | "counteroffered"

/** Legacy display strings from V1 API — mapped to OfferSessionStatus for backward compat */
export type OfferSessionDisplayStatus =
  | "Waiting for Seller"
  | "Waiting for Customer"
  | "Accepted"
  | "Rejected"

/** Normalized UI keys used for rendering logic (colors, icons, showAccept) */
export type OfferStatusKey =
  | "waitingSeller"
  | "waitingCustomer"
  | "accepted"
  | "rejected"

/** Map any status string (API, display, or already-normalized) to a UI key */
export function normalizeOfferStatus(status: string): OfferStatusKey {
  switch (status) {
    case "to-seller":
    case "Waiting for Seller":
    case "counteroffered":
    case "waitingSeller":
      return "waitingSeller"
    case "to-customer":
    case "Waiting for Customer":
    case "waitingCustomer":
      return "waitingCustomer"
    case "accepted":
    case "Accepted":
      return "accepted"
    case "rejected":
    case "Rejected":
      return "rejected"
    default:
      console.warn(`[normalizeOfferStatus] Unknown offer status: "${status}"`)
      return "waitingSeller" // Safe default — shows accept button for seller
  }
}

// ── Core Entities ──

export interface OfferSessionStub {
  id: string
  contractor: MinimalContractor | null
  assigned_to: MinimalUser | null
  customer: MinimalUser
  status: string
  timestamp: string
  most_recent_offer: {
    service_name: string | null
    cost: string
    title: string
    payment_type: string
    count: number
  }
}

export interface OfferSession {
  id: string
  contractor: MinimalContractor | null
  assigned_to: MinimalUser | null
  customer: MinimalUser
  status: string
  timestamp: string
  offers: Offer[]
  contract_id?: string | null
  discord_thread_id: string | null
  discord_server_id: string | null
  discord_invite: string | null
  availability: OrderAvailability
  order_id?: string | null
}

export interface OfferVariantItemV2 {
  listing_id: string
  variant_id: string
  quantity: number
  price_per_unit: number
  attributes: Record<string, any>
  display_name: string
  short_name: string
}

export interface Offer {
  id: string
  session_id: string
  actor: MinimalUser | null
  kind: string
  cost: string
  title: string
  description: string
  timestamp: string
  status: string
  collateral?: string | number | null
  service: Service | null
  market_listings: OfferMarketListing[]
  market_listings_v2?: Array<{
    listing_id: string
    title: string
    price: number
    quantity: number
    variants: OfferVariantItemV2[]
  }>
  payment_type: "one-time" | "hourly" | "daily"
  v2_variant_items?: OfferVariantItemV2[]
}

export interface CounterOfferBody {
  session_id: string
  title: string
  kind: string
  cost: string
  description: string
  service_id: string | null
  market_listings: { listing_id: string; quantity: number }[]
  payment_type: string
  status: "counteroffered"
  v2_variant_items?: {
    listing_id: string
    variant_id: string
    quantity: number
    price_per_unit: number
  }[]
}

export interface OfferMarketListing {
  quantity: number
  listing_id: string
  listing: UniqueListing
}

export type OfferSearchSortMethod =
  | "title"
  | "customer_name"
  | "status"
  | "timestamp"
  | "contractor_name"

export type OfferSearchStatus =
  | "to-seller"
  | "to-customer"
  | "accepted"
  | "rejected"

export interface OfferSearchQuery {
  sort_method?: OfferSearchSortMethod
  status?: OfferSearchStatus
  assigned?: string
  contractor?: string
  customer?: string
  index?: number
  page_size?: number
  reverse_sort?: boolean
  buyer_username?: string
  seller_username?: string
  has_market_listings?: boolean
  has_service?: boolean
  cost_min?: number
  cost_max?: number
  date_from?: string
  date_to?: string
}

export const OFFER_SEARCH_SORT_METHODS = [
  "title",
  "customer_name",
  "status",
  "timestamp",
  "contractor_name",
] as const

export const OFFER_SEARCH_STATUS = [
  "to-seller",
  "to-customer",
  "accepted",
  "rejected",
] as const
