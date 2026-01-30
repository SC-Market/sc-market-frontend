import { serviceApi as api } from "../service"
export const addTagTypes = ["Notifications"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      updateNotification: build.mutation<
        UpdateNotificationApiResponse,
        UpdateNotificationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/notification/${queryArg.notificationId}`,
          method: "PATCH",
          body: queryArg.notificationUpdateBody,
        }),
        invalidatesTags: ["Notifications"],
      }),
      deleteNotification: build.mutation<
        DeleteNotificationApiResponse,
        DeleteNotificationApiArg
      >({
        query: (queryArg) => ({
          url: `/api/notification/${queryArg.notificationId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Notifications"],
      }),
      bulkUpdateNotifications: build.mutation<
        BulkUpdateNotificationsApiResponse,
        BulkUpdateNotificationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/notification/`,
          method: "PATCH",
          body: queryArg.notificationBulkUpdateBody,
        }),
        invalidatesTags: ["Notifications"],
      }),
      bulkDeleteNotifications: build.mutation<
        BulkDeleteNotificationsApiResponse,
        BulkDeleteNotificationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/notification/`,
          method: "DELETE",
          body: queryArg.body,
        }),
        invalidatesTags: ["Notifications"],
      }),
      getPaginatedNotifications: build.query<
        GetPaginatedNotificationsApiResponse,
        GetPaginatedNotificationsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/notification/${queryArg.page}`,
          params: {
            pageSize: queryArg.pageSize,
            action: queryArg.action,
            entityId: queryArg.entityId,
            scope: queryArg.scope,
            contractorId: queryArg.contractorId,
          },
        }),
        providesTags: ["Notifications"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as notificationsApi }
export type UpdateNotificationApiResponse =
  /** status 200 Notification updated successfully */ SuccessResponse
export type UpdateNotificationApiArg = {
  /** ID of the notification to update */
  notificationId: string
  notificationUpdateBody: NotificationUpdateBody
}
export type DeleteNotificationApiResponse =
  /** status 200 Notification deleted successfully */ SuccessResponse
export type DeleteNotificationApiArg = {
  /** ID of the notification to delete */
  notificationId: string
}
export type BulkUpdateNotificationsApiResponse =
  /** status 200 Notifications updated successfully */ BulkActionResponse
export type BulkUpdateNotificationsApiArg = {
  notificationBulkUpdateBody: NotificationBulkUpdateBody
}
export type BulkDeleteNotificationsApiResponse =
  /** status 200 Notifications deleted successfully */ BulkActionResponse
export type BulkDeleteNotificationsApiArg = {
  body: {
    /** Array of notification IDs to delete. If omitted or empty, all notifications will be deleted. */
    notification_ids?: string[]
  }
}
export type GetPaginatedNotificationsApiResponse =
  /** status 200 Paginated notifications retrieved successfully */ PaginatedNotificationsResponse
export type GetPaginatedNotificationsApiArg = {
  /** Page number (0-based) */
  page: number
  /** Number of notifications per page (1-100, default: 20) */
  pageSize?: number
  /** Filter notifications by action type. See NotificationActionType schema for available values. Examples: 'order_message', 'offer_message', 'order_create', 'market_item_bid' */
  action?: NotificationActionType
  /** Filter notifications by entity ID (e.g., order ID, market listing ID). The entity type is determined by the action filter. */
  entityId?: string
  /** Filter notifications by scope: 'individual' for personal notifications, 'organization' for org notifications, 'all' for all notifications. */
  scope?: "individual" | "organization" | "all"
  /** Filter notifications by specific organization/contractor ID. Only applies when scope is 'organization'. */
  contractorId?: string
}
export type SuccessResponse = {
  success: boolean
  message: string
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type Unauthorized = {
  message: "Unauthorized"
}
export type NotFound = {
  message: "Not Found"
}
export type RateLimitError = {
  /** Error type identifier */
  error: "RATE_LIMIT_EXCEEDED"
  /** Human-readable error message */
  message: string
  /** Seconds to wait before retrying */
  retryAfter: number
  /** Maximum requests allowed per time window */
  limit: number
  /** Requests remaining in current window */
  remaining: number
  /** Unix timestamp when rate limit resets */
  resetTime: number
  /** User tier that triggered the rate limit */
  userTier: "anonymous" | "authenticated" | "admin"
  /** Endpoint that was rate limited */
  endpoint: string
}
export type ServerError = {
  message: "Internal Server Error"
}
export type NotificationUpdateBody = {
  /** Whether the notification should be marked as read */
  read: boolean
}
export type BulkActionResponse = {
  success: boolean
  message: string
  affected_count: number
}
export type NotificationBulkUpdateBody = {
  /** Whether all notifications should be marked as read */
  read: boolean
}
export type NotificationActionType =
  | "order_create"
  | "order_assigned"
  | "order_status_fulfilled"
  | "order_status_in_progress"
  | "order_status_not_started"
  | "order_status_cancelled"
  | "order_comment"
  | "order_review"
  | "order_review_revision_requested"
  | "order_contractor_applied"
  | "public_order_create"
  | "order_message"
  | "offer_create"
  | "counter_offer_create"
  | "offer_message"
  | "market_item_bid"
  | "market_item_offer"
  | "market_bid_accepted"
  | "market_bid_declined"
  | "market_offer_accepted"
  | "market_offer_declined"
  | "contractor_invite"
  | "admin_alert"
export type NotificationEntityType =
  | "orders"
  | "order_reviews"
  | "order_comments"
  | "order_applicants"
  | "offer_sessions"
  | "market_listing"
  | "market_bids"
  | "market_offers"
  | "contractor_invites"
  | "admin_alerts"
export type Notification = {
  /** Whether the notification has been read by the user */
  read: boolean
  /** Unique identifier for the notification */
  notification_id: string
  /** The type of action that triggered this notification */
  action: NotificationActionType
  /** List of users who performed the action that triggered this notification */
  actors: {
    username?: string
    avatar?: string
  }[]
  /** The type of entity this notification relates to */
  entity_type: NotificationEntityType
  /** The actual entity object this notification relates to (order, offer, etc.) */
  entity: object
  /** When the notification was created */
  timestamp: string
}
export type PaginatedNotificationsResponse = {
  notifications: Notification[]
  pagination: {
    currentPage: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  /** Total number of unread notifications matching the current search criteria */
  unread_count: number
}
export const {
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useBulkUpdateNotificationsMutation,
  useBulkDeleteNotificationsMutation,
  useGetPaginatedNotificationsQuery,
} = injectedRtkApi
