import React from "react"
import { useSearchListingsQuery } from "../../store/api/v2/market"
import type { ListingSearchResult } from "../../store/api/v2/market"
import type { MarketListingSearchResult } from "../../features/market/domain/types"
import { DisplayListingsHorizontal } from "../../features/market/views/ItemListings"
import { RecentListingsSkeleton } from "./RecentListingsSkeleton"

// Type adapter: Convert v2 flat type to v1 discriminated union
function adaptV2ToV1Listing(
  listing: ListingSearchResult,
): MarketListingSearchResult {
  const base = {
    listing_id: listing.listing_id,
    item_type: listing.item_type,
    item_name: listing.item_name,
    game_item_id: listing.game_item_id,
    price: listing.price,
    expiration: listing.expiration,
    minimum_price: listing.minimum_price,
    maximum_price: listing.maximum_price,
    quantity_available: listing.quantity_available,
    timestamp: listing.timestamp,
    total_rating: listing.total_rating,
    avg_rating: listing.avg_rating,
    details_id: listing.details_id,
    status: listing.status as "active" | "inactive" | "archived",
    user_seller: listing.user_seller,
    contractor_seller: listing.contractor_seller,
    rating_count: listing.rating_count,
    rating_streak: listing.rating_streak,
    total_orders: listing.total_orders,
    total_assignments: listing.total_assignments,
    response_rate: listing.response_rate,
    title: listing.title,
    photo: listing.photo,
    internal: listing.internal,
    badges: listing.badges,
  }

  // Discriminate based on listing_type
  if (listing.listing_type === "unique") {
    return {
      ...base,
      listing_type: "unique",
      sale_type: listing.sale_type as "sale" | "auction",
      auction_end_time: listing.auction_end_time,
    }
  } else if (listing.listing_type === "aggregate") {
    return {
      ...base,
      listing_type: "aggregate",
      sale_type: "aggregate",
    }
  } else {
    return {
      ...base,
      listing_type: "multiple",
      sale_type: "multiple",
    }
  }
}

export function RecentListings() {
  const { data: results, isLoading } = useSearchListingsQuery({
    page: 0,
    pageSize: 8,
    statuses: "active",
    saleType: "sale",
    listingType: "unique",
    sort: "activity",
    quantityAvailable: 1,
  })

  // Convert v2 types to v1 discriminated union format
  const listings: MarketListingSearchResult[] =
    results?.listings.map(adaptV2ToV1Listing) || []

  return !isLoading && results ? (
    <DisplayListingsHorizontal listings={listings} />
  ) : (
    <RecentListingsSkeleton />
  )
}
