import type { GetListingDetailResponse } from "../../../store/api/v2/market"
import type { Order } from "../../orders/domain/types"
import { MISSING_IMAGE_URL } from "../../../util/constants"

/**
 * MarketMultipleViewV2 Component
 *
 * Task: 11.6 Implement MarketMultipleViewV2 component
 * Requirements: 42.1-42.10
 *
 * Displays bundle listings with multiple items where each item can have different variants
 * with quality tiers. Users can select variants for each item in the bundle and see the
 * total price calculated correctly.
 *
 * Features:
 * - Display all items in bundle
 * - Show quality tier for each item
 * - Display variant attributes for each item
 * - Calculate bundle total with per-variant pricing
 * - Provide variant selection for each item
 * - Validate availability for entire bundle
 * - Maintain visual parity with V1 MarketMultipleView
 *
 * Visual Parity Requirements:
 * - Reuse image paper styling (minHeight: 400, borderRadius)
 * - Reuse Card layout for item details
 * - Reuse Section for people and orders
 * - Maintain identical typography and spacing
 * - Use identical breadcrumbs and header structure
 * - Preserve mobile responsiveness
 */

/** Bundle listing item with variant information */
export interface BundleItemV2 {
  item_id: string
  game_item: {
    id: string
    name: string
    type: string
  }
  pricing_mode: "unified" | "per_variant"
  base_price?: number
  variants: Array<{
    variant_id: string
    attributes: {
      quality_tier?: number
      quality_value?: number
      crafted_source?: string
    }
    display_name: string
    short_name: string
    quantity: number
    price: number
  }>
}

/** Bundle listing data structure */
export interface BundleListingV2 {
  listing_id: string
  title: string
  description: string
  status: "active" | "inactive" | "sold" | "expired" | "cancelled"
  created_at: string
  updated_at: string
  expires_at: string
  items: BundleItemV2[]
  photos: string[]
  seller: {
    name: string
    slug: string
    display_name?: string
    username?: string
    avatar?: string
    spectrum_id?: string
    rating: { avg_rating: number }
  }
  orders?: Order[]
}

/** The listing-detail response shaped for the bundle page. */
export function toBundleListingV2(
  listingDetail: GetListingDetailResponse,
): BundleListingV2 {
  const { listing, seller, items } = listingDetail
  return {
    listing_id: listing.listing_id,
    title: listing.title,
    description: listing.description,
    status: listing.status,
    created_at: listing.created_at,
    updated_at: listing.updated_at,
    expires_at: listing.expires_at || listing.updated_at,
    items: items.map((item) => ({
      item_id: item.item_id,
      game_item: {
        id: item.game_item.id,
        name: item.game_item.name,
        type: item.game_item.type,
      },
      pricing_mode: item.pricing_mode,
      base_price: item.base_price,
      variants: item.variants.map((v) => ({
        variant_id: v.variant_id,
        attributes: {
          quality_tier: v.attributes.quality_tier,
          quality_value: v.attributes.quality_value,
          crafted_source: v.attributes.crafted_source,
        },
        display_name: v.display_name,
        short_name: v.short_name,
        quantity: v.quantity,
        price: v.price,
      })),
    })),
    photos: items[0]?.game_item.image_url
      ? [items[0].game_item.image_url]
      : [MISSING_IMAGE_URL],
    seller: {
      name: seller.name,
      slug: seller.slug,
      avatar: seller.logo_url,
      rating: { avg_rating: seller.rating },
    },
    orders: [],
  }
}
