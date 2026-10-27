import { useCallback, useMemo, useState } from "react"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../../notifications/api/notificationApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { useIsAuthenticated } from "../../../hooks/login/useSession"
import { useNotificationPollingInterval } from "../../../hooks/notifications/useNotificationPolling"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { useBadgeAPI } from "../../../hooks/pwa/useBadgeAPI"
import type { NotificationScope } from "../domain/types"
import { useStartupGateOpen } from "../../../util/startupDeferral"
import {
  CHROME_NOTIFICATIONS_PAGE,
  CHROME_NOTIFICATIONS_PAGE_SIZE,
} from "../chromeNotifications"

/** Map frontend scope labels to the backend query param values */
function mapScopeToBackend(scope: NotificationScope): "individual" | "organization" | undefined {
  if (scope === "personal") return "individual"
  if (scope === "shop") return "organization"
  return undefined
}

export function useNotifications() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  // The initial state is the chrome's request (CHROME_NOTIFICATIONS_ARGS),
  // shared with the My Orders badge.
  const [page, setPage] = useState(CHROME_NOTIFICATIONS_PAGE)
  const [pageSize, setPageSize] = useState(CHROME_NOTIFICATIONS_PAGE_SIZE)
  const [scopeFilter, setScopeFilter] = useState<NotificationScope>("all")
  const [shopIdFilter, setShopIdFilter] = useState("")

  const { data: currentUser } = useGetUserProfileQuery()
  const isLoggedIn = !!currentUser
  const isAuthenticated = useIsAuthenticated()
  // The bell (its count, list, shop filter and polling) waits for the
  // startup gate on the first page load (util/startupDeferral.ts).
  const startupDone = useStartupGateOpen()
  const { data: shopsData } = useGetMyShopsQuery(undefined, {
    skip: !isAuthenticated || !startupDone,
  })
  const pollingInterval = useNotificationPollingInterval(isLoggedIn && startupDone)

  const { data: notificationsData } = useGetNotificationsQuery(
    {
      page, pageSize,
      scope: mapScopeToBackend(scopeFilter),
      contractorId: shopIdFilter || undefined,
    },
    {
      skip: !isLoggedIn || !startupDone,
      pollingInterval: pollingInterval > 0 ? pollingInterval : undefined,
      refetchOnMountOrArgChange: true,
    },
  )

  // No refetch() effect on page / pageSize: refetchOnMountOrArgChange
  // already fetches each new page, and refetch() throws while the query is
  // skipped (logged out, or before the startup gate opens).

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
    isLoggedIn, shopsData,
    notifications, total, unreadCount,
    page, pageSize, handleChangePage, handleChangeRowsPerPage, resetPage,
    scopeFilter, setScopeFilter,
    shopIdFilter, setShopIdFilter,
    markAllReadCallback, deleteAllCallback,
  }
}
