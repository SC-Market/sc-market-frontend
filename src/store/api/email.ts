import { serviceApi as api } from "../service"
export const addTagTypes = ["Email"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiEmailPreferences: build.query<
        GetApiEmailPreferencesApiResponse,
        GetApiEmailPreferencesApiArg
      >({
        query: () => ({ url: `/api/email/preferences` }),
        providesTags: ["Email"],
      }),
      patchApiEmailPreferences: build.mutation<
        PatchApiEmailPreferencesApiResponse,
        PatchApiEmailPreferencesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/email/preferences`,
          method: "PATCH",
          body: queryArg.updateEmailPreferencesRequest,
        }),
        invalidatesTags: ["Email"],
      }),
      postApiEmailUnsubscribeByToken: build.mutation<
        PostApiEmailUnsubscribeByTokenApiResponse,
        PostApiEmailUnsubscribeByTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/email/unsubscribe/${queryArg.token}`,
          method: "POST",
        }),
        invalidatesTags: ["Email"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as emailApi }
export type GetApiEmailPreferencesApiResponse =
  /** status 200 Email preferences retrieved successfully */ EmailPreferencesResponse
export type GetApiEmailPreferencesApiArg = void
export type PatchApiEmailPreferencesApiResponse =
  /** status 200 Preferences updated successfully */ {
    preferences?: EmailPreference[]
    message?: string
  }
export type PatchApiEmailPreferencesApiArg = {
  updateEmailPreferencesRequest: UpdateEmailPreferencesRequest
}
export type PostApiEmailUnsubscribeByTokenApiResponse = unknown
export type PostApiEmailUnsubscribeByTokenApiArg = {
  /** Unsubscribe token */
  token: string
}
export type EmailPreference = {
  preference_id: string
  /** Notification action type ID */
  action_type_id: number
  /** Notification action name (e.g., 'order_create') */
  action_name?: string | null
  /** Whether email notifications are enabled */
  enabled: boolean
  /** Email frequency */
  frequency: "immediate" | "daily" | "weekly"
  /** Time for daily/weekly digests (HH:MM:SS format) */
  digest_time?: string | null
  created_at: string
  updated_at: string
}
export type EmailPreferencesResponse = {
  preferences: EmailPreference[]
  email: {
    email_id: string
    email: string
    email_verified: boolean
    is_primary: boolean
  } | null
}
export type Unauthorized = {
  message: "Unauthorized"
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
export type ServerError = {
  message: "Internal Server Error"
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type UpdateEmailPreferencesRequest = {
  preferences: {
    action_type_id: number
    enabled?: boolean
    frequency?: "immediate" | "daily" | "weekly"
    digest_time?: string | null
  }[]
}
export const {
  useGetApiEmailPreferencesQuery,
  usePatchApiEmailPreferencesMutation,
  usePostApiEmailUnsubscribeByTokenMutation,
} = injectedRtkApi
