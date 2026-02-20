import { useGetMultipleByIdQuery } from "../api/marketApi"
import type { MarketMultiple } from "../../../datatypes/MarketListing"

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
 * Page data structure for market multiple page.
 */
export interface MarketMultiplePageData {
  multiple: MarketMultiple
}

/**
 * Page hook for ViewMarketMultiple page.
 * Encapsulates all data fetching logic for the market multiple detail page.
 *
 * @param id - Market multiple ID (game item ID)
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageMarketMultiple(
  id: string,
): UsePageResult<MarketMultiplePageData> {
  const multiple = useGetMultipleByIdQuery(id)

  return {
    data: multiple.data
      ? {
          multiple: multiple.data,
        }
      : undefined,
    isLoading: multiple.isLoading,
    isFetching: multiple.isFetching,
    error: multiple.error,
    refetch: () => {
      multiple.refetch()
    },
  }
}
