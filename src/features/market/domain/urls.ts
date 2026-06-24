/**
 * Market-specific URL formatters (listing links, slugs).
 */

import type {
  MarketListingSearchResult,
  ExtendedMultipleSearchResult,
} from "./types"

export function formatShortSlug(id: string, name: string): string {
  const prefix = id.replace(/-/g, "").slice(0, 8)
  const slug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60)
  return `${prefix}--${slug}`
}

export function formatListingSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

export function formatMarketUrl(listing: MarketListingSearchResult): string {
  try {
    return listing?.listing_type === "aggregate"
      ? `/market/aggregate/${formatShortSlug(listing.listing_id, listing.title)}`
      : `/market/${formatShortSlug(listing.listing_id, listing.title)}`
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
      ? `/market/aggregate/${formatShortSlug(listing.listing.listing_id, listing.details.title)}`
      : `/market/${formatShortSlug(listing.listing.listing_id, listing.details.title)}`
  } catch (e) {
    console.log(listing, e)
    return ""
  }
}

export function formatMarketMultipleUrl(
  multiple: ExtendedMultipleSearchResult,
): string {
  return `/market/multiple/${formatShortSlug(multiple.listing_type, multiple.title)}`
}
