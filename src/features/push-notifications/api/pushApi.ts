import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import type {
  PushSubscriptionData,
  PushSubscription,
  GroupedPushPreferences,
} from "../domain/types"

const baseUrl = `${BACKEND_URL}/api/push`

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

    // Update push notification preference (single or batch)
    updatePushPreference: builder.mutation<
      {
        message: string
        preferences?: Array<{
          action: string
          enabled: boolean
          contractor_id?: string | null
        }>
      },
      | { action: string; enabled: boolean; contractor_id?: string | null }
      | {
          preferences: Array<{
            action: string
            enabled: boolean
            contractor_id?: string | null
          }>
        }
    >({
      query: (body) => ({
        url: `${baseUrl}/preferences`,
        method: "PATCH",
        body: Array.isArray((body as any).preferences) ? body : body,
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
