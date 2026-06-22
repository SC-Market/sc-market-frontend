import { useCallback, useMemo, useState } from "react"
import { useGetUserProfileQuery, useProfileGetBlocklistQuery } from "../../profile/api/profileApi"
import { useGetOrgBlocklistQuery } from "../../contractor/api/contractorApi"
import { useAdminUnlinkUserAccountMutation } from "../../admin/api/adminApi"
import { useAlertHook, type UnwrappedErrorInterface } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

export function useUserActions(username: string) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const { data: myProfile } = useGetUserProfileQuery()
  const contractor = myProfile?.contractors?.[0]
  const [unlinkAccount, { isLoading: isUnlinking }] = useAdminUnlinkUserAccountMutation()
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

  const { data: personalBlocklist = [], isLoading: personalBlocklistLoading } = useProfileGetBlocklistQuery()
  const { data: orgBlocklist = [], isLoading: orgBlocklistLoading } = useGetOrgBlocklistQuery(contractor?.spectrum_id || "", { skip: !contractor?.spectrum_id })

  const isPersonallyBlocked = personalBlocklist.some((e) => e.blocked_user?.username === username)
  const isSelf = myProfile?.username === username
  const isOrgBlocked = orgBlocklist.some((e) => e.blocked_user?.username === username)
  const isAdmin = myProfile?.role === "admin"

  const handleConfirmUnlink = useCallback(async () => {
    try {
      await unlinkAccount({ username }).unwrap()
      issueAlert({ message: t("userActions.adminUnlinkSuccess", { username }), severity: "success" })
      setUnlinkDialogOpen(false)
    } catch (err) { issueAlert(err as UnwrappedErrorInterface) }
  }, [unlinkAccount, username, issueAlert, t])

  return {
    myProfile, contractor,
    isPersonallyBlocked, isSelf, isOrgBlocked, isAdmin,
    isUnlinking, unlinkDialogOpen, setUnlinkDialogOpen, handleConfirmUnlink,
    personalBlocklistLoading, orgBlocklistLoading,
  }
}
