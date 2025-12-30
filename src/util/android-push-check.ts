/**
 * Android-specific push notification utilities
 */

/**
 * Check if the device is Android
 */
export function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent)
}

/**
 * Check if running in Android Chrome
 */
export function isAndroidChrome(): boolean {
  return (
    isAndroidDevice() &&
    /Chrome/i.test(navigator.userAgent) &&
    !/Edg/i.test(navigator.userAgent) // Exclude Edge
  )
}

/**
 * Check if Android push notifications are supported
 * Android requires:
 * 1. PWA installation (standalone mode)
 * 2. Service worker support
 * 3. Push API support
 */
export function isAndroidPushSupported(): boolean {
  if (!isAndroidDevice()) {
    return true // Not Android, so not applicable
  }

  // Check if PWA is installed (required for Android push)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true

  if (!isStandalone) {
    return false // Android requires PWA installation
  }

  // Check for service worker and push support
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

/**
 * Get Android-specific error message if push is not supported
 */
export function getAndroidPushErrorMessage(): string | null {
  if (!isAndroidDevice()) {
    return null
  }

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true

  if (!isStandalone) {
    return "Android requires the app to be installed as a PWA to receive push notifications. Please install the app first."
  }

  if (!("serviceWorker" in navigator)) {
    return "Your Android browser does not support service workers."
  }

  if (!("PushManager" in window)) {
    return "Your Android browser does not support push notifications."
  }

  return null
}
