import { useGetMyServicesQuery } from "../../../store/service"

interface UsePageMyServicesResult {
  data: {
    active: ReturnType<typeof useGetMyServicesQuery>["data"]
    inactive: ReturnType<typeof useGetMyServicesQuery>["data"]
  }
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageMyServices(): UsePageMyServicesResult {
  const activeQuery = useGetMyServicesQuery({ status: "active" })
  const inactiveQuery = useGetMyServicesQuery({ status: "inactive" })

  return {
    data: {
      active: activeQuery.data,
      inactive: inactiveQuery.data,
    },
    isLoading: activeQuery.isLoading || inactiveQuery.isLoading,
    isFetching: activeQuery.isFetching || inactiveQuery.isFetching,
    error: activeQuery.error || inactiveQuery.error,
    refetch: () => {
      activeQuery.refetch()
      inactiveQuery.refetch()
    },
  }
}
