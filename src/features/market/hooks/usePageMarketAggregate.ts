import { useGetAggregateByIdQuery } from "../api/marketApi"
import type { MarketAggregate } from "../../../datatypes/MarketListing"

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
 * Page data structure for market aggregate page.
 */
export interface MarketAggregatePageData {
  aggregate: MarketAggregate
}

/**
 * Page hook for ViewMarketAggregate page.
 * Encapsulates all data fetching logic for the market aggregate detail page.
 *
 * @param id - Market aggregate ID (game item ID)
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageMarketAggregate(
  id: string,
): UsePageResult<MarketAggregatePageData> {
  const aggregate = useGetAggregateByIdQuery(id)

  return {
    data: aggregate.data
      ? {
          aggregate: aggregate.data,
        }
      : undefined,
    isLoading: aggregate.isLoading,
    isFetching: aggregate.isFetching,
    error: aggregate.error,
    refetch: () => {
      aggregate.refetch()
    },
  }
}
