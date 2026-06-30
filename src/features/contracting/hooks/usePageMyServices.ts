import {
  useGetServicesQuery,
  useGetServicesContractorQuery,
} from "../../services/api/servicesApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useOptionalShopRouteContext } from "../../../components/router/ShopContextFromRoute"

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
  const shopCtx = useOptionalShopRouteContext()
  const contractorId = shopCtx?.shop.owner_contractor_spectrum_id

  // Get services for user or org (org when under a shop route)
  const userServicesQuery = useGetServicesQuery(profile?.username!, {
    skip: !profile || !!contractorId,
  })

  const orgServicesQuery = useGetServicesContractorQuery(
    contractorId!,
    { skip: !contractorId },
  )

  // Use whichever query is active
  const activeQuery = contractorId ? orgServicesQuery : userServicesQuery

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
