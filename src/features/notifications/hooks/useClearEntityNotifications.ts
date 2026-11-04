import { useEffect } from "react"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../api/notificationApi"

/**
 * While an order's or offer's messages are open, clear the viewer's
 * "new message" notifications for it (they've now seen the messages).
 */
export function useClearEntityNotifications(
  action: "order_message" | "offer_message",
  entityId: string,
) {
  const { data } = useGetNotificationsQuery({
    page: 0,
    pageSize: 100,
    action,
    entityId,
  })
  const [deleteNotifications] = useNotificationDeleteMutation()

  useEffect(() => {
    const notifications = data?.notifications
    if (notifications && notifications.length > 0) {
      // Already filtered by action and entity: every match is cleared.
      deleteNotifications(notifications.map((n) => n.notification_id))
    }
  }, [data, deleteNotifications])
}
