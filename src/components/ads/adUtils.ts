import { AdConfig, isAdConfig } from "./types"
import { AD_FREQUENCY } from "./adConfig"
import { MarketListingSearchResult } from "../../store/market"

/**
 * Union type for items that can appear in the listing display
 */
export type ListingOrAd = MarketListingSearchResult | AdConfig

/**
 * Calculate at which positions ads should appear
 * @param totalItems Total number of items (listings + ads) to display
 * @param adFrequency Frequency at which ads appear (default: every 24 items)
 * @returns Array of positions (1-indexed) where ads should appear
 */
export function calculateAdPositions(
  totalItems: number,
  adFrequency: number = AD_FREQUENCY
): number[] {
  const positions: number[] = []
  for (let i = adFrequency; i <= totalItems; i += adFrequency) {
    positions.push(i)
  }
  return positions
}

/**
 * Calculate how many listings to request from the API given a desired display size
 * @param displaySize Desired number of items to display (listings + ads)
 * @param adFrequency Frequency at which ads appear (default: every 24 items)
 * @returns Number of listings to request from API
 */
export function calculateRequestSize(
  displaySize: number,
  adFrequency: number = AD_FREQUENCY
): number {
  const adCount = Math.floor(displaySize / adFrequency)
  return displaySize - adCount
}

/**
 * Inject ads into a listings array at the specified positions
 * @param listings Array of listings from the API
 * @param adConfigs Array of ad configurations to inject
 * @param startIndex Starting index for position calculation (for pagination)
 * @param adFrequency Frequency at which ads appear (default: every 24 items)
 * @returns Array of listings and ads interleaved
 */
export function injectAds(
  listings: MarketListingSearchResult[],
  adConfigs: AdConfig[],
  startIndex: number = 0,
  adFrequency: number = AD_FREQUENCY
): ListingOrAd[] {
  if (adConfigs.length === 0) {
    return listings
  }

  if (listings.length === 0) {
    return listings
  }

  const result: ListingOrAd[] = []
  let adIndex = 0
  let displayPosition = startIndex // Track the current display position (1-indexed)
  let adInserted = false // Track if we've inserted at least one ad

  // If we have fewer listings than the ad frequency, ensure we show at least 1 ad
  const shouldShowAtLeastOneAd = listings.length < adFrequency

  listings.forEach((listing, index) => {
    displayPosition++
    result.push(listing)

    // Check if we should insert an ad after this listing
    let shouldInsertAd = false

    if (shouldShowAtLeastOneAd) {
      // If we have fewer than 24 listings, show 1 ad at position 12
      if (!adInserted && displayPosition === 12) {
        shouldInsertAd = true
        adInserted = true
      }
    } else {
      // Normal case: ads appear at positions 24, 48, 72, etc. (every 24 items)
      if (displayPosition % adFrequency === 0) {
        shouldInsertAd = true
        adInserted = true
      }
    }

    if (shouldInsertAd) {
      const ad = adConfigs[adIndex % adConfigs.length]
      result.push(ad)
      adIndex++
      displayPosition++ // Account for the ad we just inserted
    }
  })

  // If we still haven't inserted an ad (edge case), add one at the end
  if (!adInserted && listings.length > 0) {
    const ad = adConfigs[adIndex % adConfigs.length]
    result.push(ad)
  }

  return result
}

/**
 * Type guard to check if an item is a listing (not an ad)
 */
export function isListing(
  item: ListingOrAd
): item is MarketListingSearchResult {
  return !isAdConfig(item)
}
