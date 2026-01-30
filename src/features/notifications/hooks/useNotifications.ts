import { useCallback } from "react"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../api/notificationApi"
import type { NotificationScope } from "../domain/types"
import { useNotificationPollingInterval } from "../../../hooks/notifications/useNotificationPolling"

/**
 * Hook for managing notifications with filtering and pagination
 */
export function useNotifications(
  page: number = 0,
  pageSize: number = 20,
  scope: NotificationScope = "all",
  contractorId?: string,
) {
  // Calculate optimal polling interval based on push subscription and app visibility
  const pollingInterval = useNotificationPollingInterval()

  const { data, refetch, isLoading, error } = useGetNotificationsQuery(
    {
      page,
      pageSize,
      scope: scope !== "all" ? scope : undefined,
      contractorId: contractorId || undefined,
    },
    {
      pollingInterval: pollingInterval > 0 ? pollingInterval : undefined,
      refetchOnMountOrArgChange: true,
    },
  )

  const notifications = data?.notifications || []
  const pagination = data?.pagination
  const unreadCount = data?.unread_count || 0

  const [bulkUpdate] = useNotificationBulkUpdateMutation()
  const [bulkDelete] = useNotificationBulkDeleteMutation()

  const markAllAsRead = useCallback(async () => {
    try {
      return await bulkUpdate({ read: true }).unwrap()
    } catch (error) {
      throw error
    }
  }, [bulkUpdate])

  const deleteAll = useCallback(async () => {
    try {
      return await bulkDelete({}).unwrap()
    } catch (error) {
      throw error
    }
  }, [bulkDelete])

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAllAsRead,
    deleteAll,
  }
}
