import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"
import { unwrapResponse } from "./api-utils"

const baseUrl = `${BACKEND_URL}/api/push`

/**
 * Push subscription data from browser
 */
export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userAgent?: string
}

/**
 * Push subscription stored on server
 */
export interface PushSubscription {
  subscription_id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  user_agent: string | null
  created_at: string
  updated_at: string
}

/**
 * Push notification preference
 */
export interface PushPreference {
  action: string
  enabled: boolean
}

/**
 * Grouped push preferences response
 */
export interface GroupedPushPreferences {
  individual: PushPreference[]
  organizations: Array<{
    contractor_id: string
    preferences: PushPreference[]
  }>
}

/**
 * Push notification API endpoints
 */
export const pushNotificationApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get user's push subscriptions
    getPushSubscriptions: builder.query<PushSubscription[], void>({
      query: () => ({
        url: `${baseUrl}/subscribe`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { subscriptions: PushSubscription[] }
      }) => {
        // Backend returns { data: { subscriptions: [...] } }
        const unwrapped = unwrapResponse(response) as {
          subscriptions: PushSubscription[]
        }
        return unwrapped.subscriptions
      },
      providesTags: ["PushSubscriptions" as const],
    }),

    // Subscribe to push notifications
    subscribePush: builder.mutation<
      { subscription_id: string; message: string },
      PushSubscriptionData
    >({
      query: (subscription) => ({
        url: `${baseUrl}/subscribe`,
        method: "POST",
        body: subscription,
      }),
      invalidatesTags: ["PushSubscriptions" as const],
    }),

    // Unsubscribe from push notifications
    unsubscribePush: builder.mutation<
      { message: string },
      string // subscription_id
    >({
      query: (subscriptionId) => ({
        url: `${baseUrl}/subscribe/${subscriptionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PushSubscriptions" as const],
    }),

    // Get push notification preferences (grouped by individual and organizations)
    getPushPreferences: builder.query<
      { preferences: GroupedPushPreferences },
      void
    >({
      query: () => ({
        url: `${baseUrl}/preferences`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { preferences: GroupedPushPreferences }
      }) => {
        // Backend returns { data: { preferences: {...} } }
        const unwrapped = unwrapResponse(response) as {
          preferences: GroupedPushPreferences
        }
        return unwrapped
      },
      providesTags: ["PushPreferences" as const],
    }),

    // Update push notification preference
    updatePushPreference: builder.mutation<
      { message: string },
      { action: string; enabled: boolean; contractor_id?: string | null }
    >({
      query: (body) => ({
        url: `${baseUrl}/preferences`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PushPreferences" as const],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} = pushNotificationApi
