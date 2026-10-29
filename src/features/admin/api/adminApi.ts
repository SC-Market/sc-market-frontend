import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import { OrderAnalytics } from "../../orders/domain/types"
import { OfferAnalytics } from "../../offers/domain/types"
import { AdminUsersResponse, AdminUsersQuery } from "../../../datatypes/User"
import {
  AdminAlert,
  AdminAlertCreate,
  AdminAlertUpdate,
  AdminAlertsResponse,
  AdminAlertsQuery,
} from "../../../datatypes/AdminAlert"

export interface MembershipAnalytics {
  daily_totals: Array<{
    date: string
    new_members: string
    new_members_rsi_verified: string
    new_members_rsi_unverified: string
    cumulative_members: string
    cumulative_members_rsi_verified: string
    cumulative_members_rsi_unverified: string
  }>
  weekly_totals: Array<{
    date: string
    new_members: string
    new_members_rsi_verified: string
    new_members_rsi_unverified: string
    cumulative_members: string
    cumulative_members_rsi_verified: string
    cumulative_members_rsi_unverified: string
  }>
  monthly_totals: Array<{
    date: string
    new_members: string
    new_members_rsi_verified: string
    new_members_rsi_unverified: string
    cumulative_members: string
    cumulative_members_rsi_verified: string
    cumulative_members_rsi_unverified: string
  }>
  summary: {
    total_members: string
    admin_members: string
    regular_members: string
    rsi_confirmed_members: string
    banned_members: string
    new_members_30d: string
    new_members_7d: string
  }
}

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
    getOfferAnalytics: builder.query<OfferAnalytics, void>({
      query: () => `${baseUrl}/offers/analytics`,
      providesTags: ["Offer" as const],
      transformResponse: unwrapResponse,
    }),
    getAdminUsers: builder.query<AdminUsersResponse, AdminUsersQuery>({
      query: (params) => ({
        url: `${baseUrl}/users`,
        params,
      }),
      providesTags: ["Profile" as const],
      transformResponse: unwrapResponse,
    }),
    getMembershipAnalytics: builder.query<MembershipAnalytics, void>({
      query: () => `${baseUrl}/membership/analytics`,
      providesTags: ["Profile" as const],
      transformResponse: unwrapResponse,
    }),
    getAdminAlerts: builder.query<AdminAlertsResponse, AdminAlertsQuery>({
      query: (params) => ({
        url: `${baseUrl}/alerts/`,
        params,
      }),
      providesTags: ["AdminAlerts" as const],
      transformResponse: unwrapResponse,
    }),
    createAdminAlert: builder.mutation<{ data: AdminAlert }, AdminAlertCreate>({
      query: (body) => ({
        url: `${baseUrl}/alerts/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminAlerts" as const],
      transformResponse: unwrapResponse,
    }),
    updateAdminAlert: builder.mutation<
      { data: AdminAlert },
      { alertId: string; data: AdminAlertUpdate }
    >({
      query: ({ alertId, data }) => ({
        url: `${baseUrl}/alerts/${alertId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminAlerts" as const],
      transformResponse: unwrapResponse,
    }),
    deleteAdminAlert: builder.mutation<
      { data: { success: boolean; message: string } },
      string
    >({
      query: (alertId) => ({
        url: `${baseUrl}/alerts/${alertId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminAlerts" as const],
      transformResponse: unwrapResponse,
    }),
    testNotification: builder.mutation<
      { message: string; data?: { order_id?: string; contractor_id?: string | null; chat_id?: string; listing_id?: string } },
      {
        notification_type: string
        target_username: string
        contractor_id?: string | null
      }
    >({
      query: (body) => ({
        url: `${baseUrl}/notifications/test`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetActivityAdminQuery,
  useGetOrderAnalyticsQuery,
  useGetOfferAnalyticsQuery,
  useGetAdminUsersQuery,
  useGetMembershipAnalyticsQuery,
  useGetAdminAlertsQuery,
  useCreateAdminAlertMutation,
  useUpdateAdminAlertMutation,
  useDeleteAdminAlertMutation,
  useTestNotificationMutation,
} = adminApi
