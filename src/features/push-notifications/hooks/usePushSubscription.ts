import { useState, useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
} from "../api/pushApi"
import {
  subscribeToPush,
  isPushNotificationSupported,
  getPushPermissionStatus,
} from "../../../util/push-subscription"
import { VITE_VAPID_PUBLIC_KEY } from "../../../util/constants"

/**
 * This device's push subscription: browser support, the notification
 * permission (kept current: re-read after a request, and on the
 * Permissions API's change event), and `handleSubscribe`, which asks for
 * permission and subscribes in one step.
 *
 * Support and permission are read after mount so a prerendered page and
 * its hydration render agree; until then `isSupported` is false and the
 * permission "default".
 */
export function usePushSubscription() {
  const { t } = useTranslation()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default")

  const { data: subscriptions } = useGetPushSubscriptionsQuery()
  const [subscribePush] = useSubscribePushMutation()

  const refreshPermission = useCallback(() => {
    setPermissionStatus(getPushPermissionStatus())
  }, [])

  useEffect(() => {
    setIsSupported(isPushNotificationSupported())
    refreshPermission()

    // Chrome and Firefox report permission changes made in site settings.
    let status: PermissionStatus | null = null
    let cancelled = false
    navigator.permissions
      ?.query({ name: "notifications" as PermissionName })
      .then((s) => {
        if (cancelled) return
        status = s
        status.onchange = refreshPermission
      })
      .catch(() => {})
    // Safari doesn't: re-read when the user comes back to the tab.
    document.addEventListener("visibilitychange", refreshPermission)
    return () => {
      cancelled = true
      if (status) status.onchange = null
      document.removeEventListener("visibilitychange", refreshPermission)
    }
  }, [refreshPermission])

  const isPermissionGranted = permissionStatus === "granted"

  const vapidPublicKey = VITE_VAPID_PUBLIC_KEY
  const isConfigured = !!vapidPublicKey

  const handleSubscribe = useCallback(async () => {
    if (!vapidPublicKey) {
      setError(t("settings.pushNotifications.notConfigured"))
      return
    }

    setIsSubscribing(true)
    setError(null)
    setSuccess(null)

    try {
      await subscribeToPush(vapidPublicKey, async (subscriptionData) => {
        await subscribePush(subscriptionData).unwrap()
      })
      setSuccess(t("settings.pushNotifications.subscribed"))
    } catch (err) {
      // A refused permission shows as the "blocked" state, not an error.
      const permission = getPushPermissionStatus()
      if (permission === "default") {
        setError(
          t(
            "settings.pushNotifications.permissionDismissed",
            "Your browser didn't turn notifications on. Try again and choose Allow.",
          ),
        )
      } else if (permission === "granted") {
        setError(
          t("settings.pushNotifications.subscribeFailed", {
            reason: err instanceof Error ? err.message : String(err),
            defaultValue:
              "Couldn't turn on push notifications: {{reason}}",
          }),
        )
      }
    } finally {
      refreshPermission()
      setIsSubscribing(false)
    }
  }, [vapidPublicKey, subscribePush, refreshPermission, t])

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
    refreshPermission,
  }
}
