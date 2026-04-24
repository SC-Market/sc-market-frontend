import { useGetNotificationsQuery } from "../../../store/notification"
import { useGetUserProfileQuery } from "../../../store/profile"

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
