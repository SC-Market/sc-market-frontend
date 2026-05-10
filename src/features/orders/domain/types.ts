import type { MinimalUser, User } from "../../../datatypes/User"
import type { MinimalContractor, Contractor } from "../../contractor/domain/types"
import type { AvailabilitySelection } from "../../../hooks/login/UserProfile"
import type { OfferMarketListing } from "../../offers/api/offerApi"

// ── Order Status & Kind ──

export type OrderStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"

export type OrderKind =
  | "Support"
  | "Escort"
  | "Transport"
  | "Construction"
  | "Resource Acquisition"
  | "Rental"
  | "Delivery"
  | "Medical"
  | "Intelligence Services"
  | "Misc"
  | "Custom"

export type PaymentType =
  | "one-time"
  | "hourly"
  | "daily"
  | "unit"
  | "box"
  | "scu"
  | "cscu"
  | "mscu"

// ── Core Entities ──

export interface Order {
  order_id: string
  status: OrderStatus
  kind: OrderKind
  cost: number
  rush: boolean
  assigned_to: string | null
  contractor: string | null
  customer: string
  title: string
  description: string
  timestamp: string
  comments: OrderComment[]
  applicants: OrderApplicant[]
  market_listings?: OfferMarketListing[]
  customer_review?: OrderReview
  contractor_review?: OrderReview
  service_id?: string | null
  payment_type: PaymentType
  availability?: OrderAvailability
  offer_session_id: string | null
  discord_thread_id: string | null
  discord_server_id: string | null
  discord_invite: string | null
}

export interface OrderAvailability {
  customer: AvailabilitySelection[]
  assigned: AvailabilitySelection[] | null
}

export interface OrderApplicant {
  order_id: string
  user_applicant: MinimalUser | null
  org_applicant: MinimalContractor | null
  timestamp: number
  message: string
}

export interface OrderComment {
  author: User
  content: string
  timestamp: number
  comment_id: string
  order_id: string
}

export interface OrderReview {
  user_author: MinimalUser | null
  contractor_author: MinimalContractor | null
  content: string
  timestamp: number
  review_id: string
  order_id: string
  rating: number
  role: "customer" | "contractor"
  revision_requested: boolean
  revision_requested_at: string | null
  last_modified_at: string
  revision_message: string | null
}

// ── Request/Response Bodies ──

export interface OrderBody {
  title: string
  rush: boolean
  description: string
  kind: string
  collateral: number
  departure: string | null
  destination: string | null
  cost: number
  contractor?: string | null
  assigned_to?: string | null
  service_id?: string | null
  payment_type: PaymentType
}

export interface ServiceBody {
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  kind: string
  collateral: number
  departure: string | null
  destination: string | null
  cost: number
  payment_type: PaymentType
  contractor?: string | null
  status: string
  photos: string[]
}

export interface Service {
  timestamp: string
  service_id: string
  service_name: string
  service_description: string
  title: string
  rush: boolean
  description: string
  kind: OrderKind
  collateral: number
  offer: number
  payment_type: PaymentType
  departure: string | null
  destination: string | null
  cost: number
  contractor?: Contractor | null
  user?: User | null
  status: "active" | "inactive"
  photos: string[]
  languages?: Array<{ code: string; name: string }>
}

// ── Search & List Types ──

export interface OrderStub {
  order_id: string
  contractor: MinimalContractor | null
  assigned_to: MinimalUser | null
  customer: MinimalUser
  status: OrderStatus
  timestamp: string
  service_name: string | null
  cost: string
  title: string
  payment_type: string
  count: number
  kind: string
}

export type OrderSearchSortMethod =
  | "title"
  | "customer_name"
  | "status"
  | "timestamp"
  | "contractor_name"

export type OrderSearchStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"
  | "active"
  | "past"

/** Extended filter including virtual tabs */
export type OrderStatusFilter = "all" | "unassigned" | OrderSearchStatus

/** Counts per status tab */
export interface OrderTotalCounts {
  all: number
  unassigned: number
  active: number
  past: number
  fulfilled: number
  "in-progress": number
  "not-started": number
  cancelled: number
}

export interface OrderSearchQuery {
  sort_method?: OrderSearchSortMethod
  status?: OrderSearchStatus
  assigned?: string
  unassigned?: string
  contractor?: string
  customer?: string
  index?: number
  page_size?: number
  reverse_sort?: boolean
  buyer_username?: string
  seller_username?: string
  has_market_listings?: boolean
  has_service?: boolean
  cost_min?: number
  cost_max?: number
  date_from?: string
  date_to?: string
}

// ── Analytics ──

export interface OrderTrendDatapoint {
  All: number
  Fulfilled: number
  "Not Started": number
  name: string
  "In-Progress": number
}

export interface OrderAnalytics {
  daily_totals: Array<{
    date: string
    total: number
    in_progress: number
    fulfilled: number
    cancelled: number
    not_started: number
  }>
  weekly_totals: Array<{
    date: string
    total: number
    in_progress: number
    fulfilled: number
    cancelled: number
    not_started: number
  }>
  monthly_totals: Array<{
    date: string
    total: number
    in_progress: number
    fulfilled: number
    cancelled: number
    not_started: number
    average_fulfilled_value?: number
  }>
  top_contractors: Array<{
    name: string
    fulfilled_orders: number
    total_orders: number
  }>
  top_users: Array<{
    username: string
    fulfilled_orders: number
    total_orders: number
  }>
  summary: {
    total_orders: number
    active_orders: number
    completed_orders: number
    total_value: number
  }
}

// ── Metrics ──

export interface ContractorOrderMetrics {
  total_orders: number
  total_value: number
  active_value: number
  completed_value: number
  status_counts: {
    "not-started": number
    "in-progress": number
    fulfilled: number
    cancelled: number
  }
  recent_activity: {
    orders_last_7_days: number
    orders_last_30_days: number
    value_last_7_days: number
    value_last_30_days: number
  }
  top_customers: Array<{
    username: string
    order_count: number
    total_value: number
  }>
  trend_data?: {
    daily_orders: Array<{ date: string; count: number }>
    daily_value: Array<{ date: string; value: number }>
    status_trends: {
      "not-started": Array<{ date: string; count: number }>
      "in-progress": Array<{ date: string; count: number }>
      fulfilled: Array<{ date: string; count: number }>
      cancelled: Array<{ date: string; count: number }>
    }
  }
}

export interface ContractorOrderData {
  metrics: ContractorOrderMetrics
  recent_orders?: Array<{
    order_id: string
    timestamp: string
    status: string
    cost: number
    title: string
  }>
}

// ── Order Settings ──

export interface OrderSetting {
  id: string
  entity_type: "user" | "contractor"
  entity_id: string
  setting_type:
    | "offer_message"
    | "order_message"
    | "require_availability"
    | "stock_subtraction_timing"
    | "allocation_mode"
    | "min_order_size"
    | "max_order_size"
    | "min_order_value"
    | "max_order_value"
  message_content: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface CreateOrderSettingRequest {
  setting_type: OrderSetting["setting_type"]
  message_content?: string
  enabled?: boolean
}

export interface UpdateOrderSettingRequest {
  message_content?: string
  enabled?: boolean
}

export interface OrderLimits {
  min_order_size?: string
  max_order_size?: string
  min_order_value?: string
  max_order_value?: string
}
