import { useCallback, useEffect, useMemo, useState } from "react"
import throttle from "lodash/throttle"
import type { GetOfferSessionV2Response } from "../../../store/api/v2/market"
import { normalizeOfferStatus, type OfferStatusKey } from "../domain/types"
import {
  useUpdateOfferStatusMutation,
  useAssignOfferMutation,
  useUnassignOfferMutation,
  useCreateOfferThreadMutation,
} from "../api/offerApi"
import { useGetPublicContractQuery } from "../../contracting/api/publicContractsApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useGetContractorMembersQuery, contractorsApi } from "../../contractor/api/contractorApi"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { has_permission } from "../../contractor/domain/permissions"
import { detectOfferChanges } from "../../../util/offerChanges"
import { store } from "../../../store/store"
import type { MinimalUser } from "../../../datatypes/User"

export function useOfferDetails(session: GetOfferSessionV2Response, offerIndex?: number) {
  const { t } = useTranslation()
  const [org] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const { data: publicContract } = useGetPublicContractQuery(session?.contract_id!, { skip: !session?.contract_id })

  // Offer selection — use provided index or default to 0
  const selectedOfferIndex = offerIndex ?? 0
  const currentOffer = session.offers?.[selectedOfferIndex] ?? undefined
  const previousOffer = selectedOfferIndex < (session.offers?.length ?? 0) - 1 ? session.offers[selectedOfferIndex + 1] : undefined
  const offerChanges = currentOffer ? detectOfferChanges(currentOffer, previousOffer) : null

  // Assignment editing
  const [isEditingAssigned, setIsEditingAssigned] = useState(false)
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{ username: string; display_name: string } | null>(null)
  const [options, setOptions] = useState<MinimalUser[]>([])

  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: org?.spectrum_id || "", page: 0, page_size: 100, search: "", role_filter: "", sort: "username",
  })
  const members = membersData?.members || []

  const fetchOptions = useCallback(async (query: string) => {
    if (query.length < 3) return
    const { data } = await store.dispatch(
      contractorsApi.endpoints.searchContractorMembers.initiate({ spectrum_id: org?.spectrum_id!, query }),
    )
    setOptions(data || [])
  }, [org?.spectrum_id])

  const retrieve = useMemo(() => throttle((query: string) => fetchOptions(query), 400), [fetchOptions])
  useEffect(() => { retrieve(target) }, [target, retrieve])

  // Mutations — use session_id (V2 field name)
  const [assignUser] = useAssignOfferMutation()
  const [unassignUser] = useUnassignOfferMutation()
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOfferStatusMutation()
  const [createThread, { isLoading: createThreadLoading }] = useCreateOfferThreadMutation()

  // Permissions
  const amContractorManager = useMemo(
    () => session.contractor && org?.spectrum_id === session.contractor.spectrum_id && has_permission(org, profile, "manage_orders", profile?.contractors),
    [org, profile, session],
  )

  const statusKey: OfferStatusKey = useMemo(
    () => normalizeOfferStatus(session.status, session.offers),
    [session.status, session.offers],
  )

  const statusColor = useMemo(() => {
    if (statusKey === "waitingSeller") return "warning" as const
    if (statusKey === "waitingCustomer") return "info" as const
    if (statusKey === "rejected") return "error" as const
    return "success" as const
  }, [statusKey])

  const showAccept = useMemo(() => {
    if (["rejected", "accepted"].includes(statusKey)) return false

    if (session.contractor) {
      if (org?.spectrum_id === session.contractor.spectrum_id) {
        return statusKey === "waitingSeller"
      }
    }

    if (session.assigned_to) {
      if (profile?.username === session.assigned_to.username) {
        return statusKey === "waitingSeller"
      }
    }

    if (profile?.username === session.customer.username) {
      return statusKey === "waitingCustomer"
    }

    return false
  }, [profile, org, session, statusKey])

  const showCancel = !showAccept && statusKey !== "rejected" && statusKey !== "accepted"

  const updateStatusCallback = useCallback(
    (status: "accepted" | "rejected" | "cancelled") => {
      updateStatus({ session_id: session.session_id, status })
        .unwrap()
        .then((result) => { if ((result as { order_id?: string }).order_id) navigate(`/contract/${(result as { order_id?: string }).order_id}`) })
        .catch((err) => issueAlert(err))
    },
    [session.session_id, updateStatus, navigate, issueAlert],
  )

  const handleAssignSave = useCallback(async () => {
    if (!targetObject) return
    try {
      await assignUser({ session_id: session.session_id, username: targetObject.username }).unwrap()
      issueAlert({ message: t("memberAssignArea.assigned"), severity: "success" })
      setIsEditingAssigned(false); setTarget(""); setTargetObject(null)
    } catch (err) {
      issueAlert({ message: t("memberAssignArea.failed_assign"), severity: "error" })
    }
  }, [assignUser, session.session_id, issueAlert, targetObject, t])

  const handleAssignCancel = useCallback(() => { setIsEditingAssigned(false); setTarget(""); setTargetObject(null) }, [])

  const handleUnassign = useCallback(async () => {
    try {
      await unassignUser({ session_id: session.session_id }).unwrap()
      issueAlert({ message: t("memberAssignArea.unassigned"), severity: "success" })
      setIsEditingAssigned(false)
    } catch (err) {
      issueAlert({ message: t("memberAssignArea.failed_unassign"), severity: "error" })
    }
  }, [unassignUser, session.session_id, issueAlert, t])

  const amContractor = useMemo(
    () => !!session.contractor && org?.spectrum_id === session.contractor.spectrum_id,
    [org?.spectrum_id, session.contractor],
  )

  const handleClaimOffer = useCallback(async () => {
    if (!profile?.username) return
    try {
      await assignUser({ session_id: session.session_id, username: profile.username }).unwrap()
      issueAlert({ message: t("orderDetailsArea.claimed", "Offer claimed"), severity: "success" })
    } catch {
      issueAlert({ message: t("orderDetailsArea.claimFailed", "Failed to claim offer"), severity: "error" })
    }
  }, [assignUser, session.session_id, profile?.username, issueAlert, t])

  return {
    profile, org, issueAlert, publicContract,
    currentOffer, previousOffer, offerChanges,
    isEditingAssigned, setIsEditingAssigned,
    target, setTarget, targetObject, setTargetObject,
    options, members,
    handleAssignSave, handleAssignCancel, handleUnassign, handleClaimOffer,
    amContractor, amContractorManager,
    statusKey, statusColor,
    showAccept, showCancel,
    isUpdatingStatus, updateStatusCallback,
    createThread, createThreadLoading,
  }
}

export { normalizeOfferStatus }
