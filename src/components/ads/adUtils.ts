import { AdConfig, isAdConfig } from "./types"
import { AD_FREQUENCY } from "./adConfig"
import { MarketListingSearchResult } from "../../features/market"

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
  adFrequency: number = AD_FREQUENCY,
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
  adFrequency: number = AD_FREQUENCY,
): number {
  const adCount = Math.floor(displaySize / adFrequency)
  return displaySize - adCount
}

/**
 * Inject ads into a listings array at random positions starting after position 10
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
  adFrequency: number = AD_FREQUENCY,
): ListingOrAd[] {
  if (adConfigs.length === 0) {
    return listings
  }

  if (listings.length === 0) {
    return listings
  }

  const result: ListingOrAd[] = []
  let displayPosition = startIndex // Track the current display position (1-indexed)

  // Calculate how many ads we want to show
  // Target: approximately 1 ad per adFrequency listings, minimum 1
  const targetAdCount = Math.max(1, Math.floor(listings.length / adFrequency))

  // If we have less than 10 listings, just show 1 ad at the end
  if (listings.length < 10) {
    listings.forEach((listing) => {
      result.push(listing)
    })
    // Add 1 ad at the end, randomly chosen
    const randomAdIndex = Math.floor(Math.random() * adConfigs.length)
    const ad = adConfigs[randomAdIndex]
    result.push(ad)
    return result
  }

  // For 10+ listings, randomly place ads starting after position 10
  // Generate random positions after position 10
  const adPositions: number[] = []
  const minSpacing = 3 // Minimum spacing between ads to avoid clustering
  const maxAttempts = 100 // Prevent infinite loops

  // Generate random positions
  let attempts = 0
  while (adPositions.length < targetAdCount && attempts < maxAttempts) {
    attempts++

    // Random position between 11 and listings.length (inclusive)
    // We add startIndex to account for pagination offset
    const randomPos =
      startIndex + 10 + Math.floor(Math.random() * (listings.length - 10)) + 1

    // Check if this position is far enough from existing ads
    const tooClose = adPositions.some(
      (pos) => Math.abs(pos - randomPos) < minSpacing,
    )

    if (!tooClose && randomPos <= startIndex + listings.length) {
      adPositions.push(randomPos)
    }
  }

  // If we couldn't place enough ads with spacing, place them with reduced spacing
  if (adPositions.length < targetAdCount) {
    const remaining = targetAdCount - adPositions.length
    for (let i = 0; i < remaining; i++) {
      const randomPos =
        startIndex + 10 + Math.floor(Math.random() * (listings.length - 10)) + 1
      if (!adPositions.includes(randomPos)) {
        adPositions.push(randomPos)
      }
    }
  }

  // Sort positions to process them in order
  adPositions.sort((a, b) => a - b)

  let nextAdPositionIndex = 0

  listings.forEach((listing, index) => {
    displayPosition++
    result.push(listing)

    // Check if we should insert an ad after this listing
    if (
      nextAdPositionIndex < adPositions.length &&
      displayPosition === adPositions[nextAdPositionIndex]
    ) {
      // Randomly choose an ad
      const randomAdIndex = Math.floor(Math.random() * adConfigs.length)
      const ad = adConfigs[randomAdIndex]
      result.push(ad)
      displayPosition++ // Account for the ad we just inserted
      nextAdPositionIndex++
    }
  })

  // If we didn't place any ads (shouldn't happen, but safety check), add one at the end
  if (adPositions.length === 0 && listings.length > 0) {
    const randomAdIndex = Math.floor(Math.random() * adConfigs.length)
    const ad = adConfigs[randomAdIndex]
    result.push(ad)
  }

  return result
}

/**
 * Type guard to check if an item is a listing (not an ad)
 */
export function isListing(
  item: ListingOrAd,
): item is MarketListingSearchResult {
  return !isAdConfig(item)
}
