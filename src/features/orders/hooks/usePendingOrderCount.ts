import { useGetNotificationsQuery } from "../../notifications/api/notificationApi"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"

/**
 * Hook to get count of pending orders requiring attention.
 * Uses unread_count from notifications API.
 */
export function usePendingOrderCount(): number {
  const { data: profile } = useGetUserProfileQuery()
  const isLoggedIn = !!profile

  const { data: assignmentData } = useGetNotificationsQuery(
    { action: "order_assigned" },
    { skip: !isLoggedIn },
  )

  const { data: statusData } = useGetNotificationsQuery(
    { action: "order_status" },
    { skip: !isLoggedIn },
  )

  return (assignmentData?.unread_count ?? 0) + (statusData?.unread_count ?? 0)
}
