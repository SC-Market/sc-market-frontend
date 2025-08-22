import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
import { unwrapResponse } from "./orders"
import { OrderAnalytics } from "../datatypes/Order"

const baseUrl = `/api/admin`
// Define a service using a base URL and expected endpoints
export const adminApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getActivityAdmin: builder.query<
      {
        daily: { date: string; count: number }[]
        weekly: { date: string; count: number }[]
        monthly: { date: string; count: number }[]
      },
      void
    >({
      query: () => `${baseUrl}/activity`,
      transformResponse: unwrapResponse,
    }),
    getOrderAnalytics: builder.query<OrderAnalytics, void>({
      query: () => `${baseUrl}/orders/analytics`,
      providesTags: ["Order" as const],
      transformResponse: unwrapResponse,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetActivityAdminQuery, useGetOrderAnalyticsQuery } = adminApi
