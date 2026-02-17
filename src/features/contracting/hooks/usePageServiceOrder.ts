import { useGetServiceByIdQuery } from "../../../store/services"

export interface UsePageServiceOrderResult {
  service: ReturnType<typeof useGetServiceByIdQuery>["data"]
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageServiceOrder(
  serviceId: string,
): UsePageServiceOrderResult {
  const serviceQuery = useGetServiceByIdQuery(serviceId)

  return {
    service: serviceQuery.data,
    isLoading: serviceQuery.isLoading,
    isFetching: serviceQuery.isFetching,
    error: serviceQuery.error,
    refetch: serviceQuery.refetch,
  }
}
