import { useGetUserProfileQuery } from "../../../store/profile"

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
 * Page data structure for market create page.
 */
export interface MarketCreatePageData {
  isVerified: boolean
  userProfile: any
}

/**
 * Page hook for MarketCreate page.
 * Encapsulates all data fetching logic for the market listing creation page.
 *
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageMarketCreate(): UsePageResult<MarketCreatePageData> {
  const userProfile = useGetUserProfileQuery()

  return {
    data: userProfile.data
      ? {
          isVerified: userProfile.data.rsi_confirmed || false,
          userProfile: userProfile.data,
        }
      : undefined,
    isLoading: userProfile.isLoading,
    isFetching: userProfile.isFetching,
    error: userProfile.error,
    refetch: () => {
      userProfile.refetch()
    },
  }
}
