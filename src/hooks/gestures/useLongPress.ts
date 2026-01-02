import { useCallback, useRef } from "react"
import { useHapticFeedback } from "./useHapticFeedback"

export interface UseLongPressOptions {
  /**
   * Delay in milliseconds before long press is triggered
   * Default: 500
   */
  delay?: number
  /**
   * Whether to enable haptic feedback
   * Default: true
   */
  hapticFeedback?: boolean
  /**
   * Callback when long press is triggered
   */
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void
  /**
   * Callback for normal click/tap (if not long press)
   */
  onClick?: (event: React.MouseEvent | React.TouchEvent) => void
  /**
   * Whether long press is enabled
   * Default: true
   */
  enabled?: boolean
}

/**
 * Hook for detecting long press gestures
 *
 * @example
 * ```tsx
 * const longPressHandlers = useLongPress({
 *   onLongPress: (e) => {
 *     // Show context menu
 *   },
 *   onClick: (e) => {
 *     // Normal click handler
 *   },
 *   delay: 500,
 *   hapticFeedback: true,
 * })
 *
 * return (
 *   <div {...longPressHandlers}>
 *     Content
 *   </div>
 * )
 * ```
 */
export function useLongPress({
  delay = 500,
  hapticFeedback = true,
  onLongPress,
  onClick,
  enabled = true,
}: UseLongPressOptions) {
  const timeoutRef = useRef<number | null>(null)
  const targetRef = useRef<EventTarget | null>(null)
  const { trigger: triggerHaptic } = useHapticFeedback()

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!enabled) return

      targetRef.current = event.target

      timeoutRef.current = setTimeout(() => {
        if (hapticFeedback) {
          triggerHaptic("medium")
        }
        onLongPress(event)
      }, delay)
    },
    [enabled, delay, hapticFeedback, triggerHaptic, onLongPress],
  )

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = false) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // If we cleared before the delay, it was a normal click
      if (shouldTriggerClick && onClick && event.target === targetRef.current) {
        onClick(event)
      }

      targetRef.current = null
    },
    [onClick],
  )

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e, true),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e, true),
    onTouchCancel: (e: React.TouchEvent) => clear(e, false),
  }
}
