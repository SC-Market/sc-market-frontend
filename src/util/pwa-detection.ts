/**
 * PWA installation and platform detection. Browser-only: call these after
 * mount (in an effect), never during a render that is prerendered.
 */

/**
 * Whether the app is running installed (standalone display mode, or iOS's
 * legacy `navigator.standalone`).
 */
export function isPWAInstalled(): boolean {
  if (window.matchMedia?.("(display-mode: standalone)").matches) {
    return true
  }
  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true
  )
}

/**
 * iPhone, iPod or iPad. iPadOS 13+ reports a Mac user agent, so a "Mac"
 * with a touch screen counts as an iPad.
 */
export function isIOSDevice(): boolean {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return true
  return /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1
}

export function isAndroidDevice(): boolean {
  return /Android/i.test(navigator.userAgent)
}

/** Where to send someone whose browser blocked notifications. */
export type NotificationHelpPlatform =
  | "ios-app"
  | "android"
  | "safari"
  | "firefox"
  | "chromium"

export function notificationHelpPlatform(): NotificationHelpPlatform {
  const ua = navigator.userAgent
  if (isIOSDevice()) return "ios-app"
  if (isAndroidDevice()) return "android"
  if (/Firefox\//i.test(ua)) return "firefox"
  if (/Safari\//i.test(ua) && !/Chrome\/|Chromium\/|Edg\//i.test(ua)) {
    return "safari"
  }
  return "chromium"
}
