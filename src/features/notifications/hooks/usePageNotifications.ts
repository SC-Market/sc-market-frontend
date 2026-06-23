import { useCallback } from "react"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../api/notificationApi"
import { useGetMyShopsQuery, type ShopResponse } from "../../../store/api/v2/market"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import type { Notification } from "../../../hooks/login/UserProfile"
import type { NotificationScope } from "../domain/types"

/** Map frontend scope labels to backend query param values */
function mapScopeToBackend(scope: NotificationScope | undefined): "individual" | "organization" | undefined {
  if (scope === "personal") return "individual"
  if (scope === "shop") return "organization"
  return undefined
}

export interface UsePageNotificationsParams {
  page: number
  pageSize: number
  scope: NotificationScope
  shopId?: string
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
        shops: ShopResponse[]
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
  const { page, pageSize, scope, shopId } = params

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
      scope: mapScopeToBackend(scope),
      contractorId: shopId || undefined,
    },
    { skip: !isLoggedIn },
  )

  const { data: shopsData, isLoading: shopsLoading } =
    useGetMyShopsQuery(undefined, { skip: !isLoggedIn })

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
      notificationsData || shopsData
        ? {
            notifications: notificationsData?.notifications || [],
            pagination: notificationsData?.pagination,
            unreadCount: notificationsData?.unread_count || 0,
            shops: shopsData || [],
          }
        : undefined,
    isLoading: isLoading || shopsLoading,
    isFetching: isFetching || shopsLoading,
    error,
    refetch,
    markAllAsRead,
    deleteAll,
  }
}
