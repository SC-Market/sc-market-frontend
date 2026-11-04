import { useCallback, useEffect, useMemo, useState } from "react"
import throttle from "lodash/throttle"
import type { Order } from "../domain/types"
import { statusColors, statusNames } from "../domain/constants"
import {
  useSetOrderStatusMutation,
  useAssignOrderMutation,
  useUnassignOrderMutation,
  useCreateOrderThreadMutation,
  useGetOrderByIdQuery,
} from "../api/ordersApi"
import { useGetOrderDetailQuery } from "../../../store/api/v2/market"
import {
  useGetUserProfileQuery,
  useGetUserByUsernameQuery,
} from "../../profile/api/profileApi"
import {
  useGetContractorBySpectrumIDQuery,
  useGetContractorMembersQuery,
  contractorsApi,
} from "../../contractor/api/contractorApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { availableOrderActions } from "../domain/orderActions"
import { useOrderViewerRoles } from "./useOrderViewerRoles"
import { useAppDispatch } from "../../../store/hooks"
import type { MinimalUser } from "../../../datatypes/User"

export function useOrderDetails(order: Order) {
  const { t } = useTranslation()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()
  const dispatch = useAppDispatch()

  // Inline assignment editing
  const [isEditingAssigned, setIsEditingAssigned] = useState(false)
  const [target, setTarget] = useState("")
  const [targetObject, setTargetObject] = useState<{
    username: string
    display_name: string
  } | null>(null)
  const [options, setOptions] = useState<MinimalUser[]>([])

  // V2 order detail
  const { data: orderDetailV2 } = useGetOrderDetailQuery({
    orderId: order.order_id,
  })
  const hasV2Items = (orderDetailV2?.items?.length ?? 0) > 0

  // Member search for assignment
  const { data: membersData } = useGetContractorMembersQuery({
    spectrum_id: order.contractor || "",
    page: 0,
    page_size: 100,
    search: "",
    role_filter: "",
    sort: "username",
  })
  const members = membersData?.members || []

  const fetchOptions = useCallback(
    async (query: string) => {
      if (query.length < 3 || !order.contractor) return
      const { data } = await dispatch(
        contractorsApi.endpoints.searchContractorMembers.initiate({
          spectrum_id: order.contractor,
          query,
        }),
      )
      setOptions(data || [])
    },
    [order.contractor, dispatch],
  )

  const retrieve = useMemo(
    () => throttle((query: string) => fetchOptions(query), 400),
    [fetchOptions],
  )
  useEffect(() => {
    retrieve(target)
  }, [target, retrieve])

  // Mutations
  const [assignUser] = useAssignOrderMutation()
  const [unassignUser] = useUnassignOrderMutation()
  const [setOrderStatus] = useSetOrderStatusMutation()
  const [createOrderThread] = useCreateOrderThreadMutation()
  // The page's own order query (same args, same cache entry): re-read while
  // the bot creates the Discord thread.
  const { refetch: refetchOrder } = useGetOrderByIdQuery(order.order_id)
  const createThread = useCallback(
    () => createOrderThread(order.order_id).unwrap(),
    [createOrderThread, order.order_id],
  )

  // Status display
  const statusColor = useMemo(
    () => statusColors.get(order.status),
    [order.status],
  )
  const status = useMemo(
    () => statusNames.get(order.status) || statusNames.get("not-started")!,
    [order.status],
  )

  // Status update
  const updateOrderStatus = useCallback(
    async (newStatus: string) => {
      setOrderStatus({ order_id: order.order_id, status: newStatus })
        .unwrap()
        .then(() =>
          issueAlert({
            message: t("orderDetailsArea.updated_status"),
            severity: "success",
          }),
        )
        .catch((error) => issueAlert(error))
    },
    [order.order_id, issueAlert, setOrderStatus, t],
  )

  // Assignment handlers
  const handleAssignSave = useCallback(async () => {
    if (!targetObject) return
    const res = await assignUser({
      order_id: order.order_id,
      username: targetObject.username,
    })
    if ("data" in res && !("error" in res)) {
      issueAlert({
        message: t("memberAssignArea.assigned"),
        severity: "success",
      })
      setIsEditingAssigned(false)
      setTarget("")
      setTargetObject(null)
    } else {
      const error =
        "error" in res
          ? (res.error as { error?: string; data?: { error?: string } })
          : undefined
      issueAlert({
        message: `${t("memberAssignArea.failed_assign")} ${error?.error || error?.data?.error || ""}`,
        severity: "error",
      })
    }
  }, [assignUser, order.order_id, issueAlert, targetObject, t])

  const handleAssignCancel = useCallback(() => {
    setIsEditingAssigned(false)
    setTarget("")
    setTargetObject(null)
  }, [])

  const handleUnassign = useCallback(async () => {
    const res = await unassignUser({ order_id: order.order_id })
    if ("data" in res && !("error" in res)) {
      issueAlert({
        message: t("memberAssignArea.unassigned"),
        severity: "success",
      })
      setIsEditingAssigned(false)
    } else {
      const error =
        "error" in res
          ? (res.error as { error?: string; data?: { error?: string } })
          : undefined
      issueAlert({
        message: `${t("memberAssignArea.failed_unassign")} ${error?.error || error?.data?.error || ""}`,
        severity: "error",
      })
    }
  }, [unassignUser, order.order_id, issueAlert, t])

  // Related entity queries
  const { data: contractor, isLoading: contractorLoading } =
    useGetContractorBySpectrumIDQuery(order.contractor!, {
      skip: !order.contractor,
    })
  const { data: assigned, isLoading: assignedLoading } =
    useGetUserByUsernameQuery(order.assigned_to!, { skip: !order.assigned_to })
  const { data: customer, isLoading: customerLoading } =
    useGetUserByUsernameQuery(order.customer!, { skip: !order.customer })

  // Permission checks
  const roles = useOrderViewerRoles({
    customer: order.customer,
    assignedTo: order.assigned_to,
    contractor: order.contractor,
  })
  const actions = useMemo(
    () =>
      availableOrderActions(
        {
          status: order.status,
          assignedTo: order.assigned_to,
          contractor: order.contractor,
        },
        roles,
      ),
    [order.status, order.assigned_to, order.contractor, roles],
  )
  const server_id = order.discord_server_id

  const handleClaimOrder = useCallback(async () => {
    if (!profile?.username) return
    try {
      await assignUser({
        order_id: order.order_id,
        username: profile.username,
      }).unwrap()
      issueAlert({
        message: t("orderDetailsArea.claimed", "Order claimed"),
        severity: "success",
      })
    } catch {
      issueAlert({
        message: t("orderDetailsArea.claimFailed", "Failed to claim order"),
        severity: "error",
      })
    }
  }, [assignUser, order.order_id, profile?.username, issueAlert, t])

  return {
    profile,
    issueAlert,
    // Assignment editing
    isEditingAssigned,
    setIsEditingAssigned,
    target,
    setTarget,
    targetObject,
    setTargetObject,
    options,
    members,
    handleAssignSave,
    handleAssignCancel,
    handleUnassign,
    handleClaimOrder,
    // V2
    orderDetailV2,
    hasV2Items,
    // Status
    statusColor,
    status,
    updateOrderStatus,
    // Related entities
    contractor,
    assigned,
    customer,
    contractorLoading,
    assignedLoading,
    customerLoading,
    // Permissions
    roles,
    actions,
    server_id,
    // Thread
    createThread,
    refetchOrder,
  }
}
