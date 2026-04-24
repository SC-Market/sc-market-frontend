import type {
  Order,
  OrderBody,
  OrderSearchQuery,
  OrderStub,
  OrderStatus,
  ContractorOrderMetrics,
  ContractorOrderData,
} from "../domain/types"
import { serviceApi } from "../../../store/service"
import { createOptimisticUpdate } from "../../../util/optimisticUpdates"
import { unwrapResponse } from "../../../store/api-utils"
import type { RootState } from "../../../store/store"

const ordersApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getOrderById: builder.query<Order, string>({
      query: (order_id) => `/api/orders/${order_id}`,
      keepUnusedDataFor: 180,
      providesTags: (_result, _error, order_id) => [
        { type: "Order" as const, id: order_id },
      ],
      transformResponse: unwrapResponse,
    }),
    createOrder: builder.mutation<
      { discord_invite?: string; session_id: string },
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
      invalidatesTags: (_result, _error, order_id) => [
        { type: "Order" as const, id: order_id },
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
        { type: "Order" as const },
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
    assignOrder: builder.mutation<void, { order_id: string; username: string }>({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}`,
        method: "PUT",
        body: { assigned_to: arg.username },
      }),
      invalidatesTags: [
        { type: "Order" as const },
        "Order" as const,
        { type: "Order" },
        "Chat" as const,
      ],
    }),
    unassignOrder: builder.mutation<void, { order_id: string }>({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}`,
        method: "PUT",
        body: { assigned_to: null },
      }),
      invalidatesTags: [
        { type: "Order" as const },
        "Order" as const,
        { type: "Order" as const },
        "Chat" as const,
      ],
    }),
    leaveOrderReview: builder.mutation<
      void,
      { order_id: string; content: string; rating: number; role: string }
    >({
      query: ({ order_id, ...body }) => ({
        url: `/api/orders/${order_id}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Order" as const },
        "Order" as const,
        { type: "Order" as const },
        "Chat" as const,
      ],
    }),
    setOrderStatus: builder.mutation<
      void,
      { order_id: string; status: string }
    >({
      query: (arg) => ({
        url: `/api/orders/${arg.order_id}`,
        method: "PUT",
        body: arg,
      }),
      async onQueryStarted(
        { order_id, status },
        { dispatch, queryFulfilled, getState },
      ) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: Array<{ undo: () => void }> = []
            let oldStatus: string | null = null

            const orderPatch = dispatch(
              ordersApi.util.updateQueryData(
                "getOrderById",
                order_id,
                (draft) => {
                  oldStatus = draft.status
                  draft.status = status as OrderStatus
                },
              ),
            )
            patches.push(orderPatch)

            const state = getState() as RootState
            const cachedQueries = (state.serviceApi?.queries || {}) as Record<
              string,
              {
                data?: { items?: OrderStub[] }
                originalArgs?: OrderSearchQuery
              }
            >

            Object.keys(cachedQueries).forEach((queryKey) => {
              if (queryKey.includes("searchOrders")) {
                try {
                  const queryData = cachedQueries[queryKey]
                  if (queryData?.data?.items) {
                    const searchPatch = dispatch(
                      ordersApi.util.updateQueryData(
                        "searchOrders",
                        queryData.originalArgs || ({} as OrderSearchQuery),
                        (draft) => {
                          const orderIndex = draft.items.findIndex(
                            (o) => o.order_id === order_id,
                          )
                          if (orderIndex !== -1) {
                            const order = draft.items[orderIndex]
                            if (
                              oldStatus &&
                              draft.item_counts[
                                oldStatus as keyof typeof draft.item_counts
                              ] !== undefined
                            ) {
                              draft.item_counts[
                                oldStatus as keyof typeof draft.item_counts
                              ] = Math.max(
                                0,
                                (draft.item_counts[
                                  oldStatus as keyof typeof draft.item_counts
                                ] as number) - 1,
                              )
                            }
                            if (
                              draft.item_counts[
                                status as keyof typeof draft.item_counts
                              ] !== undefined
                            ) {
                              draft.item_counts[
                                status as keyof typeof draft.item_counts
                              ] =
                                ((draft.item_counts[
                                  status as keyof typeof draft.item_counts
                                ] as number) || 0) + 1
                            }
                            order.status = status as OrderStatus
                          }
                        },
                      ),
                    )
                    patches.push(searchPatch)
                  }
                } catch (e) {
                  // Ignore errors updating individual cached queries
                }
              }
            })

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
      invalidatesTags: (_result, _error, arg) => [
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
      query: (queryParams) => {
        const params: Record<string, string | number | boolean | undefined> = {
          ...queryParams,
        }
        if (params.has_market_listings !== undefined) {
          params.has_market_listings = String(params.has_market_listings)
        }
        if (params.has_service !== undefined) {
          params.has_service = String(params.has_service)
        }
        return { url: `/api/orders/search`, params }
      },
      providesTags: ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
    requestReviewRevision: builder.mutation<
      {
        review_id: string
        revision_requested: boolean
        revision_requested_at: string
        revision_message: string | null
      },
      { reviewId: string; orderId: string; message?: string }
    >({
      query: ({ reviewId, orderId, message }) => ({
        url: `/api/orders/${orderId}/reviews/${reviewId}/request-revision`,
        method: "POST",
        body: { message },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
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
      { reviewId: string; orderId: string; content: string; rating: number }
    >({
      query: ({ reviewId, orderId, content, rating }) => ({
        url: `/api/orders/${orderId}/reviews/${reviewId}`,
        method: "PUT",
        body: { content, rating },
      }),
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Order" as const, id: orderId },
        "Order" as const,
        { type: "Order" as const },
      ],
      transformResponse: unwrapResponse,
    }),
  }),
})

// ── Metrics endpoints ──

const ordersMetricsApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getContractorOrderMetrics: builder.query<ContractorOrderMetrics, string>({
      query: (spectrum_id) => `/api/orders/contractor/${spectrum_id}/metrics`,
      providesTags: ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
    getContractorOrderData: builder.query<
      ContractorOrderData,
      { spectrum_id: string; include_trends?: boolean; assigned_only?: boolean }
    >({
      query: ({ spectrum_id, include_trends = true, assigned_only = false }) => {
        const params = new URLSearchParams()
        if (include_trends) params.append("include_trends", "true")
        if (assigned_only) params.append("assigned_only", "true")
        return `/api/orders/contractor/${spectrum_id}/data?${params.toString()}`
      },
      providesTags: ["Order" as const, { type: "Order" as const }],
      transformResponse: unwrapResponse,
    }),
    getUserOrderData: builder.query<
      ContractorOrderData,
      { include_trends?: boolean }
    >({
      query: ({ include_trends = true }) => {
        const params = new URLSearchParams()
        if (include_trends) params.append("include_trends", "true")
        return `/api/orders/user/data?${params.toString()}`
      },
      providesTags: ["Order" as const, { type: "Order" as const }],
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
  useCreateOrderThreadMutation,
  useSearchOrdersQuery,
  useRequestReviewRevisionMutation,
  useUpdateOrderReviewMutation,
} = ordersApi

export const {
  useGetContractorOrderMetricsQuery,
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
} = ordersMetricsApi
