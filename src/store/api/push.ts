import { generatedApi as api } from "../generatedApi"
export const addTagTypes = ["Push Notifications"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      subscribePush: build.mutation<
        SubscribePushApiResponse,
        SubscribePushApiArg
      >({
        query: (queryArg) => ({
          url: `/api/push/subscribe`,
          method: "POST",
          body: queryArg.pushSubscriptionData,
        }),
        invalidatesTags: ["Push Notifications"],
      }),
      getPushSubscriptions: build.query<
        GetPushSubscriptionsApiResponse,
        GetPushSubscriptionsApiArg
      >({
        query: () => ({ url: `/api/push/subscribe` }),
        providesTags: ["Push Notifications"],
      }),
      unsubscribePush: build.mutation<
        UnsubscribePushApiResponse,
        UnsubscribePushApiArg
      >({
        query: (queryArg) => ({
          url: `/api/push/subscribe/${queryArg.subscriptionId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Push Notifications"],
      }),
      getPushPreferences: build.query<
        GetPushPreferencesApiResponse,
        GetPushPreferencesApiArg
      >({
        query: () => ({ url: `/api/push/preferences` }),
        providesTags: ["Push Notifications"],
      }),
      updatePushPreference: build.mutation<
        UpdatePushPreferenceApiResponse,
        UpdatePushPreferenceApiArg
      >({
        query: (queryArg) => ({
          url: `/api/push/preferences`,
          method: "PATCH",
          body: queryArg.body,
        }),
        invalidatesTags: ["Push Notifications"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as pushApi }
export type SubscribePushApiResponse =
  /** status 201 Successfully subscribed to push notifications */ PushSubscriptionResponse
export type SubscribePushApiArg = {
  pushSubscriptionData: PushSubscriptionData
}
export type GetPushSubscriptionsApiResponse =
  /** status 200 Successfully retrieved push subscriptions */ {
    subscriptions?: {
      /** Unique identifier for the subscription */
      subscription_id: string
      /** User ID that owns this subscription */
      user_id: string
      /** Push service endpoint URL */
      endpoint: string
      /** P-256 ECDH public key (base64 encoded) */
      p256dh: string
      /** Authentication secret (base64 encoded) */
      auth: string
      /** User agent string when subscription was created */
      user_agent?: string | null
      /** When the subscription was created */
      created_at: string
      /** When the subscription was last updated */
      updated_at: string
    }[]
  }
export type GetPushSubscriptionsApiArg = void
export type UnsubscribePushApiResponse =
  /** status 200 Successfully unsubscribed from push notifications */ {
    message?: string
  }
export type UnsubscribePushApiArg = {
  /** Unique identifier for the subscription */
  subscriptionId: string
}
export type GetPushPreferencesApiResponse =
  /** status 200 Successfully retrieved push notification preferences */ PushPreferencesResponse
export type GetPushPreferencesApiArg = void
export type UpdatePushPreferenceApiResponse =
  /** status 200 Successfully updated push notification preferences */ {
    message?: string
    /** Array of updated preferences (for batch updates) */
    preferences?: {
      action?: string
      enabled?: boolean
      contractor_id?: string | null
    }[]
  }
export type UpdatePushPreferenceApiArg = {
  body: PushPreferenceUpdateBody | PushPreferencesBatchUpdateBody
}
export type PushSubscriptionResponse = {
  /** Unique identifier for the subscription */
  subscription_id: string
  /** Success message */
  message: string
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
export type PushSubscriptionData = {
  /** Push service endpoint URL */
  endpoint: string
  /** Encryption keys for push notifications */
  keys: {
    /** P-256 ECDH public key (base64 encoded) */
    p256dh: string
    /** Authentication secret (base64 encoded) */
    auth: string
  }
  /** User agent string (optional) */
  userAgent?: string
}
export type NotFound = {
  message: "Not Found"
}
export type PushPreference = {
  /** Notification action type (e.g., 'order_create', 'order_message') */
  action: string
  /** Whether push notifications are enabled for this action type */
  enabled: boolean
}
export type PushPreferencesResponse = {
  /** Array of push notification preferences */
  preferences: PushPreference[]
}
export type PushPreferenceUpdateBody = {
  /** Notification action type to update */
  action: string
  /** Whether to enable or disable push notifications for this action */
  enabled: boolean
  /** Optional contractor ID for organization-scoped preferences */
  contractor_id?: string | null
}
export type PushPreferenceUpdateItem = {
  /** Notification action type to update */
  action: string
  /** Whether to enable or disable push notifications for this action */
  enabled: boolean
  /** Optional contractor ID for organization-scoped preferences */
  contractor_id?: string | null
}
export type PushPreferencesBatchUpdateBody = {
  /** Array of preferences to update */
  preferences: PushPreferenceUpdateItem[]
}
export const {
  useSubscribePushMutation,
  useGetPushSubscriptionsQuery,
  useUnsubscribePushMutation,
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} = injectedRtkApi
