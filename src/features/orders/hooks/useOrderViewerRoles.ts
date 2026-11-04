import { useMemo } from "react"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useGetContractorBySpectrumIDQuery } from "../../contractor/api/contractorApi"
import {
  isDealOrgMember,
  orderViewerRoles,
  type DealParties,
  type OrderViewerRoles,
} from "../domain/orderRoles"

/**
 * The signed-in user's roles on an order or offer session
 * (orderViewerRoles). The org, with its roles, is only fetched for members.
 */
export function useOrderViewerRoles(parties: DealParties): OrderViewerRoles {
  const { data: profile } = useGetUserProfileQuery()
  const member = isDealOrgMember(parties, profile)
  const { data: orgContractor } = useGetContractorBySpectrumIDQuery(
    parties.contractor!,
    {
      skip: !parties.contractor || !member,
    },
  )
  const { customer, assignedTo, contractor } = parties
  return useMemo(
    () =>
      orderViewerRoles(
        { customer, assignedTo, contractor },
        profile,
        orgContractor,
      ),
    [customer, assignedTo, contractor, profile, orgContractor],
  )
}
