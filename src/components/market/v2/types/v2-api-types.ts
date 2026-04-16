/**
 * Market V2 API Types
 * 
 * TypeScript types for the Market V2 API matching the backend types.
 * These will eventually be replaced by generated types from OpenAPI spec.
 */

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Search listings with filters
 */
export interface SearchListingsRequest {
  text?: string
  game_item_id?: string
  quality_tier_min?: number
  quality_tier_max?: number
  quality_value_min?: number
  crafted_only?: boolean
  price_min?: number
  price_max?: number
  page: number
  page_size: number
}

/**
 * Create new listing with variants
 */
export interface CreateListingRequest {
  title: string
  description: string
  game_item_id: string
  pricing_mode: "unified" | "per_variant"
  base_price?: number
  lots: Array<{
    quantity: number
    variant_attributes: VariantAttributes
    location_id?: string
    price?: number
  }>
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Search results with pagination
 */
export interface SearchListingsResponse {
  listings: Array<{
    listing_id: string
    title: string
    seller_name: string
    seller_rating: number
    price_min: number
    price_max: number
    quantity_available: number
    quality_tier_min: number
    quality_tier_max: number
    variant_count: number
    created_at: Date
  }>
  total: number
  page: number
  page_size: number
}

/**
 * Listing detail with variant breakdown
 */
export interface ListingDetailResponse {
  listing: Listing
  seller: {
    id: string
    name: string
    type: "user" | "contractor"
    rating: number
  }
  items: Array<{
    item_id: string
    game_item: {
      game_item_id: string
      name: string
      type: string
      icon_url?: string
    }
    pricing_mode: "unified" | "per_variant"
    base_price?: number
    variants: Array<{
      variant_id: string
      attributes: Record<string, any>
      display_name: string
      short_name: string
      quantity: number
      price: number
      locations?: string[]
    }>
  }>
}

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Unified listing table
 */
export interface Listing {
  listing_id: string
  seller_id: string
  seller_type: "user" | "contractor"
  title: string
  description: string
  status: "active" | "sold" | "expired" | "cancelled"
  visibility: "public" | "private" | "unlisted"
  sale_type: "fixed" | "auction" | "negotiable"
  listing_type: "single" | "bundle" | "bulk"
  created_at: Date
  updated_at: Date
  expires_at?: Date
}

/**
 * Variant attributes structure
 */
export interface VariantAttributes {
  quality_tier?: number
  quality_value?: number
  crafted_source?: "crafted" | "store" | "looted" | "unknown"
  blueprint_tier?: number
  [key: string]: any
}
