import { useCallback, useMemo, useState } from "react"
import { useGetUserProfileQuery, useProfileGetBlocklistQuery } from "../../profile/api/profileApi"
import { useGetOrgBlocklistQuery } from "../../contractor/api/contractorApi"
import { useAdminUnlinkUserAccountMutation } from "../../admin/api/adminApi"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function useUserActions(username: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [contractor] = useCurrentOrg()
  const { data: myProfile } = useGetUserProfileQuery()
  const [unlinkAccount, { isLoading: isUnlinking }] = useAdminUnlinkUserAccountMutation()
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

  const { data: personalBlocklist = [] } = useProfileGetBlocklistQuery()
  const { data: orgBlocklist = [] } = useGetOrgBlocklistQuery(contractor?.spectrum_id || "", { skip: !contractor?.spectrum_id })

  const isPersonallyBlocked = personalBlocklist.some((e) => e.blocked_user?.username === username)
  const isSelf = myProfile?.username === username
  const isOrgBlocked = orgBlocklist.some((e) => e.blocked_user?.username === username)
  const isAdmin = myProfile?.role === "admin"

  const handleConfirmUnlink = useCallback(async () => {
    try {
      await unlinkAccount({ username }).unwrap()
      issueAlert({ message: t("userActions.adminUnlinkSuccess", { username }), severity: "success" })
      setUnlinkDialogOpen(false)
    } catch (err: any) { issueAlert(err) }
  }, [unlinkAccount, username, issueAlert, t])

  return {
    myProfile, contractor,
    isPersonallyBlocked, isSelf, isOrgBlocked, isAdmin,
    isUnlinking, unlinkDialogOpen, setUnlinkDialogOpen, handleConfirmUnlink,
  }
}
