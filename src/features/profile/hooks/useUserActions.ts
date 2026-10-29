import { useGetUserProfileQuery, useProfileGetBlocklistQuery } from "../../profile/api/profileApi"
import { useGetOrgBlocklistQuery } from "../../contractor/api/contractorApi"
import { isSiteAdmin } from "../../../util/siteRole"

export function useUserActions(username: string) {
  const { data: myProfile } = useGetUserProfileQuery()
  const contractor = myProfile?.contractors?.[0]

  const { data: personalBlocklist = [], isLoading: personalBlocklistLoading } = useProfileGetBlocklistQuery()
  const { data: orgBlocklist = [], isLoading: orgBlocklistLoading } = useGetOrgBlocklistQuery(contractor?.spectrum_id || "", { skip: !contractor?.spectrum_id })

  const isPersonallyBlocked = personalBlocklist.some((e) => e.blocked_user?.username === username)
  const isSelf = myProfile?.username === username
  const isOrgBlocked = orgBlocklist.some((e) => e.blocked_user?.username === username)
  const isAdmin = isSiteAdmin(myProfile)

  return {
    myProfile, contractor,
    isPersonallyBlocked, isSelf, isOrgBlocked, isAdmin,
    personalBlocklistLoading, orgBlocklistLoading,
  }
}
