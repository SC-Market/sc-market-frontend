import { useGetNotificationsQuery } from "../../notifications/api/notificationApi"
import { CHROME_NOTIFICATIONS_ARGS } from "../../notifications/chromeNotifications"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useStartupGateOpen } from "../../../util/startupDeferral"

/**
 * Hook to get count of pending orders requiring attention: unread "order
 * assigned" and "order status" notifications (`unread_order_count`).
 *
 * Reads the chrome's notifications request (the bell's first page, same
 * args), so the badge costs no request of its own. On the first page load it
 * waits for the startup gate (util/startupDeferral.ts); the badge is a chip
 * at the end of its nav row, so it appears without moving anything.
 */
export function usePendingOrderCount(): number {
  const { data: profile } = useGetUserProfileQuery()
  const isLoggedIn = !!profile
  const startupDone = useStartupGateOpen()

  const { data } = useGetNotificationsQuery(CHROME_NOTIFICATIONS_ARGS, {
    skip: !isLoggedIn || !startupDone,
  })

  return data?.unread_order_count ?? 0
}
