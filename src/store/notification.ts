import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
import { Notification } from "../hooks/login/UserProfile"
import { unwrapResponse } from "./api-utils"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

const baseUrl = `${BACKEND_URL}/api/notification`

/**
 * Notification API. Uses tag "Notifications" so that when the service worker
 * sends PUSH_NOTIFICATION_RECEIVED or SYNC_NOTIFICATIONS, App.tsx can call
 * notificationApi.util.invalidateTags(["Notifications"]) and RTK Query will
 * refetch any currently subscribed getNotifications queries (e.g. NotificationsButton).
 */
export const notificationApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    notificationUpdate: builder.mutation<
      { success: boolean; message: string },
      { notification_id: string; read: boolean }
    >({
      query: (body) => ({
        url: `${baseUrl}/${body.notification_id}`,
        method: "PATCH",
        body: { read: body.read },
      }),
      invalidatesTags: [
        // Invalidate all notification queries to refresh unread counts and lists
        "Notifications" as const,
      ],
    }),
    notificationDelete: builder.mutation<
      { success: boolean; message: string; deleted_count: number },
      string[]
    >({
      query: (notificationIds) => ({
        url: `${baseUrl}`,
        method: "DELETE",
        body: { notification_ids: notificationIds },
      }),
      invalidatesTags: [
        // Invalidate all notification queries to refresh counts and lists
        "Notifications" as const,
      ],
    }),
    getNotifications: builder.query<
      {
        notifications: Notification[]
        pagination: {
          total: number
          currentPage: number
          pageSize: number
          totalPages: number
          hasNextPage: boolean
          hasPreviousPage: boolean
        }
        unread_count: number
      },
      {
        page?: number
        pageSize?: number
        action?: string
        entityId?: string
        scope?: "individual" | "organization" | "all"
        contractorId?: string
      }
    >({
      query: (params) => ({
        url: `${baseUrl}/${params.page || 0}`,
        params: {
          pageSize: params.pageSize || 20,
          ...(params.action && { action: params.action }),
          ...(params.entityId && { entityId: params.entityId }),
          ...(params.scope && { scope: params.scope }),
          ...(params.contractorId && { contractorId: params.contractorId }),
        },
      }),
      transformResponse: (response: {
        data: {
          notifications: Notification[]
          pagination: {
            total: number
            currentPage: number
            pageSize: number
            totalPages: number
            hasNextPage: boolean
            hasPreviousPage: boolean
          }
          unread_count: number
        }
      }) => {
        return unwrapResponse(response) as {
          notifications: Notification[]
          pagination: {
            total: number
            currentPage: number
            pageSize: number
            totalPages: number
            hasNextPage: boolean
            hasPreviousPage: boolean
          }
          unread_count: number
        }
      },
      providesTags: (result, error, arg) => [
        // Provide the general notifications tag
        "Notifications" as const,
      ],
    }),
    notificationBulkUpdate: builder.mutation<
      { success: boolean; message: string; affected_count: number },
      { read: boolean }
    >({
      query: (body) => ({
        url: `${baseUrl}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        // RTK Query automatically invalidates all queries that provide this tag
        "Notifications" as const,
      ],
    }),
    notificationBulkDelete: builder.mutation<
      { success: boolean; message: string; affected_count: number },
      { notification_ids?: string[] }
    >({
      query: (body) => ({
        url: `${baseUrl}`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        // Invalidate all notification queries since bulk operations affect all
        "Notifications" as const,
      ],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useNotificationUpdateMutation,
  useGetNotificationsQuery,
  useNotificationDeleteMutation,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} = notificationApi
