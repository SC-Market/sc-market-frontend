import { useCallback } from "react"
import { useNotifications } from "./useNotifications"
import { useGetUserOrganizationsQuery } from "../../../store/organizations"
import type { NotificationScope } from "../domain/types"

export interface UsePageNotificationsParams {
  page: number
  pageSize: number
  scope: NotificationScope
  contractorId?: string
}

export interface UsePageNotificationsResult {
  data:
    | {
        notifications: any[]
        pagination: any
        unreadCount: number
        organizations: any[]
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
  markAllAsRead: () => Promise<any>
  deleteAll: () => Promise<any>
}

/**
 * Page hook for NotificationsPage
 * Composes notifications and organizations queries
 */
export function usePageNotifications(
  params: UsePageNotificationsParams,
): UsePageNotificationsResult {
  const { page, pageSize, scope, contractorId } = params

  const notificationsData = useNotifications(
    page,
    pageSize,
    scope,
    contractorId,
  )
  const { data: organizationsData, isLoading: orgsLoading } =
    useGetUserOrganizationsQuery()

  const refetch = useCallback(() => {
    notificationsData.refetch()
  }, [notificationsData])

  return {
    data:
      notificationsData.notifications || organizationsData
        ? {
            notifications: notificationsData.notifications,
            pagination: notificationsData.pagination,
            unreadCount: notificationsData.unreadCount,
            organizations: organizationsData || [],
          }
        : undefined,
    isLoading: notificationsData.isLoading || orgsLoading,
    isFetching: notificationsData.isLoading || orgsLoading,
    error: notificationsData.error,
    refetch,
    markAllAsRead: notificationsData.markAllAsRead,
    deleteAll: notificationsData.deleteAll,
  }
}
