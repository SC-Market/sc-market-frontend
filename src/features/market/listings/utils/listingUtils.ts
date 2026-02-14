import type { UniqueListing, MarketListingSearchResult } from "../../index"

export const completeToSearchResult = (
  listing: UniqueListing,
): MarketListingSearchResult => {
  const seller =
    listing.listing.user_seller || listing.listing.contractor_seller!
  const rating = seller.rating

  return {
    listing_id: listing.listing.listing_id,
    listing_type: listing.type,
    item_type: listing.details.item_type,
    item_name: listing.details.title,
    game_item_id: null,
    price: listing.listing.price,
    expiration: listing.listing.expiration || "",
    minimum_price: listing.listing.price,
    maximum_price: listing.listing.price,
    quantity_available: listing.listing.quantity_available,
    timestamp: listing.listing.timestamp || "",
    total_rating: rating.total_rating,
    avg_rating: rating.avg_rating,
    details_id: listing.listing.listing_id,
    status: listing.listing.status,
    user_seller: listing.listing.user_seller?.username || null,
    contractor_seller: listing.listing.contractor_seller?.spectrum_id || null,
    rating_count: rating.rating_count,
    rating_streak: rating.streak,
    total_orders: listing.stats?.order_count || 0,
    total_assignments: rating.total_assignments || 0,
    response_rate: rating.response_rate || 0,
    title: listing.details.title,
    photo: listing.photos[0] || "",
    internal: false,
    sale_type: listing.listing.sale_type as "auction" | "sale",
    auction_end_time: null,
  }
}
