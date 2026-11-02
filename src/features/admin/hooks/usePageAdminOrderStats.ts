import { useGetAdminOrderAnalyticsQuery } from "../../../store/api/v2/market"

export interface UsePageAdminOrderStatsResult {
  data: ReturnType<typeof useGetAdminOrderAnalyticsQuery>["data"]
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/** Admin › Orders stats; orders involving test accounts, orgs or shops count only with `includeTest`. */
export function usePageAdminOrderStats({ includeTest }: { includeTest: boolean }): UsePageAdminOrderStatsResult {
  const analytics = useGetAdminOrderAnalyticsQuery({ includeTest: includeTest || undefined })

  return {
    data: analytics.data,
    isLoading: analytics.isLoading,
    isFetching: analytics.isFetching,
    error: analytics.error,
    refetch: analytics.refetch,
  }
}
