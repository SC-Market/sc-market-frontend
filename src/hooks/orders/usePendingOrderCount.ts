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

  // Get unread count for each order status change type
  const { data: fulfilledData } = useGetNotificationsQuery(
    { action: "order_status_fulfilled" },
    { skip: !isLoggedIn },
  )
  const { data: inProgressData } = useGetNotificationsQuery(
    { action: "order_status_in_progress" },
    { skip: !isLoggedIn },
  )
  const { data: notStartedData } = useGetNotificationsQuery(
    { action: "order_status_not_started" },
    { skip: !isLoggedIn },
  )
  const { data: cancelledData } = useGetNotificationsQuery(
    { action: "order_status_cancelled" },
    { skip: !isLoggedIn },
  )

  const assignmentCount = assignmentData?.unread_count ?? 0
  const statusCount =
    (fulfilledData?.unread_count ?? 0) +
    (inProgressData?.unread_count ?? 0) +
    (notStartedData?.unread_count ?? 0) +
    (cancelledData?.unread_count ?? 0)

  return assignmentCount + statusCount
}
