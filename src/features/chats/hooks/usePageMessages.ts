import { useGetChatByIDQuery } from "../api/chatsApi"
import {
  useGetNotificationsQuery,
  useNotificationUpdateMutation,
} from "../../../store/notification"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useEffect } from "react"
import type { Chat } from "../domain/types"

export interface UsePageMessagesResult {
  data:
    | {
        chat: Chat
        profile: any
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for Messages page
 * Encapsulates data fetching for a specific chat and notification handling
 */
export function usePageMessages(
  chatId: string | undefined,
): UsePageMessagesResult {
  const { data: profile } = useGetUserProfileQuery()
  const isLoggedIn = !!profile

  const {
    data: chatObj,
    isLoading,
    isFetching,
    error,
    refetch: refetchChat,
  } = useGetChatByIDQuery(chatId!, {
    skip: !chatId,
  })

  // Get notifications for this chat
  const { data: orderNotificationsData } = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "order_message",
      entityId: chatObj?.order_id || undefined,
    },
    { skip: !chatId || !chatObj?.order_id || !isLoggedIn },
  )

  const { data: offerNotificationsData } = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "offer_message",
      entityId: chatObj?.session_id || undefined,
    },
    { skip: !chatId || !chatObj?.session_id || !isLoggedIn },
  )

  // Use the appropriate notification data based on chat type
  const notificationsData = chatObj?.order_id
    ? orderNotificationsData
    : chatObj?.session_id
      ? offerNotificationsData
      : undefined
  const notifications = notificationsData?.notifications || []
  const [updateNotification] = useNotificationUpdateMutation()

  // Mark chat notifications as read when viewing the chat
  useEffect(() => {
    if (chatId && notifications.length > 0) {
      const unreadNotifications = notifications.filter((n) => !n.read)
      if (unreadNotifications.length > 0) {
        // Mark each unread notification for this chat as read
        unreadNotifications.forEach((notif) => {
          updateNotification({
            notification_id: notif.notification_id,
            read: true,
          }).catch((err) => {
            // Silently fail - notifications will update on next query
            console.error("Failed to mark notification as read:", err)
          })
        })
      }
    }
  }, [chatId, notifications, updateNotification])

  return {
    data: chatObj
      ? {
          chat: chatObj,
          profile,
        }
      : undefined,
    isLoading,
    isFetching,
    error,
    refetch: refetchChat,
  }
}
