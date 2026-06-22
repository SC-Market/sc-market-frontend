import { useCallback, useEffect, useMemo, useState } from "react"
import throttle from "lodash/throttle"
import type { Order } from "../domain/types"
import { statusColors, statusNames } from "../domain/constants"
import {
  useSetOrderStatusMutation,
  useAssignOrderMutation,
  useUnassignOrderMutation,
  useCreateOrderThreadMutation,
} from "../api/ordersApi"
import { useGetOrderDetailQuery } from "../../../store/api/v2/market"
import { useGetUserProfileQuery, useGetUserByUsernameQuery } from "../../profile/api/profileApi"
import { useGetContractorBySpectrumIDQuery, useGetContractorMembersQuery, contractorsApi } from "../../contractor/api/contractorApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { has_permission } from "../../contractor/domain/permissions"
import { store } from "../../../store/store"
import type { MinimalUser } from "../../../datatypes/User"

export function useOrderDetails(order: Order) {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()

  // Inline assignment editing
  const [isEditingAssigned, setIsEditingAssigned] = useState(false)
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{ username: string; display_name: string } | null>(null)
  const [options, setOptions] = useState<MinimalUser[]>([])

  // V2 order detail
  const { data: orderDetailV2 } = useGetOrderDetailQuery({ orderId: order.order_id })
  const hasV2Items = (orderDetailV2?.items?.length ?? 0) > 0

  // Member search for assignment
  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: order.contractor || "",
    page: 0, page_size: 100, search: "", role_filter: "", sort: "username",
  })
  const members = membersData?.members || []

  const fetchOptions = useCallback(async (query: string) => {
    if (query.length < 3 || !order.contractor) return
    const { data } = await store.dispatch(
      contractorsApi.endpoints.searchContractorMembers.initiate({
        spectrum_id: order.contractor, query,
      }),
    )
    setOptions(data || [])
  }, [order.contractor])

  const retrieve = useMemo(
    () => throttle((query: string) => fetchOptions(query), 400),
    [fetchOptions],
  )
  useEffect(() => { retrieve(target) }, [target, retrieve])

  // Mutations
  const [assignUser] = useAssignOrderMutation()
  const [unassignUser] = useUnassignOrderMutation()
  const [setOrderStatus] = useSetOrderStatusMutation()
  const [createThread, { isLoading: createThreadLoading }] = useCreateOrderThreadMutation()

  // Status display
  const statusColor = useMemo(() => statusColors.get(order.status), [order.status])
  const status = useMemo(() => statusNames.get(order.status) || statusNames.get("not-started")!, [order.status])

  // Status update
  const updateOrderStatus = useCallback(async (newStatus: string) => {
    setOrderStatus({ order_id: order.order_id, status: newStatus })
      .unwrap()
      .then(() => issueAlert({ message: t("orderDetailsArea.updated_status"), severity: "success" }))
      .catch((error) => issueAlert(error))
  }, [order.order_id, issueAlert, setOrderStatus, t])

  // Assignment handlers
  const handleAssignSave = useCallback(async () => {
    if (!targetObject) return
    const res = await assignUser({ order_id: order.order_id, username: targetObject.username })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("memberAssignArea.assigned"), severity: "success" })
      setIsEditingAssigned(false); setTarget(""); setTargetObject(null)
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({ message: `${t("memberAssignArea.failed_assign")} ${error?.error || error?.data?.error || ""}`, severity: "error" })
    }
  }, [assignUser, order.order_id, issueAlert, targetObject, t])

  const handleAssignCancel = useCallback(() => {
    setIsEditingAssigned(false); setTarget(""); setTargetObject(null)
  }, [])

  const handleUnassign = useCallback(async () => {
    const res = await unassignUser({ order_id: order.order_id })
    if ("data" in res && !("error" in res)) {
      issueAlert({ message: t("memberAssignArea.unassigned"), severity: "success" })
      setIsEditingAssigned(false)
    } else {
      const error = "error" in res ? res.error as { error?: string; data?: { error?: string } } : undefined
      issueAlert({ message: `${t("memberAssignArea.failed_unassign")} ${error?.error || error?.data?.error || ""}`, severity: "error" })
    }
  }, [unassignUser, order.order_id, issueAlert, t])

  // Related entity queries
  const { data: contractor } = useGetContractorBySpectrumIDQuery(order.contractor!, { skip: !order.contractor })
  const { data: assigned } = useGetUserByUsernameQuery(order.assigned_to!, { skip: !order.assigned_to })
  const { data: customer } = useGetUserByUsernameQuery(order.customer!, { skip: !order.customer })

  // Permission checks
  const amCustomer = useMemo(() => order.customer === profile?.username, [order, profile])
  const amAssigned = useMemo(() => order.assigned_to === profile?.username, [order, profile])
  const amContractor = useMemo(
    () => !!order.contractor && !!profile?.contractors?.some(c => c.spectrum_id === order.contractor),
    [order.contractor, profile?.contractors],
  )
  const amRelated = useMemo(() => amCustomer || amAssigned || amContractor, [amCustomer, amAssigned, amContractor])
  const amContractorManager = useMemo(
    () => amContractor && has_permission(contractor, profile, "manage_orders", profile?.contractors),
    [contractor, profile, amContractor],
  )

  const privateContractCustomer = useMemo(
    () => amCustomer && !(amContractorManager || amAssigned) && (order.contractor || order.assigned_to),
    [order.contractor, order.assigned_to, amAssigned, amContractorManager, amCustomer],
  )
  const publicContractCustomer = useMemo(
    () => amCustomer && !order.assigned_to && !order.contractor,
    [amCustomer, order],
  )
  const isComplete = useMemo(() => ["cancelled", "fulfilled"].includes(order.status), [order.status])
  const server_id = useMemo(
    () => order.discord_server_id || contractor?.official_server_id,
    [contractor?.official_server_id, order.discord_server_id],
  )

  const handleClaimOrder = useCallback(async () => {
    if (!profile?.username) return
    try {
      await assignUser({ order_id: order.order_id, username: profile.username }).unwrap()
      issueAlert({ message: t("orderDetailsArea.claimed", "Order claimed"), severity: "success" })
    } catch {
      issueAlert({ message: t("orderDetailsArea.claimFailed", "Failed to claim order"), severity: "error" })
    }
  }, [assignUser, order.order_id, profile?.username, issueAlert, t])

  return {
    profile, issueAlert,
    // Assignment editing
    isEditingAssigned, setIsEditingAssigned,
    target, setTarget, targetObject, setTargetObject,
    options, members,
    handleAssignSave, handleAssignCancel, handleUnassign, handleClaimOrder,
    // V2
    orderDetailV2, hasV2Items,
    // Status
    statusColor, status, updateOrderStatus,
    // Related entities
    contractor, assigned, customer,
    // Permissions
    amCustomer, amAssigned, amContractor, amRelated, amContractorManager,
    privateContractCustomer, publicContractCustomer, isComplete,
    server_id,
    // Thread
    createThread, createThreadLoading,
  }
}
