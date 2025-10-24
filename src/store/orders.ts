import {
  Order,
  OrderBody,
  OrderSearchQuery,
  OrderStub,
} from "../datatypes/Order"
import { serviceApi } from "./service"

export interface ErrorResponse<E> {
  error: E
  errors: E[]
  validationErrors: E[]
  message?: string
}

export interface SuccessResponse<T> {
  data: T
}

export type Response<T, E> = ErrorResponse<E> | SuccessResponse<T>

export function unwrapResponse<T, E>(response: Response<T, E>) {
  if ((response as SuccessResponse<T>).data) {
    return (response as SuccessResponse<T>).data
  } else {
    return (response as ErrorResponse<E>).error
  }
}

const ordersApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getOrderById: builder.query<Order, string>({
      query: (order_id) => `/api/orders/${order_id}`,
      providesTags: (_result, _error, order_id) => [
        { type: "Order" as const, id: order_id },
      ],
      transformResponse: unwrapResponse,
    }),
    createOrder: builder.mutation<
      {
        discord_invite?: string
        session_id: string
      },
      OrderBody
    >({
      query: (body) => ({
        url: `/api/orders`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders" as const],
      transformResponse: unwrapResponse,
    }),
    createOrderThread: builder.mutation<void, string>({
      query: (order_id) => ({
        url: `/api/orders/${order_id}/thread`,
        method: "POST",
      }),
      invalidatesTags: (result, error, order_id) => [
        {
          type: "Order" as const,
          id: order_id,
        },
        "Order" as const,
        { type: "Order" as const },
      ],
      transformResponse: unwrapResponse,
    }),
    applyToOrder: builder.mutation<
      void,
      {
        order_id: string
        contractor_id: string | undefined | null
        message?: string
      }
    >({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}/applications`,
        method: "POST",
        body: { contractor: arg.contractor_id, message: arg.message },
      }),
      invalidatesTags: [
        {
          type: "Order" as const,
        },
        "Order" as const,
        { type: "Order" as const },
      ],
    }),
    acceptOrderApplicant: builder.mutation<
      void,
      {
        order_id: string
        contractor_id: string | undefined | null
        user_id: string | undefined | null
      }
    >({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}/applicants/${
          arg.contractor_id ? "contractors" : "users"
        }/${arg.contractor_id || arg.user_id}`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Order" as const },
        "Order" as const,
        { type: "Order" },
      ],
    }),
    assignOrder: builder.mutation<
      void,
      {
        order_id: string
        user_id: string
      }
    >({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}`,
        method: "PUT",
        body: { assigned_to: arg.user_id },
      }),
      invalidatesTags: [
        {
          type: "Order" as const,
        },
        "Order" as const,
        { type: "Order" },
        "Chat" as const,
      ],
    }),
    unassignOrder: builder.mutation<
      void,
      {
        order_id: string
      }
    >({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}`,
        method: "PUT",
        body: { assigned_to: null },
      }),
      invalidatesTags: [
        {
          type: "Order" as const,
        },
        "Order" as const,
        { type: "Order" as const },
        "Chat" as const,
      ],
    }),
    leaveOrderReview: builder.mutation<
      void,
      {
        order_id: string
        content: string
        rating: number
        role: string
      }
    >({
      query: ({ order_id, ...body }) => ({
        url: `/api/orders/${order_id}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        {
          type: "Order" as const,
        },
        "Order" as const,
        { type: "Order" as const },
        "Chat" as const,
      ],
    }),
    setOrderStatus: builder.mutation<
      void,
      {
        order_id: string
        status: string
      }
    >({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}`,
        method: "PUT",
        body: arg,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Order" as const, id: arg.order_id },
      ],
    }),
    searchOrders: builder.query<
      {
        items: OrderStub[]
        item_counts: {
          fulfilled: number
          "in-progress": number
          "not-started": number
          cancelled: number
        }
      },
      OrderSearchQuery
    >({
      query: (queryParams) => ({
        url: `/api/orders/search`,
        params: queryParams,
      }),
      providesTags: ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
    getAllAssignedOrders: builder.query<OrderStub[], void>({
      query: () => `/api/orders/assigned`,
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ order_id }) => ({
                type: "Order" as const,
                id: order_id,
              })),
              { type: "Order" as const },
              "Order" as const,
            ]
          : ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
    requestReviewRevision: builder.mutation<
      {
        review_id: string
        revision_requested: boolean
        revision_requested_at: string
        revision_message: string | null
      },
      {
        reviewId: string
        orderId: string
        message?: string
      }
    >({
      query: ({ reviewId, orderId, message }) => ({
        url: `/api/orders/${orderId}/reviews/${reviewId}/request-revision`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order" as const, id: orderId },
        "Order" as const,
        { type: "Order" as const },
      ],
      transformResponse: unwrapResponse,
    }),
    updateOrderReview: builder.mutation<
      {
        review_id: string
        last_modified_at: string
        revision_requested: boolean
      },
      {
        reviewId: string
        orderId: string
        content: string
        rating: number
      }
    >({
      query: ({ reviewId, orderId, content, rating }) => ({
        url: `/api/orders/${orderId}/reviews/${reviewId}`,
        method: "PUT",
        body: { content, rating },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Order" as const, id: orderId },
        "Order" as const,
        { type: "Order" as const },
      ],
      transformResponse: unwrapResponse,
    }),
  }),
})

export const {
  useUnassignOrderMutation,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useApplyToOrderMutation,
  useAcceptOrderApplicantMutation,
  useAssignOrderMutation,
  useLeaveOrderReviewMutation,
  useSetOrderStatusMutation,
  useGetAllAssignedOrdersQuery,
  useCreateOrderThreadMutation,
  useSearchOrdersQuery,
  useRequestReviewRevisionMutation,
  useUpdateOrderReviewMutation,
} = ordersApi

// Add contractor metrics interface
export interface ContractorOrderMetrics {
  total_orders: number
  total_value: number
  active_value: number // Sum of costs for active orders (not-started + in-progress)
  completed_value: number // Sum of costs for fulfilled orders
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
  // Add trend data for charts
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

// New interface for comprehensive contractor data
export interface ContractorOrderData {
  metrics: ContractorOrderMetrics
  // Include minimal order data for any remaining use cases
  recent_orders?: Array<{
    order_id: string
    timestamp: string
    status: string
    cost: number
    title: string
  }>
}

// Add the new metrics endpoints
const ordersApiWithMetrics = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getContractorOrderMetrics: builder.query<ContractorOrderMetrics, string>({
      query: (spectrum_id) => `/api/orders/contractor/${spectrum_id}/metrics`,
      providesTags: ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
    // New comprehensive endpoint that replaces getOrdersByContractor and getAssignedOrdersByContractor
    getContractorOrderData: builder.query<
      ContractorOrderData,
      { spectrum_id: string; include_trends?: boolean; assigned_only?: boolean }
    >({
      query: ({
        spectrum_id,
        include_trends = true,
        assigned_only = false,
      }) => {
        const params = new URLSearchParams()
        if (include_trends) params.append("include_trends", "true")
        if (assigned_only) params.append("assigned_only", "true")

        return `/api/orders/contractor/${spectrum_id}/data?${params.toString()}`
      },
      providesTags: ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
  }),
})

export const {
  useGetContractorOrderMetricsQuery,
  useGetContractorOrderDataQuery,
} = ordersApiWithMetrics
