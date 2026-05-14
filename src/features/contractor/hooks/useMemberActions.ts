import { useCallback, useMemo, useState } from "react"
import {
  useApplyContractorRoleMutation,
  useRemoveContractorRoleMutation,
  useKickContractorMemberMutation,
} from "../api/contractorApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useAlertHook, type UnwrappedErrorInterface } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { has_permission, min_position, getMemberPosition, self_member_role_removal_forbidden } from "../domain/permissions"
import type { Contractor, ContractorRole } from "../domain/types"

export function useMemberActions(contractor: Contractor, memberUsername: string, memberRoles: string[]) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const { data: profile } = useGetUserProfileQuery()

  const [applyRole] = useApplyContractorRoleMutation()
  const [removeRole] = useRemoveContractorRoleMutation()
  const [kickMember] = useKickContractorMemberMutation()

  const myPosition = useMemo(() => min_position(contractor, profile!, profile?.contractors), [contractor, profile])
  const theirPosition = useMemo(() => getMemberPosition(contractor, memberRoles), [contractor, memberRoles])
  const canKick = useMemo(() => has_permission(contractor, profile, "kick_members", profile?.contractors), [contractor, profile])

  const myRoles = useMemo(() => {
    const userContractor = profile?.contractors?.find((c) => c.spectrum_id === contractor.spectrum_id)
    return (contractor.roles || []).filter((r) => userContractor?.roles?.includes(r.role_id))
  }, [contractor, profile])

  const addRoleCallback = useCallback((role_id: string) => {
    applyRole({ contractor: contractor.spectrum_id, username: memberUsername, role_id }).unwrap()
      .then(() => issueAlert({ message: t("manageMemberList.updated"), severity: "success" }))
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [applyRole, contractor.spectrum_id, memberUsername, issueAlert, t])

  const removeRoleCallback = useCallback((role_id: string) => {
    removeRole({ contractor: contractor.spectrum_id, username: memberUsername, role_id }).unwrap()
      .then(() => issueAlert({ message: t("manageMemberList.updated"), severity: "success" }))
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [removeRole, contractor.spectrum_id, memberUsername, issueAlert, t])

  const kickCallback = useCallback(() => {
    kickMember({ contractor: contractor.spectrum_id, username: memberUsername }).unwrap()
      .then(() => issueAlert({ message: t("manageMemberList.kicked"), severity: "success" }))
      .catch((err: UnwrappedErrorInterface) => issueAlert(err))
  }, [kickMember, contractor.spectrum_id, memberUsername, issueAlert, t])

  const canRemoveRole = useCallback((roleId: string) => {
    if (memberUsername === profile?.username) {
      return !self_member_role_removal_forbidden(myRoles, roleId)
    }
    return true
  }, [memberUsername, profile, myRoles])

  return {
    profile, myPosition, theirPosition, canKick,
    addRoleCallback, removeRoleCallback, kickCallback, canRemoveRole,
  }
}
