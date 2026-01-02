/**
 * Hook for providing haptic feedback using the Vibration API
 *
 * Provides different vibration patterns for different types of actions.
 * Gracefully degrades on unsupported devices.
 */

export type HapticFeedbackType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "warning"

/**
 * Vibration patterns for different feedback types
 * Patterns are arrays of [vibrate, pause, vibrate, pause, ...] in milliseconds
 */
const HAPTIC_PATTERNS: Record<HapticFeedbackType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [20, 50, 20],
  error: [50, 50, 50],
  warning: [30, 50, 30],
}

/**
 * Check if the device supports haptic feedback (Vibration API)
 */
export function isHapticFeedbackSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator
}

/**
 * Hook for triggering haptic feedback
 *
 * @example
 * ```tsx
 * const { trigger } = useHapticFeedback()
 *
 * const handleClick = () => {
 *   trigger('success')
 *   // ... rest of click handler
 * }
 * ```
 */
export function useHapticFeedback() {
  const trigger = (type: HapticFeedbackType = "medium") => {
    if (!isHapticFeedbackSupported()) {
      return
    }

    const pattern = HAPTIC_PATTERNS[type]
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      if (import.meta.env.DEV) {
        console.warn("Haptic feedback failed:", error)
      }
    }
  }

  return {
    trigger,
    isSupported: isHapticFeedbackSupported(),
  }
}
