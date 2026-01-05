import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
import { unwrapResponse } from "./api-utils"

// Note: RTK Query baseUrl is already BACKEND_URL, so we use relative paths
const apiBase = "/api"

/**
 * User email record
 */
export interface UserEmail {
  email_id: string
  email: string
  email_verified: boolean
  is_primary: boolean
}

/**
 * Email notification preference
 */
export interface EmailPreference {
  preference_id: string
  action_type_id: number
  action_name: string | null
  enabled: boolean
  frequency: "immediate" | "daily" | "weekly"
  digest_time: string | null
  created_at: string
  updated_at: string
}

/**
 * Notification type (available notification action)
 */
export interface NotificationType {
  action_type_id: number
  action: string
  entity: string
  description: string | null
}

/**
 * Add email request
 */
export interface AddEmailRequest {
  email: string
  notificationTypeIds?: number[]
}

/**
 * Update email request
 */
export interface UpdateEmailRequest {
  email: string
}

/**
 * Update email preferences request
 */
export interface UpdateEmailPreferencesRequest {
  preferences: Array<{
    action_type_id: number
    enabled?: boolean
    frequency?: "immediate" | "daily" | "weekly"
    digest_time?: string | null
  }>
}

/**
 * Email API endpoints
 */
export const emailApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Add email address
    addEmail: builder.mutation<
      {
        email_id: string
        email: string
        email_verified: boolean
        preferences_created: number
        message: string
      },
      AddEmailRequest
    >({
      query: (body) => ({
        url: `${apiBase}/profile/email`,
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        data: {
          email_id: string
          email: string
          email_verified: boolean
          preferences_created: number
          message: string
        }
      }) => {
        return unwrapResponse(response) as {
          email_id: string
          email: string
          email_verified: boolean
          preferences_created: number
          message: string
        }
      },
      invalidatesTags: ["UserEmail" as const, "EmailPreferences" as const],
    }),

    // Update email address
    updateEmail: builder.mutation<
      {
        email_id: string
        email: string
        email_verified: boolean
        message: string
      },
      UpdateEmailRequest
    >({
      query: (body) => ({
        url: `${apiBase}/profile/email`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: {
        data: {
          email_id: string
          email: string
          email_verified: boolean
          message: string
        }
      }) => {
        return unwrapResponse(response) as {
          email_id: string
          email: string
          email_verified: boolean
          message: string
        }
      },
      invalidatesTags: ["UserEmail" as const, "EmailPreferences" as const],
    }),

    // Delete email address
    deleteEmail: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: `${apiBase}/profile/email`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { message: string } }) => {
        return unwrapResponse(response) as { message: string }
      },
      invalidatesTags: ["UserEmail" as const, "EmailPreferences" as const],
    }),

    // Request verification email
    requestVerification: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: `${apiBase}/profile/email/verify`,
        method: "POST",
      }),
      transformResponse: (response: { data: { message: string } }) => {
        return unwrapResponse(response) as { message: string }
      },
      // Requesting verification doesn't change data, but invalidate to refetch email status
      invalidatesTags: ["UserEmail" as const],
    }),

    // Get available notification types
    getNotificationTypes: builder.query<{ notificationTypes: NotificationType[] }, void>({
      query: () => ({
        url: `${apiBase}/email/notification-types`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { notificationTypes: NotificationType[] }
      }) => {
        return unwrapResponse(response) as { notificationTypes: NotificationType[] }
      },
    }),

    // Get email notification preferences
    getEmailPreferences: builder.query<
      { preferences: EmailPreference[]; email: UserEmail | null },
      void
    >({
      query: () => ({
        url: `${apiBase}/email/preferences`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { preferences: EmailPreference[]; email: UserEmail | null }
      }) => {
        return unwrapResponse(response) as {
          preferences: EmailPreference[]
          email: UserEmail | null
        }
      },
      providesTags: ["EmailPreferences" as const, "UserEmail" as const],
    }),

    // Update email notification preferences
    updateEmailPreferences: builder.mutation<
      { preferences: EmailPreference[]; message: string },
      UpdateEmailPreferencesRequest
    >({
      query: (body) => ({
        url: `${apiBase}/email/preferences`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: {
        data: { preferences: EmailPreference[]; message: string }
      }) => {
        return unwrapResponse(response) as {
          preferences: EmailPreference[]
          message: string
        }
      },
      invalidatesTags: ["EmailPreferences" as const, "UserEmail" as const],
    }),

    // Verify email address via token
    // Note: This is a query but has side effects (verifies email)
    // RTK Query queries can't invalidate tags, so we use a mutation instead
    verifyEmail: builder.mutation<
      { success: boolean; message: string; userId: string; email: string },
      string
    >({
      query: (token) => ({
        url: `${apiBase}/profile/email/verify/${token}?json=true`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: {
          success: boolean
          message: string
          userId: string
          email: string
        }
      }) => {
        return unwrapResponse(response) as {
          success: boolean
          message: string
          userId: string
          email: string
        }
      },
      invalidatesTags: ["UserEmail" as const, "EmailPreferences" as const],
    }),

    // Unsubscribe from email notifications via token
    unsubscribe: builder.mutation<
      { success: boolean; message: string; userId: string; email: string },
      string
    >({
      query: (token) => ({
        url: `${apiBase}/email/unsubscribe/${token}?json=true`,
        method: "POST",
      }),
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        const data = unwrapResponse(response) as {
          success?: boolean
          message?: string
          userId?: string
          email?: string
        }
        // Ensure we return the expected shape
        if (data && typeof data === "object") {
          return {
            success: data.success ?? true,
            message: data.message || "Successfully unsubscribed from email notifications",
            userId: data.userId || "",
            email: data.email || "",
          }
        }
        return {
          success: false,
          message: "Invalid response format",
          userId: "",
          email: "",
        }
      },
      // Handle errors that might come through as 200 responses
      transformErrorResponse: (response: any) => {
        // If response has error structure, extract it
        if (response?.data?.error) {
          return response.data.error
        }
        if (response?.error) {
          return response.error
        }
        return response
      },
      invalidatesTags: ["EmailPreferences" as const, "UserEmail" as const],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useAddEmailMutation,
  useUpdateEmailMutation,
  useDeleteEmailMutation,
  useRequestVerificationMutation,
  useGetNotificationTypesQuery,
  useGetEmailPreferencesQuery,
  useUpdateEmailPreferencesMutation,
  useVerifyEmailMutation,
  useUnsubscribeMutation,
} = emailApi
