import { useGetMyAssignedOrdersQuery } from "../../../store/orders"

interface UsePageOrdersAssignedResult {
  data: ReturnType<typeof useGetMyAssignedOrdersQuery>["data"]
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageOrdersAssigned(): UsePageOrdersAssignedResult {
  const ordersQuery = useGetMyAssignedOrdersQuery({})

  return {
    data: ordersQuery.data,
    isLoading: ordersQuery.isLoading,
    isFetching: ordersQuery.isFetching,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
  }
}
