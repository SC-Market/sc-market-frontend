import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import type {
  UserEmail,
  EmailPreference,
  GroupedEmailPreferences,
  NotificationType,
  AddEmailRequest,
  UpdateEmailRequest,
  UpdateEmailPreferencesRequest,
} from "../domain/types"

// Note: RTK Query baseUrl is already BACKEND_URL, so we use relative paths
const apiBase = "/api"

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
    getNotificationTypes: builder.query<
      { notificationTypes: NotificationType[] },
      void
    >({
      query: () => ({
        url: `${apiBase}/email/notification-types`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { notificationTypes: NotificationType[] }
      }) => {
        return unwrapResponse(response) as {
          notificationTypes: NotificationType[]
        }
      },
    }),

    // Get email notification preferences (grouped by individual and organizations)
    getEmailPreferences: builder.query<
      { preferences: GroupedEmailPreferences; email: UserEmail | null },
      void
    >({
      query: () => ({
        url: `${apiBase}/email/preferences`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: {
          preferences: GroupedEmailPreferences
          email: UserEmail | null
        }
      }) => {
        return unwrapResponse(response) as {
          preferences: GroupedEmailPreferences
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
} = emailApi
