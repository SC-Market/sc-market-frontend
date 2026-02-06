import {
  MarketListingType,
  SellerListingType,
  UniqueListing,
  MarketAggregate,
} from "../../domain/types"

export function getComparePrice(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return market_listing.listing.price
  }

  const market_aggregate = listing as MarketAggregate
  if (!market_aggregate.listings.length) {
    return 0
  }
  return market_aggregate.listings.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr,
  ).price
}

export function getCompareTimestamp(
  listing: MarketListingType | SellerListingType,
) {
  const market_listing = listing as UniqueListing
  if (market_listing.listing?.sale_type) {
    return +new Date(market_listing.listing.timestamp)
  }

  const market_aggregate = listing as MarketAggregate
  if (market_aggregate.listings.length) {
    return +new Date(
      market_aggregate.listings.reduce((prev, curr) =>
        new Date(prev.timestamp) > new Date(curr.timestamp) ? prev : curr,
      ).timestamp,
    )
  }

  return +new Date()
}
