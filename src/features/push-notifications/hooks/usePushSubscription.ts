import { useState, useCallback, useEffect } from "react"
import {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
} from "../api/pushApi"
import {
  subscribeToPush,
  isPushNotificationSupported,
  getPushPermissionStatus,
  getCurrentPushSubscription,
} from "../../../util/push-subscription"
import { VITE_VAPID_PUBLIC_KEY } from "../../../util/constants"

export function usePushSubscription() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: subscriptions } = useGetPushSubscriptionsQuery()
  const [subscribePush] = useSubscribePushMutation()

  // Check browser support
  const isSupported = isPushNotificationSupported()
  const permissionStatus = getPushPermissionStatus()
  const isPermissionGranted = permissionStatus === "granted"

  // Get VAPID public key from environment
  const vapidPublicKey = VITE_VAPID_PUBLIC_KEY
  const isConfigured = !!vapidPublicKey

  // Handle subscribe
  const handleSubscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      setError("Push notifications are not configured. Please contact support.")
      return
    }

    setIsSubscribing(true)
    setError(null)
    setSuccess(null)

    try {
      await subscribeToPush(vapidPublicKey, async (subscriptionData) => {
        await subscribePush(subscriptionData).unwrap()
      })
      setSuccess("Successfully subscribed to push notifications!")
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to subscribe to push notifications"
      setError(errorMessage)
    } finally {
      setIsSubscribing(false)
    }
  }, [vapidPublicKey, subscribePush])

  return {
    subscriptions,
    isSubscribing,
    isSupported,
    permissionStatus,
    isPermissionGranted,
    isConfigured,
    error,
    success,
    setError,
    setSuccess,
    handleSubscribe,
  }
}
