/**
 * Configuration for a market ad
 */
export interface AdConfig {
  /** Unique identifier for the ad */
  id: string
  /** Title to display on the ad card */
  title: string
  /** URL of the ad image */
  imageUrl: string
  /** URL to navigate to when ad is clicked */
  linkUrl: string
  /** Optional description text */
  description?: string
}

/**
 * Type guard to check if an item is an AdConfig
 */
export function isAdConfig(item: unknown): item is AdConfig {
  return (
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    "title" in item &&
    "imageUrl" in item &&
    "linkUrl" in item
  )
}
