import { useCallback, useEffect, useMemo, useState } from "react"
import throttle from "lodash/throttle"
import type { OfferSession } from "../domain/types"
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

export function useOfferDetails(session: OfferSession) {
  const { t } = useTranslation()
  const [org] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()

  const { data: publicContract } = useGetPublicContractQuery(session?.contract_id!, { skip: !session?.contract_id })

  // Offer selection
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0)
  const currentOffer = session.offers[selectedOfferIndex]
  const previousOffer = selectedOfferIndex < session.offers.length - 1 ? session.offers[selectedOfferIndex + 1] : undefined
  const offerChanges = detectOfferChanges(currentOffer, previousOffer)

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

  // Mutations
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
    () => normalizeOfferStatus(session.status),
    [session.status],
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
      updateStatus({ session_id: session.id, status })
        .unwrap()
        .then((result) => { if ((result as any).order_id) navigate(`/contract/${(result as any).order_id}`) })
        .catch((err) => issueAlert(err))
    },
    [session.id, updateStatus, navigate, issueAlert],
  )

  const handleAssignSave = useCallback(async () => {
    if (!targetObject) return
    const res: { data?: any; error?: any } = await assignUser({ session_id: session.id, username: targetObject.username })
    if (res?.data && !res?.error) {
      issueAlert({ message: t("memberAssignArea.assigned"), severity: "success" })
      setIsEditingAssigned(false); setTarget(""); setTargetObject(null)
    } else {
      issueAlert({ message: `${t("memberAssignArea.failed_assign")} ${res.error?.error || res.error?.data?.error || res.error}`, severity: "error" })
    }
  }, [assignUser, session.id, issueAlert, targetObject, t])

  const handleAssignCancel = useCallback(() => { setIsEditingAssigned(false); setTarget(""); setTargetObject(null) }, [])

  const handleUnassign = useCallback(async () => {
    const res: { data?: any; error?: any } = await unassignUser({ session_id: session.id })
    if (res?.data && !res?.error) {
      issueAlert({ message: t("memberAssignArea.unassigned"), severity: "success" })
      setIsEditingAssigned(false)
    } else {
      issueAlert({ message: `${t("memberAssignArea.failed_unassign")} ${res.error?.error || res.error?.data?.error || res.error}`, severity: "error" })
    }
  }, [unassignUser, session.id, issueAlert, t])

  return {
    profile, org, issueAlert, publicContract,
    selectedOfferIndex, setSelectedOfferIndex,
    currentOffer, previousOffer, offerChanges,
    isEditingAssigned, setIsEditingAssigned,
    target, setTarget, targetObject, setTargetObject,
    options, members,
    handleAssignSave, handleAssignCancel, handleUnassign,
    amContractorManager,
    statusKey, statusColor,
    showAccept, showCancel,
    isUpdatingStatus, updateStatusCallback,
    createThread, createThreadLoading,
  }
}

export { normalizeOfferStatus }
