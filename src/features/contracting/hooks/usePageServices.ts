import { useGetServicesQuery } from "../../../store/service"

interface UsePageServicesResult {
  data: ReturnType<typeof useGetServicesQuery>["data"]
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageServices(): UsePageServicesResult {
  const servicesQuery = useGetServicesQuery({})

  return {
    data: servicesQuery.data,
    isLoading: servicesQuery.isLoading,
    isFetching: servicesQuery.isFetching,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,
  }
}
