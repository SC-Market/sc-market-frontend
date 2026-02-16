import { useGetNotificationsQuery } from "../../store/notification"
import { useGetUserProfileQuery } from "../../store/profile"

/**
 * Hook to get count of pending orders requiring attention
 * Uses unread_count from notifications API
 */
export function usePendingOrderCount(): number {
  const { data: profile } = useGetUserProfileQuery()
  const isLoggedIn = !!profile

  // Get unread count for order assignments
  const { data: assignmentData } = useGetNotificationsQuery(
    {
      action: "order_assigned",
    },
    { skip: !isLoggedIn },
  )

  // Get unread count for order status changes
  const { data: statusData } = useGetNotificationsQuery(
    {
      action: "order_status",
    },
    { skip: !isLoggedIn },
  )

  const assignmentCount = assignmentData?.unread_count ?? 0
  const statusCount = statusData?.unread_count ?? 0

  return assignmentCount + statusCount
}
