// Import API to ensure it's registered (side effect)
import "./api/notificationApi"

// API exports
export {
  notificationApi,
  useNotificationUpdateMutation,
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "./api/notificationApi"

// Domain exports
export type {
  Notification,
  NotificationEntity,
  NotificationAction,
  NotificationScope,
  NotificationPagination,
  NotificationsResponse,
  NotificationQueryParams,
} from "./domain/types"

export { formatNotificationAction, getNotificationIcon } from "./domain/formatters"

// Hooks exports
export { useNotifications } from "./hooks/useNotifications"

// Component exports - re-export from existing components
export { NotificationEntry } from "./components/NotificationEntry"
export {
  NotificationBase,
  NotificationDeleteButton,
} from "../../components/navbar/NotificationsButton"
