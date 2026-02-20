import { useEffect } from "react"
import { useGetOfferSessionByIDQuery } from "../../../store/offer"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../../store/notification"

/**
 * Page hook for offer detail pages
 * Composes offer session data and notification management
 */
export function usePageOffer(offerId: string | undefined) {
  const offerQuery = useGetOfferSessionByIDQuery(offerId!, {
    skip: !offerId,
  })

  // Get and delete message notifications for this offer
  const notificationsQuery = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "offer_message",
      entityId: offerId,
    },
    {
      skip: !offerId,
    },
  )

  const [deleteNotification] = useNotificationDeleteMutation()

  // Delete message notifications when the page is viewed
  useEffect(() => {
    const notifications = notificationsQuery.data?.notifications || []
    if (notifications.length > 0) {
      const notificationIds = notifications.map((n) => n.notification_id)
      deleteNotification(notificationIds)
    }
  }, [notificationsQuery.data?.notifications, deleteNotification])

  return {
    data:
      offerQuery.data && notificationsQuery.data
        ? {
            session: offerQuery.data,
            notifications: notificationsQuery.data,
          }
        : undefined,
    isLoading: offerQuery.isLoading || notificationsQuery.isLoading,
    isFetching: offerQuery.isFetching || notificationsQuery.isFetching,
    error: offerQuery.error || notificationsQuery.error,
    refetch: () => {
      offerQuery.refetch()
      notificationsQuery.refetch()
    },
  }
}
