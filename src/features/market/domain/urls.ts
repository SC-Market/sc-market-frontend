/**
 * Market-specific URL formatters (listing links, slugs).
 */

import type {
  MarketListingSearchResult,
  ExtendedMultipleSearchResult,
} from "./types"

export function formatListingSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

export function formatMarketUrl(listing: MarketListingSearchResult): string {
  try {
    return listing?.listing_type === "aggregate"
      ? `/market/aggregate/${listing?.listing_id}/#/${formatListingSlug(
          listing.title,
        )}`
      : `/market/${listing?.listing_id}/#/${formatListingSlug(listing.title)}`
  } catch (e) {
    console.log(listing, e)
    return ""
  }
}

export interface FormattableListingType {
  type: string
  details: { title: string }
  listing: { listing_id: string }
}

export function formatCompleteListingUrl(
  listing: FormattableListingType,
): string {
  try {
    return listing?.type === "aggregate_composite"
      ? `/market/aggregate/${listing?.listing.listing_id}/#/${formatListingSlug(
          listing.details.title,
        )}`
      : `/market/${listing?.listing.listing_id}/#/${formatListingSlug(
          listing.details.title,
        )}`
  } catch (e) {
    console.log(listing, e)
    return ""
  }
}

export function formatMarketMultipleUrl(
  multiple: ExtendedMultipleSearchResult,
): string {
  return `/market/multiple/${multiple.listing_type}/#/${formatListingSlug(
    multiple.title,
  )}`
}
