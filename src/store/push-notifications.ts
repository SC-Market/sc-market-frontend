import { BACKEND_URL } from "../util/constants"
import { serviceApi } from "./service"

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
      transformResponse: (response: { subscriptions: PushSubscription[] }) =>
        response.subscriptions,
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

    // Get push notification preferences
    getPushPreferences: builder.query<
      { preferences: PushPreference[] },
      void
    >({
      query: () => ({
        url: `${baseUrl}/preferences`,
        method: "GET",
      }),
      providesTags: ["PushPreferences" as const],
    }),

    // Update push notification preference
    updatePushPreference: builder.mutation<
      { message: string },
      { action: string; enabled: boolean }
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
