import {
  useGetServicesQuery,
  useGetServicesContractorQuery,
} from "../../../store/services"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"

interface UsePageMyServicesResult {
  data: {
    active: ReturnType<typeof useGetServicesQuery>["data"]
    inactive: ReturnType<typeof useGetServicesQuery>["data"]
  }
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

export function usePageMyServices(): UsePageMyServicesResult {
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  // Get services for user or org
  const userServicesQuery = useGetServicesQuery(profile?.username!, {
    skip: !profile || !!currentOrg,
  })

  const orgServicesQuery = useGetServicesContractorQuery(
    currentOrg?.spectrum_id!,
    { skip: !currentOrg },
  )

  // Use whichever query is active
  const activeQuery = currentOrg ? orgServicesQuery : userServicesQuery

  return {
    data: {
      active: activeQuery.data,
      inactive: activeQuery.data,
    },
    isLoading: activeQuery.isLoading,
    isFetching: activeQuery.isFetching,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
  }
}
