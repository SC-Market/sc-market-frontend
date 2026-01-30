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
