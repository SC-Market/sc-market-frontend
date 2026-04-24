import { useEffect } from "react"
import { useGetOfferSessionQuery } from "../../../store/api/v2/market"
import type { GetOfferSessionV2Response } from "../../../store/api/v2/market"
import {
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
} from "../../notifications/api/notificationApi"

/**
 * Page hook for offer detail pages.
 * Returns V2 types directly — no mapping to V1 shapes.
 */
export function usePageOffer(offerId: string | undefined) {
  const offerQuery = useGetOfferSessionQuery(
    { sessionId: offerId! },
    { skip: !offerId },
  )

  const notificationsQuery = useGetNotificationsQuery(
    {
      page: 0,
      pageSize: 100,
      action: "offer_message",
      entityId: offerId,
    },
    { skip: !offerId },
  )

  const [deleteNotification] = useNotificationDeleteMutation()

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
