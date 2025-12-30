/**
 * Push subscription utilities for Web Push Protocol
 */

import {
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  PushSubscriptionData,
} from "../store/push-notifications"

/**
 * Convert VAPID public key from base64 URL-safe format to Uint8Array
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as Uint8Array<ArrayBuffer>
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Check if browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

/**
 * Request push notification permission from user
 */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications")
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Get current push notification permission status
 */
export function getPushPermissionStatus(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied"
  }
  return Notification.permission
}

/**
 * Subscribe to push notifications
 * This function handles the full subscription flow:
 * 1. Check service worker support
 * 2. Request permission
 * 3. Get service worker registration
 * 4. Subscribe to push manager
 * 5. Send subscription to backend
 */
export async function subscribeToPush(
  vapidPublicKey: string,
  onSubscribe: (subscription: PushSubscriptionData) => Promise<void>,
): Promise<PushSubscriptionData | null> {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported in this browser")
  }

  if (!vapidPublicKey || vapidPublicKey.trim() === "") {
    throw new Error(
      "Push notifications are not configured. Please contact support.",
    )
  }

  // Request permission
  const permission = await requestPushPermission()
  if (permission !== "granted") {
    throw new Error(`Permission denied: ${permission}`)
  }

  // Get service worker registration
  const registration = await navigator.serviceWorker.ready

  // Subscribe to push manager
  const vapidKeyArray = urlBase64ToUint8Array(vapidPublicKey)
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidKeyArray as BufferSource,
  })

  // Convert subscription to format for backend
  const p256dhKey = subscription.getKey("p256dh")
  const authKey = subscription.getKey("auth")

  if (!p256dhKey || !authKey) {
    throw new Error("Failed to get subscription keys")
  }

  // Convert BufferSource to ArrayBuffer
  const p256dhArrayBuffer =
    p256dhKey instanceof ArrayBuffer
      ? p256dhKey
      : new Uint8Array(p256dhKey).buffer
  const authArrayBuffer =
    authKey instanceof ArrayBuffer ? authKey : new Uint8Array(authKey).buffer

  const subscriptionData: PushSubscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(p256dhArrayBuffer),
      auth: arrayBufferToBase64(authArrayBuffer),
    },
    userAgent: navigator.userAgent,
  }

  // Send to backend
  await onSubscribe(subscriptionData)

  return subscriptionData
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(
  subscriptionId: string,
  onUnsubscribe: (subscriptionId: string) => Promise<void>,
): Promise<void> {
  // Get service worker registration
  const registration = await navigator.serviceWorker.ready

  // Get current subscription
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    // Unsubscribe from push manager
    await subscription.unsubscribe()
  }

  // Remove from backend
  await onUnsubscribe(subscriptionId)
}

/**
 * Get current push subscription from service worker
 */
export async function getCurrentPushSubscription(): Promise<globalThis.PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription
  } catch (error) {
    console.error("Failed to get push subscription:", error)
    return null
  }
}
