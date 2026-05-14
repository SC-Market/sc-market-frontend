import { useCallback } from "react"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../api/notificationApi"
import { useGetUserOrganizationsQuery, type UserOrganization } from "../../contractor/api/organizationsApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import type { Notification } from "../../../hooks/login/UserProfile"

export interface UsePageNotificationsParams {
  page: number
  pageSize: number
  scope: string
  contractorId?: string
}

export interface UsePageNotificationsResult {
  data:
    | {
        notifications: Notification[]
        pagination: {
          total: number
          currentPage: number
          pageSize: number
          totalPages: number
          hasNextPage: boolean
          hasPreviousPage: boolean
        } | undefined
        unreadCount: number
        organizations: UserOrganization[]
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
  markAllAsRead: () => Promise<{ success: boolean; message: string; affected_count: number }>
  deleteAll: () => Promise<{ success: boolean; message: string; affected_count: number }>
}

export function usePageNotifications(
  params: UsePageNotificationsParams,
): UsePageNotificationsResult {
  const { page, pageSize, scope, contractorId } = params

  const { data: currentUser } = useGetUserProfileQuery()
  const isLoggedIn = !!currentUser

  const {
    data: notificationsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetNotificationsQuery(
    {
      page,
      pageSize,
      scope: scope !== "all" ? (scope as "individual" | "organization") : undefined,
      contractorId: contractorId || undefined,
    },
    { skip: !isLoggedIn },
  )

  const { data: organizationsData, isLoading: orgsLoading } =
    useGetUserOrganizationsQuery()

  const [bulkUpdate] = useNotificationBulkUpdateMutation()
  const [bulkDelete] = useNotificationBulkDeleteMutation()

  const markAllAsRead = useCallback(
    () => bulkUpdate({ read: true }).unwrap(),
    [bulkUpdate],
  )

  const deleteAll = useCallback(
    () => bulkDelete({}).unwrap(),
    [bulkDelete],
  )

  return {
    data:
      notificationsData || organizationsData
        ? {
            notifications: notificationsData?.notifications || [],
            pagination: notificationsData?.pagination,
            unreadCount: notificationsData?.unread_count || 0,
            organizations: organizationsData || [],
          }
        : undefined,
    isLoading: isLoading || orgsLoading,
    isFetching: isFetching || orgsLoading,
    error,
    refetch,
    markAllAsRead,
    deleteAll,
  }
}
