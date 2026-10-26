import { useCookies } from "react-cookie"
import { useGetContractorBySpectrumIDQuery } from "../../features/contractor/api/contractorApi"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import type { Contractor } from "../../features/contractor/domain/types"

/**
 * The org selected in the sidebar's context switcher. Opening any
 * /org/:spectrumId page (which the switcher does) stores it in the
 * `current_contractor` cookie; OrgRoute and OrgAdminRoute gate on the same
 * cookie. Only an org the user belongs to counts.
 */
export function useSelectedOrg(): {
  org: Contractor | undefined
  isLoading: boolean
} {
  const [cookies] = useCookies(["current_contractor"])
  const { data: profile } = useGetUserProfileQuery()
  const spectrumId: string | undefined = cookies.current_contractor
  const isMember =
    !!spectrumId &&
    !!profile?.contractors?.some((c) => c.spectrum_id === spectrumId)
  const { data, isLoading } = useGetContractorBySpectrumIDQuery(spectrumId!, {
    skip: !isMember,
  })
  return { org: isMember ? data : undefined, isLoading: isMember && isLoading }
}
