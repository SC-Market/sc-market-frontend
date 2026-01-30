// Import API to ensure it's registered (side effect)
import "./api/pushApi"

// API exports
export {
  pushNotificationApi,
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} from "./api/pushApi"

// Domain exports
export type {
  PushSubscriptionData,
  PushSubscription,
  PushPreference,
  GroupedPushPreferences,
} from "./domain/types"

export { formatActionName } from "./domain/formatters"

// Hooks exports
export { usePushSettings } from "./hooks/usePushSettings"
export { usePushSubscription } from "./hooks/usePushSubscription"

// Component exports
export { PushNotificationSettings } from "./components/PushNotificationSettings"
export { PushNotificationStatus } from "./components/PushNotificationStatus"
export { PushNotificationSubscription } from "./components/PushNotificationSubscription"
export { PushNotificationErrorStates } from "./components/PushNotificationErrorStates"
