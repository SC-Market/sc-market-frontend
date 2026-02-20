import { useGetOrderAnalyticsQuery } from "../../../store/admin"

export interface UsePageAdminOrderStatsResult {
  data: ReturnType<typeof useGetOrderAnalyticsQuery>["data"]
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageAdminOrderStats(): UsePageAdminOrderStatsResult {
  const analytics = useGetOrderAnalyticsQuery()

  return {
    data: analytics.data,
    isLoading: analytics.isLoading,
    isFetching: analytics.isFetching,
    error: analytics.error,
    refetch: analytics.refetch,
  }
}
