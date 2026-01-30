import { Contractor, ContractorInvite } from "../../../datatypes/Contractor"
import { Order, OrderComment, OrderReview } from "../../../datatypes/Order"
import { MarketBid, MarketListing } from "../../../features/market"
import { MinimalUser } from "../../../datatypes/User"
import { OfferSession } from "../../../store/offer"

/**
 * Notification entity types
 */
export type NotificationEntity =
  | ContractorInvite
  | Order
  | Contractor
  | MarketListing
  | MarketBid
  | OrderReview
  | OrderComment
  | OfferSession

/**
 * Notification action types
 */
export type NotificationAction =
  | "order_create"
  | "order_assigned"
  | "order_review"
  | "order_status_fulfilled"
  | "order_status_in_progress"
  | "order_status_not_started"
  | "order_status_cancelled"
  | "order_comment"
  | "order_message"
  | "contractor_invite"
  | "market_item_bid"
  | "market_item_offer"
  | "offer_create"
  | "counter_offer_create"
  | "offer_message"
  | "admin_alert"
  | "order_review_revision_requested"

/**
 * Notification scope
 */
export type NotificationScope = "individual" | "organization" | "all"

/**
 * Notification data structure
 */
export interface Notification {
  read: boolean
  notification_id: string
  action: string
  entity_type: string
  entity: NotificationEntity
  timestamp: string
  actors: MinimalUser[]
  scope?: NotificationScope
  contractor_id?: string | null
}

/**
 * Notification pagination response
 */
export interface NotificationPagination {
  total: number
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Notifications query response
 */
export interface NotificationsResponse {
  notifications: Notification[]
  pagination: NotificationPagination
  unread_count: number
}

/**
 * Notification query parameters
 */
export interface NotificationQueryParams {
  page?: number
  pageSize?: number
  action?: string
  entityId?: string
  scope?: NotificationScope
  contractorId?: string
}
