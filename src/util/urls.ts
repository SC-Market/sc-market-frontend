import {
  BaseListingType,
  MarketAggregateListingComposite,
  MarketMultiple,
  UniqueListing,
} from "../datatypes/MarketListing"
import { Service } from "../datatypes/Order"
import { Contractor } from "../datatypes/Contractor"
import {
  BaseMarketListingSearchResult,
  ExtendedMultipleSearchResult,
  MarketListingSearchResult,
} from "../store/market.ts"

interface FormattableListingType {
  type: string
  details: { title: string }
  listing: { listing_id: string }
}

export function formatListingSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}

export function formatMarketUrl(listing: MarketListingSearchResult) {
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

export function formatCompleteListingUrl(listing: FormattableListingType) {
  try {
    return listing?.type === "aggregate_composite"
      ? `/market/aggregate/${listing?.listing.listing_id}/#/${formatListingSlug(
          listing.details.title,
        )}`
      : `/market/${listing?.listing.listing_id}/#/${formatListingSlug(listing.details.title)}`
  } catch (e) {
    console.log(listing, e)
    return ""
  }
}

export function formatMarketMultipleUrl(
  multiple: ExtendedMultipleSearchResult,
) {
  return `/market/multiple/${multiple.listing_type}/#/${formatListingSlug(
    multiple.title,
  )}`
}

export function formatServiceUrl(service: Service) {
  return `/order/service/${service.service_id}/#/${formatListingSlug(
    service.title,
  )}`
}

export function formatContractorUrl(contractor: Contractor) {
  return `/contractor/${contractor?.spectrum_id}/#/${formatListingSlug(
    contractor.name,
  )}`
}
