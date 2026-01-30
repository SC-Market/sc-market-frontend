/**
 * Notification API endpoints
 * 
 * Re-exports from the existing store/notification.ts to maintain compatibility
 * while providing a feature-based structure. In the future, this can be migrated
 * to use the feature's domain types.
 */
export {
  notificationApi,
  useNotificationUpdateMutation,
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../../../store/notification"
