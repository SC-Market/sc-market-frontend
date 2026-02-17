import { useGetOrderByIdQuery } from "../../../store/orders"
import { useGetChatByOrderIDQuery } from "../../chats"
import { useGetOfferSessionByIDQuery } from "../../../store/offer"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../../store/notification"
import { useEffect } from "react"

export interface UsePageOrderResult {
  data:
    | {
        order: ReturnType<typeof useGetOrderByIdQuery>["data"]
        chat: ReturnType<typeof useGetChatByOrderIDQuery>["data"]
        offerSession: ReturnType<typeof useGetOfferSessionByIDQuery>["data"]
        notifications: ReturnType<typeof useGetNotificationsQuery>["data"]
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for ViewOrder page
 * Composes order-related queries (order, chat, notifications, offer session)
 */
export function usePageOrder(orderId: string): UsePageOrderResult {
  const orderQuery = useGetOrderByIdQuery(orderId)
  const order = orderQuery.data

  const chatQuery = useGetChatByOrderIDQuery(order?.order_id!, {
    skip: !order?.order_id,
  })

  const offerSessionQuery = useGetOfferSessionByIDQuery(
    order?.offer_session_id!,
    { skip: !order?.offer_session_id },
  )

  const notificationsQuery = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "order_message",
      entityId: orderId,
    },
    { skip: !orderId },
  )

  const [deleteNotification] = useNotificationDeleteMutation()

  // Delete message notifications when the page is viewed
  useEffect(() => {
    const notifications = notificationsQuery.data?.notifications || []
    if (notifications && notifications.length > 0) {
      const notificationIds = notifications.map((n) => n.notification_id)
      deleteNotification(notificationIds)
    }
  }, [notificationsQuery.data?.notifications, deleteNotification])

  return {
    data: order
      ? {
          order,
          chat: chatQuery.data,
          offerSession: offerSessionQuery.data,
          notifications: notificationsQuery.data,
        }
      : undefined,
    isLoading: orderQuery.isLoading,
    isFetching:
      orderQuery.isFetching ||
      chatQuery.isFetching ||
      offerSessionQuery.isFetching ||
      notificationsQuery.isFetching,
    error:
      orderQuery.error ||
      chatQuery.error ||
      offerSessionQuery.error ||
      notificationsQuery.error,
    refetch: () => {
      orderQuery.refetch()
      chatQuery.refetch()
      offerSessionQuery.refetch()
      notificationsQuery.refetch()
    },
  }
}
