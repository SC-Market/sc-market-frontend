import { useGetMarketListingQuery } from "../api/marketApi"
import type { BaseListingType } from "../domain/types"

/**
 * Page hook interface for consistent data fetching patterns.
 */
export interface UsePageResult<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page data structure for market listing page.
 */
export interface MarketListingPageData {
  listing: BaseListingType
}

/**
 * Page hook for ViewMarketListing page.
 * Encapsulates all data fetching logic for the market listing detail page.
 *
 * @param id - Market listing ID
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function usePageMarketListing(
  id: string,
): UsePageResult<MarketListingPageData> {
  const listing = useGetMarketListingQuery(id)

  return {
    data: listing.data
      ? {
          listing: listing.data,
        }
      : undefined,
    isLoading: listing.isLoading,
    isFetching: listing.isFetching,
    error: listing.error,
    refetch: () => {
      listing.refetch()
    },
  }
}
