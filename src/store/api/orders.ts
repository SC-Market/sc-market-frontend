import { serviceApi as api } from "../service"
export const addTagTypes = [
  "Orders",
  "Offers",
  "Order Reviews",
  "Order Applicants",
  "Order Threads",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createANewOrder: build.mutation<
        CreateANewOrderApiResponse,
        CreateANewOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/`,
          method: "POST",
          body: queryArg.orderBody,
        }),
        invalidatesTags: ["Orders", "Offers"],
      }),
      searchOrders: build.query<SearchOrdersApiResponse, SearchOrdersApiArg>({
        query: (queryArg) => ({
          url: `/api/orders/search`,
          params: {
            contractor: queryArg.contractor,
            assigned: queryArg.assigned,
            customer: queryArg.customer,
            sort_method: queryArg.sortMethod,
            status: queryArg.status,
            index: queryArg.index,
            page_size: queryArg.pageSize,
            reverse_sort: queryArg.reverseSort,
            buyer_username: queryArg.buyerUsername,
            seller_username: queryArg.sellerUsername,
            has_market_listings: queryArg.hasMarketListings,
            has_service: queryArg.hasService,
            cost_min: queryArg.costMin,
            cost_max: queryArg.costMax,
            date_from: queryArg.dateFrom,
            date_to: queryArg.dateTo,
          },
        }),
        providesTags: ["Orders"],
      }),
      getContractorOrderMetrics: build.query<
        GetContractorOrderMetricsApiResponse,
        GetContractorOrderMetricsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/contractor/${queryArg.spectrumId}/metrics`,
        }),
        providesTags: ["Orders"],
      }),
      getContractorOrderData: build.query<
        GetContractorOrderDataApiResponse,
        GetContractorOrderDataApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/contractor/${queryArg.spectrumId}/data`,
          params: {
            include_trends: queryArg.includeTrends,
            assigned_only: queryArg.assignedOnly,
          },
        }),
        providesTags: ["Orders"],
      }),
      getUserOrderData: build.query<
        GetUserOrderDataApiResponse,
        GetUserOrderDataApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/user/data`,
          params: {
            include_trends: queryArg.includeTrends,
          },
        }),
        providesTags: ["Orders"],
      }),
      postReview: build.mutation<PostReviewApiResponse, PostReviewApiArg>({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/review`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Order Reviews"],
      }),
      requestReviewRevision: build.mutation<
        RequestReviewRevisionApiResponse,
        RequestReviewRevisionApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/reviews/${queryArg.reviewId}/request-revision`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Order Reviews"],
      }),
      updateOrderReview: build.mutation<
        UpdateOrderReviewApiResponse,
        UpdateOrderReviewApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/reviews/${queryArg.reviewId}`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Order Reviews"],
      }),
      updateOrder: build.mutation<UpdateOrderApiResponse, UpdateOrderApiArg>({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Orders"],
      }),
      getOrderById: build.query<GetOrderByIdApiResponse, GetOrderByIdApiArg>({
        query: (queryArg) => ({ url: `/api/orders/${queryArg.orderId}` }),
        providesTags: ["Orders"],
      }),
      postApply: build.mutation<PostApplyApiResponse, PostApplyApiArg>({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/applicants`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Order Applicants"],
      }),
      acceptContractorApplicationOnOrder: build.mutation<
        AcceptContractorApplicationOnOrderApiResponse,
        AcceptContractorApplicationOnOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/applicants/contractors/${queryArg.spectrumId}`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Order Applicants"],
      }),
      acceptUserApplicationOnOrder: build.mutation<
        AcceptUserApplicationOnOrderApiResponse,
        AcceptUserApplicationOnOrderApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/applicants/users/${queryArg.username}`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Order Applicants"],
      }),
      createOrderThread: build.mutation<
        CreateOrderThreadApiResponse,
        CreateOrderThreadApiArg
      >({
        query: (queryArg) => ({
          url: `/api/orders/${queryArg.orderId}/thread`,
          method: "POST",
        }),
        invalidatesTags: ["Order Threads"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as ordersApi }
export type CreateANewOrderApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {
      discord_invite?: string | null
      session_id?: string
    }
  }
export type CreateANewOrderApiArg = {
  orderBody: OrderBody
}
export type SearchOrdersApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: {
      items?: OrderStub[]
      item_count?: number
    }
  }
export type SearchOrdersApiArg = {
  /** The Spectrum ID of the contracting org */
  contractor?: string
  /** The assigned user's username */
  assigned?: string
  /** The customer's username */
  customer?: string
  /** The method to sort results by */
  sortMethod?:
    | "title"
    | "customer_name"
    | "status"
    | "timestamp"
    | "contractor_name"
  /** The current status of the order */
  status?:
    | "fulfilled"
    | "in-progress"
    | "not-started"
    | "cancelled"
    | "active"
    | "past"
  /** The page index of the search */
  index?: number
  /** The page size for the search */
  pageSize?: number
  /** Whether to reverse the sort */
  reverseSort?: boolean
  /** Filter by buyer (customer) username (for seller view) */
  buyerUsername?: string
  /** Filter by seller username (contractor spectrum_id or assigned user username) (for buyer view) */
  sellerUsername?: string
  /** Filter orders that have market listings attached */
  hasMarketListings?: boolean
  /** Filter orders that have a service attached */
  hasService?: boolean
  /** Minimum cost filter */
  costMin?: number
  /** Maximum cost filter */
  costMax?: number
  /** Filter orders created after this date (ISO 8601 format) */
  dateFrom?: string
  /** Filter orders created before this date (ISO 8601 format) */
  dateTo?: string
}
export type GetContractorOrderMetricsApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: {
      /** Total number of orders */
      total_orders: number
      /** Total value of all orders */
      total_value: number
      /** Total value of active orders (not-started + in-progress) */
      active_value: number
      /** Total value of completed orders (fulfilled) */
      completed_value: number
      /** Count of orders by status */
      status_counts: {
        "not-started"?: number
        "in-progress"?: number
        fulfilled?: number
        cancelled?: number
      }
      /** Recent activity metrics */
      recent_activity: {
        orders_last_7_days?: number
        orders_last_30_days?: number
        value_last_7_days?: number
        value_last_30_days?: number
      }
      /** Top customers by order count */
      top_customers?: {
        username?: string
        order_count?: number
        total_value?: number
      }[]
    }
  }
export type GetContractorOrderMetricsApiArg = {
  /** The Spectrum ID of the contractor */
  spectrumId: string
}
export type GetContractorOrderDataApiResponse =
  /** status 200 Comprehensive contractor order data */ {
    success?: boolean
    data?: {
      metrics?: {
        total_orders?: number
        total_value?: number
        active_value?: number
        completed_value?: number
        status_counts?: {
          "not-started"?: number
          "in-progress"?: number
          fulfilled?: number
          cancelled?: number
        }
        recent_activity?: {
          orders_last_7_days?: number
          orders_last_30_days?: number
          value_last_7_days?: number
          value_last_30_days?: number
        }
        top_customers?: {
          username?: string
          order_count?: number
          total_value?: number
        }[]
        trend_data?: {
          daily_orders?: {
            date?: string
            count?: number
          }[]
          daily_value?: {
            date?: string
            value?: number
          }[]
          status_trends?: {
            "not-started"?: {
              date?: string
              count?: number
            }[]
            "in-progress"?: {
              date?: string
              count?: number
            }[]
            fulfilled?: {
              date?: string
              count?: number
            }[]
            cancelled?: {
              date?: string
              count?: number
            }[]
          }
        }
      }
      recent_orders?: {
        order_id?: string
        timestamp?: string
        status?: string
        cost?: number
        title?: string
      }[]
    }
  }
export type GetContractorOrderDataApiArg = {
  /** The Spectrum ID of the contractor */
  spectrumId: string
  /** Whether to include pre-computed trend data */
  includeTrends?: boolean
  /** Whether to only include assigned orders (for user trends) */
  assignedOnly?: boolean
}
export type GetUserOrderDataApiResponse =
  /** status 200 Comprehensive user order data */ {
    success?: boolean
    data?: {
      metrics?: {
        total_orders?: number
        total_value?: number
        active_value?: number
        completed_value?: number
        status_counts?: {
          "not-started"?: number
          "in-progress"?: number
          fulfilled?: number
          cancelled?: number
        }
        recent_activity?: {
          orders_last_7_days?: number
          orders_last_30_days?: number
          value_last_7_days?: number
          value_last_30_days?: number
        }
        top_customers?: {
          username?: string
          order_count?: number
          total_value?: number
        }[]
        trend_data?: {
          daily_orders?: {
            date?: string
            count?: number
          }[]
          daily_value?: {
            date?: string
            value?: number
          }[]
          status_trends?: {
            "not-started"?: {
              date?: string
              count?: number
            }[]
            "in-progress"?: {
              date?: string
              count?: number
            }[]
            fulfilled?: {
              date?: string
              count?: number
            }[]
            cancelled?: {
              date?: string
              count?: number
            }[]
          }
        }
      }
      recent_orders?: {
        order_id?: string
        timestamp?: string
        status?: string
        cost?: number
        title?: string
      }[]
    }
  }
export type GetUserOrderDataApiArg = {
  /** Whether to include pre-computed trend data */
  includeTrends?: boolean
}
export type PostReviewApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type PostReviewApiArg = {
  orderId: string
  body: {
    content: string
    rating: number
    role: "contractor" | "customer"
  }
}
export type RequestReviewRevisionApiResponse =
  /** status 200 Revision requested successfully */ {
    data?: {
      review_id?: string
      revision_requested?: boolean
      revision_requested_at?: string
      revision_message?: string | null
    }
  }
export type RequestReviewRevisionApiArg = {
  orderId: string
  reviewId: string
  body: {
    /** Optional message explaining why the revision is requested */
    message?: string
  }
}
export type UpdateOrderReviewApiResponse =
  /** status 200 Review updated successfully */ {
    data?: {
      review_id?: string
      last_modified_at?: string
      revision_requested?: boolean
    }
  }
export type UpdateOrderReviewApiArg = {
  orderId: string
  reviewId: string
  body: {
    content: string
    rating: number
  }
}
export type UpdateOrderApiResponse =
  /** status 200 OK - Resource successfully updated */ {
    data: {}
  }
export type UpdateOrderApiArg = {
  orderId: string
  body: {
    status?: OrderStatus
    assigned_to?: string | null
    contractor?: string
  }
}
export type GetOrderByIdApiResponse =
  /** status 200 OK - Successful request with response body */ Order
export type GetOrderByIdApiArg = {
  orderId: string
}
export type PostApplyApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type PostApplyApiArg = {
  orderId: string
  body: {
    message: string
  }
}
export type AcceptContractorApplicationOnOrderApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: object
  }
export type AcceptContractorApplicationOnOrderApiArg = {
  orderId: string
  spectrumId: string
  body: {}
}
export type AcceptUserApplicationOnOrderApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: object
  }
export type AcceptUserApplicationOnOrderApiArg = {
  orderId: string
  username: string
  body: {}
}
export type CreateOrderThreadApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type CreateOrderThreadApiArg = {
  orderId: string
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
export type Forbidden = {
  message: "Forbidden"
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
export type OrderBody = {
  title: string
  rush: boolean
  description: string
  kind:
    | "Escort"
    | "Transport"
    | "Construction"
    | "Support"
    | "Resource Acquisition"
    | "Rental"
    | "Custom"
    | "Delivery"
    | "Medical"
    | "Intelligence Services"
  collateral: number
  departure: string | null
  destination: string | null
  cost: number
  contractor?: string | null
  assigned_to?: string | null
  service_id?: string | null
  payment_type:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
}
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_orders: number
}
export type MinimalContractor = {
  avatar: string
  name: string
  spectrum_id: string
  rating: Rating
}
export type MinimalUser = {
  username: string
  display_name: string
  avatar: string
  rating: Rating
  discord_profile?: {
    id: string
    discriminator: string
    username: string
  } | null
}
export type OrderStatus =
  | "fulfilled"
  | "in-progress"
  | "not-started"
  | "cancelled"
export type OrderStub = {
  order_id: string
  contractor: MinimalContractor
  assigned_to: MinimalUser
  customer: MinimalUser
  status: OrderStatus
  timestamp: string
  service_name: string | null
  cost: number
  title: string
  payment_type:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  count: number
}
export type NotFound = {
  message: "Not Found"
}
export type Conflict = {
  message: "Conflict"
}
export type OrderApplicant = {
  order_id: string
  user_applicant: MinimalUser
  org_applicant: MinimalContractor
  timestamp: number
  message: string
}
export type MarketListingSeller = {
  user?: MinimalUser
  contractor?: MinimalContractor
}
export type MarketListingBase = {
  listing_id: string
  sale_type: "unique" | "multiple" | "auction" | "aggregate"
  price: number
  quantity_available: number
  status: "active" | "inactive" | "archived"
  timestamp: string
  expiration: string
  seller: MarketListingSeller
}
export type UniqueListing = MarketListingBase & {
  title?: string
  description?: string
  item_type?: string
  photos?: string[]
  game_item?: {
    name?: string
    icon_url?: string
  } | null
  /** Total number of views for this listing */
  view_count?: number
}
export type OfferMarketListing = {
  quantity: number
  listing_id: string
  listing: UniqueListing
}
export type OrderReview = {
  user_author: MinimalUser
  contractor_author: MinimalContractor
  content: string
  timestamp: number
  review_id: string
  order_id: string
  rating: number
}
export type AvailabilityEntry = {
  start: number
  finish: number
}
export type OrderAvailability = {
  customer: AvailabilityEntry[]
  assigned: AvailabilityEntry[]
}
export type Order = {
  order_id: string
  status: OrderStatus
  kind: string
  cost: number
  rush: boolean
  assigned_to: string | null
  contractor: string | null
  customer: string
  title: string
  description: string
  discord_thread_id?: string | null
  discord_server_id?: string | null
  discord_invite?: string | null
  timestamp: string
  applicants: OrderApplicant[]
  market_listings?: OfferMarketListing[]
  customer_review?: OrderReview
  contractor_review?: OrderReview
  template_id?: string | null
  payment_type:
    | "one-time"
    | "hourly"
    | "daily"
    | "unit"
    | "box"
    | "scu"
    | "cscu"
    | "mscu"
  availability?: OrderAvailability
  offer_session_id: string | null
}
export const {
  useCreateANewOrderMutation,
  useSearchOrdersQuery,
  useGetContractorOrderMetricsQuery,
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
  usePostReviewMutation,
  useRequestReviewRevisionMutation,
  useUpdateOrderReviewMutation,
  useUpdateOrderMutation,
  useGetOrderByIdQuery,
  usePostApplyMutation,
  useAcceptContractorApplicationOnOrderMutation,
  useAcceptUserApplicationOnOrderMutation,
  useCreateOrderThreadMutation,
} = injectedRtkApi
