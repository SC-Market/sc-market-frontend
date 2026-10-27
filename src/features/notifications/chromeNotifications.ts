/**
 * The app chrome's notifications request: the first page of the bell's list
 * (NotificationsButton, useNotifications) in its initial state. The My
 * Orders badge (usePendingOrderCount) reads `unread_order_count` from the
 * same response, so the chrome sends one notifications request, not three.
 */
export const CHROME_NOTIFICATIONS_PAGE = 0
export const CHROME_NOTIFICATIONS_PAGE_SIZE = 5

export const CHROME_NOTIFICATIONS_ARGS = {
  page: CHROME_NOTIFICATIONS_PAGE,
  pageSize: CHROME_NOTIFICATIONS_PAGE_SIZE,
}
