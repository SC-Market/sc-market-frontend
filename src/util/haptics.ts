/**
 * Haptic Feedback Utility
 *
 * Provides consistent haptic feedback across the app for better mobile UX.
 * Only works on devices that support the Vibration API (most modern mobile browsers).
 *
 * Usage:
 * import { haptic } from '../util/haptics'
 *
 * haptic.light()    // Light tap (10ms)
 * haptic.medium()   // Medium tap (20ms)
 * haptic.heavy()    // Heavy tap (30ms)
 * haptic.success()  // Success pattern
 * haptic.error()    // Error pattern
 * haptic.selection() // Selection change
 */

type HapticPattern = number | number[]

const vibrate = (pattern: HapticPattern): void => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}

export const haptic = {
  /**
   * Light haptic feedback - for subtle interactions
   * Use for: hover states, focus changes, minor UI updates
   */
  light: (): void => {
    vibrate(10)
  },

  /**
   * Medium haptic feedback - for standard interactions
   * Use for: button taps, tab switches, toggle changes
   */
  medium: (): void => {
    vibrate(20)
  },

  /**
   * Heavy haptic feedback - for significant interactions
   * Use for: confirmations, deletions, important actions
   */
  heavy: (): void => {
    vibrate(30)
  },

  /**
   * Success haptic pattern - double tap
   * Use for: successful form submissions, completed actions
   */
  success: (): void => {
    vibrate([10, 50, 10])
  },

  /**
   * Error haptic pattern - longer vibration
   * Use for: form errors, failed actions, warnings
   */
  error: (): void => {
    vibrate([20, 100, 20])
  },

  /**
   * Selection haptic - very light tap
   * Use for: selecting items in lists, changing selections
   */
  selection: (): void => {
    vibrate(5)
  },

  /**
   * Impact haptic - quick strong tap
   * Use for: swipe actions, drag and drop, collisions
   */
  impact: (): void => {
    vibrate(15)
  },

  /**
   * Notification haptic - triple tap pattern
   * Use for: new messages, alerts, notifications
   */
  notification: (): void => {
    vibrate([10, 50, 10, 50, 10])
  },
}

/**
 * Check if haptic feedback is supported
 */
export const isHapticSupported = (): boolean => {
  return typeof navigator.vibrate === "function"
}

/**
 * Wrapper for onClick handlers that adds haptic feedback
 */
export const withHaptic = <T extends (...args: any[]) => any>(
  handler: T,
  hapticType: keyof typeof haptic = "medium",
): T => {
  return ((...args: any[]) => {
    haptic[hapticType]()
    return handler(...args)
  }) as T
}
