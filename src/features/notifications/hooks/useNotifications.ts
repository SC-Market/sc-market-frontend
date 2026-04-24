import { useCallback, useEffect, useMemo, useState } from "react"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../../notifications/api/notificationApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useGetUserOrganizationsQuery } from "../../contractor/api/organizationsApi"
import { useNotificationPollingInterval } from "../../../hooks/notifications/useNotificationPolling"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { useBadgeAPI } from "../../../hooks/pwa/useBadgeAPI"

export function useNotifications() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [scopeFilter, setScopeFilter] = useState<"individual" | "organization" | "all">("all")
  const [contractorIdFilter, setContractorIdFilter] = useState("")

  const { data: currentUser } = useGetUserProfileQuery()
  const isLoggedIn = !!currentUser
  const { data: organizationsData } = useGetUserOrganizationsQuery()
  const pollingInterval = useNotificationPollingInterval()

  const { data: notificationsData, refetch } = useGetNotificationsQuery(
    {
      page, pageSize,
      scope: scopeFilter !== "all" ? scopeFilter : undefined,
      contractorId: contractorIdFilter || undefined,
    },
    {
      skip: !isLoggedIn,
      pollingInterval: pollingInterval > 0 ? pollingInterval : undefined,
      refetchOnMountOrArgChange: true,
    },
  )

  useEffect(() => { refetch() }, [page, pageSize, refetch])

  const notifications = notificationsData?.notifications || []
  const total = notificationsData?.pagination?.total || 0
  const unreadCount = notificationsData?.unread_count || 0

  useBadgeAPI(unreadCount)

  const [bulkUpdate] = useNotificationBulkUpdateMutation()
  const [bulkDelete] = useNotificationBulkDeleteMutation()

  const markAllReadCallback = useCallback(async () => {
    try {
      const result = await bulkUpdate({ read: true }).unwrap()
      issueAlert({ severity: "success", message: t("notifications.marked_all_read", { count: result.affected_count }) })
    } catch {
      issueAlert({ severity: "error", message: t("notifications.mark_all_read_failed") })
    }
  }, [bulkUpdate, issueAlert, t])

  const deleteAllCallback = useCallback(async () => {
    try {
      const result = await bulkDelete({}).unwrap()
      issueAlert({ severity: "success", message: t("notifications.cleared_all", { count: result.affected_count }) })
    } catch {
      issueAlert({ severity: "error", message: t("notifications.clear_all_failed") })
    }
  }, [bulkDelete, issueAlert, t])

  const handleChangePage = useCallback((_: unknown, newPage: number) => setPage(newPage), [])
  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10)); setPage(0)
  }, [])

  const resetPage = useCallback(() => setPage(0), [])

  return {
    isLoggedIn, organizationsData,
    notifications, total, unreadCount,
    page, pageSize, handleChangePage, handleChangeRowsPerPage, resetPage,
    scopeFilter, setScopeFilter,
    contractorIdFilter, setContractorIdFilter,
    markAllReadCallback, deleteAllCallback,
  }
}
