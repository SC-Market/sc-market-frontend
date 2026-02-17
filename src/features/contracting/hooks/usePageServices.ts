import { useGetPublicServicesQuery } from "../../../store/services"

interface UsePageServicesResult {
  data: ReturnType<typeof useGetPublicServicesQuery>["data"]
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageServices(): UsePageServicesResult {
  const servicesQuery = useGetPublicServicesQuery({})

  return {
    data: servicesQuery.data,
    isLoading: servicesQuery.isLoading,
    isFetching: servicesQuery.isFetching,
    error: servicesQuery.error,
    refetch: servicesQuery.refetch,
  }
}
