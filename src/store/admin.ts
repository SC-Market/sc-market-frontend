import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
import { unwrapResponse } from "./api-utils"
import { OrderAnalytics } from "../datatypes/Order"
import { AdminUsersResponse, AdminUsersQuery } from "../datatypes/User"
import {
  AdminAlert,
  AdminAlertCreate,
  AdminAlertUpdate,
  AdminAlertsResponse,
  AdminAlertsQuery,
} from "../datatypes/AdminAlert"

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
    adminUnlinkUserAccount: builder.mutation<
      { message: string; username: string },
      { username: string }
    >({
      query: ({ username }) => ({
        url: `/api/admin/users/${username}/unlink`,
        method: "POST",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, arg) => [
        // Invalidate the old username's profile
        { type: "Profile" as const, id: arg.username },
        // Invalidate the new username's profile (from result)
        ...(result?.username
          ? [{ type: "Profile" as const, id: result.username }]
          : []),
        // Invalidate Profile LIST (for admin users list and search)
        { type: "Profile" as const, id: "LIST" },
        "Profile" as const,
        // Invalidate MyProfile (in case the unlinked user is viewing their own profile)
        { type: "MyProfile" as const },
        "MyProfile" as const,
        // Invalidate user listings (username-based cache)
        { type: "UserListings" as const, id: arg.username },
        ...(result?.username
          ? [{ type: "UserListings" as const, id: result.username }]
          : []),
      ],
    }),
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
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetActivityAdminQuery,
  useGetOrderAnalyticsQuery,
  useGetAdminUsersQuery,
  useGetMembershipAnalyticsQuery,
  useGetAdminAlertsQuery,
  useCreateAdminAlertMutation,
  useUpdateAdminAlertMutation,
  useDeleteAdminAlertMutation,
  useAdminUnlinkUserAccountMutation,
} = adminApi
