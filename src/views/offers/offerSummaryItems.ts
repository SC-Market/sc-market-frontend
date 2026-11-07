import type { OfferDetailsState } from "../../features/offers/hooks/useOfferDetails"

/** The offer's market listings as order-summary rows (V2 variants, else V1 listings). */
export function offerSummaryItems(
  currentOffer: NonNullable<OfferDetailsState["currentOffer"]>,
) {
  if (currentOffer?.market_listings_v2?.length) {
    return currentOffer.market_listings_v2.flatMap((ml) =>
      ml.v2_variants.map((v) => ({
        order_item_id: v.variant_id,
        listing_id: ml.listing_id,
        item_id: "",
        listing_title: ml.title,
        variant: {
          variant_id: v.variant_id,
          attributes: v.attributes,
          display_name: v.display_name,
          short_name: v.short_name,
        },
        quantity: v.quantity,
        price_per_unit: v.price_per_unit,
        subtotal: v.quantity * v.price_per_unit,
      })),
    )
  }
  // Fall back to V1 market_listings
  if (currentOffer?.market_listings?.length) {
    return currentOffer.market_listings.map((ml) => ({
      order_item_id: ml.listing_id,
      listing_id: ml.listing_id,
      item_id: "",
      listing_title: ml.title,
      variant: {
        variant_id: "",
        attributes: {},
        display_name: "",
        short_name: "",
      },
      quantity: ml.quantity,
      price_per_unit: ml.price,
      subtotal: ml.quantity * ml.price,
    }))
  }
  return []
}
