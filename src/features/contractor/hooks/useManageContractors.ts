import { useCallback, useEffect, useMemo, useState } from "react"
import {
  useLeaveContractorMutation,
  useArchiveContractorMutation,
  useTransferOwnershipMutation,
  useGetContractorMembersQuery,
  contractorsApi,
} from "../api/contractorApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { store } from "../../../store/store"
import type { MinimalUser } from "../../../datatypes/User"
import throttle from "lodash/throttle"

export function useManageContractors() {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()

  const [leaveOrg] = useLeaveContractorMutation()
  const [archiveContractor, { isLoading: isArchiving }] = useArchiveContractorMutation()
  const [transferOwnership, { isLoading: isTransferring }] = useTransferOwnershipMutation()

  // Archive state
  const [archiveTarget, setArchiveTarget] = useState<{ spectrum_id: string; name: string } | null>(null)
  const [archiveReason, setArchiveReason] = useState("")

  // Transfer state
  const [transferTarget, setTransferTarget] = useState<{ spectrum_id: string; name: string } | null>(null)
  const [transferSearchQuery, setTransferSearchQuery] = useState("")
  const [transferSelectedUser, setTransferSelectedUser] = useState<{ username: string; display_name: string; avatar?: string } | null>(null)
  const [transferSearchOptions, setTransferSearchOptions] = useState<MinimalUser[]>([])

  const { data: transferMembersData } = useGetContractorMembersQuery(
    { spectrum_id: transferTarget?.spectrum_id || "", page: 0, page_size: 100, search: "", role_filter: "", sort: "username" },
    { skip: !transferTarget },
  )
  const transferMembers = transferMembersData?.members || []

  const fetchTransferOptions = useCallback(async (query: string) => {
    if (!transferTarget || query.length < 3) { setTransferSearchOptions([]); return }
    const { data } = await store.dispatch(
      contractorsApi.endpoints.searchContractorMembers.initiate({ spectrum_id: transferTarget.spectrum_id, query }),
    )
    setTransferSearchOptions(data || [])
  }, [transferTarget])

  const retrieveTransfer = useMemo(() => throttle((query: string) => fetchTransferOptions(query), 400), [fetchTransferOptions])
  useEffect(() => { retrieveTransfer(transferSearchQuery) }, [transferSearchQuery, retrieveTransfer])

  const handleLeaveOrg = useCallback((spectrum_id: string) => { leaveOrg(spectrum_id) }, [leaveOrg])

  const handleArchiveOrg = useCallback(() => {
    if (!archiveTarget) return
    archiveContractor({ spectrum_id: archiveTarget.spectrum_id, reason: archiveReason.trim() || undefined }).unwrap()
      .then(() => { issueAlert({ message: t("settingsManageContractors.disband_org_success", { name: archiveTarget.name }), severity: "success" }); setArchiveTarget(null); setArchiveReason("") })
      .catch(() => { issueAlert({ message: t("settingsManageContractors.disband_org_error", { name: archiveTarget.name }), severity: "error" }) })
  }, [archiveTarget, archiveReason, archiveContractor, issueAlert, t])

  const handleTransferOwnership = useCallback(() => {
    if (!transferTarget || !transferSelectedUser) return
    transferOwnership({ contractor: transferTarget.spectrum_id, username: transferSelectedUser.username }).unwrap()
      .then(() => {
        issueAlert({ message: t("settingsManageContractors.transfer_ownership_success", { name: transferTarget.name, username: transferSelectedUser.username }), severity: "success" })
        setTransferTarget(null); setTransferSearchQuery(""); setTransferSelectedUser(null); setTransferSearchOptions([])
      })
      .catch((error: any) => {
        issueAlert({ message: error?.data?.message || t("settingsManageContractors.transfer_ownership_error", { name: transferTarget.name }), severity: "error" })
      })
  }, [transferTarget, transferSelectedUser, transferOwnership, issueAlert, t])

  return {
    profile,
    // Archive
    archiveTarget, setArchiveTarget, archiveReason, setArchiveReason,
    isArchiving, handleArchiveOrg,
    // Transfer
    transferTarget, setTransferTarget,
    transferSearchQuery, setTransferSearchQuery,
    transferSelectedUser, setTransferSelectedUser,
    transferSearchOptions, transferMembers,
    setTransferSearchOptions,
    isTransferring, handleTransferOwnership,
    // Leave
    handleLeaveOrg,
  }
}
