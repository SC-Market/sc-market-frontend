import { useState, useCallback, useRef, useEffect } from "react"
import { useHapticFeedback } from "./useHapticFeedback"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface UsePullToRefreshOptions {
  /**
   * Distance in pixels to pull before triggering refresh
   * Default: 80
   */
  threshold?: number
  /**
   * Resistance factor when pulling beyond threshold (0-1)
   * Lower values = more resistance
   * Default: 0.5
   */
  resistance?: number
  /**
   * Whether to enable haptic feedback
   * Default: true
   */
  hapticFeedback?: boolean
  /**
   * Whether pull-to-refresh is enabled
   * Default: true
   */
  enabled?: boolean
  /**
   * Callback when refresh is triggered
   */
  onRefresh: () => Promise<void> | void
}

export interface UsePullToRefreshReturn {
  /**
   * Whether pull-to-refresh is currently active (refreshing)
   */
  isRefreshing: boolean
  /**
   * Current pull distance in pixels
   */
  pullDistance: number
  /**
   * Whether the pull threshold has been reached
   */
  isPulledPastThreshold: boolean
  /**
   * Touch event handlers
   */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
  }
  /**
   * Manually trigger refresh
   */
  triggerRefresh: () => Promise<void>
}

/**
 * Hook for implementing pull-to-refresh functionality
 *
 * @example
 * ```tsx
 * const { isRefreshing, pullDistance, handlers, triggerRefresh } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await refetch()
 *   },
 *   threshold: 80,
 *   hapticFeedback: true,
 * })
 *
 * return (
 *   <div
 *     onTouchStart={handlers.onTouchStart}
 *     onTouchMove={handlers.onTouchMove}
 *     onTouchEnd={handlers.onTouchEnd}
 *     style={{ transform: `translateY(${pullDistance}px)` }}
 *   >
 *     {children}
 *   </div>
 * )
 * ```
 */
export function usePullToRefresh({
  threshold = 80,
  resistance = 0.5,
  hapticFeedback = true,
  enabled = true,
  onRefresh,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulledPastThreshold, setIsPulledPastThreshold] = useState(false)

  const startY = useRef<number | null>(null)
  const currentY = useRef<number | null>(null)
  const hasTriggeredHaptic = useRef(false)
  const { trigger: triggerHaptic } = useHapticFeedback()

  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    setPullDistance(0)
    setIsPulledPastThreshold(false)

    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, onRefresh])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing) return

      // Only trigger if at the top of the scrollable container
      const target = e.currentTarget as HTMLElement
      if (target.scrollTop > 0) {
        return
      }

      startY.current = e.touches[0].clientY
      currentY.current = startY.current
      hasTriggeredHaptic.current = false
    },
    [enabled, isRefreshing],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || isRefreshing || startY.current === null) return

      currentY.current = e.touches[0].clientY
      const deltaY = currentY.current - startY.current

      // Only allow pull down (positive deltaY)
      if (deltaY <= 0) {
        setPullDistance(0)
        setIsPulledPastThreshold(false)
        return
      }

      // Check if we're at the top of the scrollable container
      const target = e.currentTarget as HTMLElement
      if (target.scrollTop > 0) {
        setPullDistance(0)
        setIsPulledPastThreshold(false)
        startY.current = null
        return
      }

      // Calculate pull distance with resistance
      let distance = deltaY
      if (deltaY > threshold) {
        // Apply resistance when past threshold
        distance = threshold + (deltaY - threshold) * resistance
      }

      setPullDistance(distance)
      const pastThreshold = distance >= threshold
      setIsPulledPastThreshold(pastThreshold)

      // Trigger haptic feedback when threshold is crossed
      if (pastThreshold && !hasTriggeredHaptic.current && hapticFeedback) {
        triggerHaptic("medium")
        hasTriggeredHaptic.current = true
      }
    },
    [
      enabled,
      isRefreshing,
      threshold,
      resistance,
      hapticFeedback,
      triggerHaptic,
    ],
  )

  const handleTouchEnd = useCallback(() => {
    if (!enabled || isRefreshing || startY.current === null) {
      startY.current = null
      currentY.current = null
      return
    }

    if (isPulledPastThreshold) {
      // Trigger refresh
      triggerRefresh()
    } else {
      // Reset pull distance
      setPullDistance(0)
      setIsPulledPastThreshold(false)
    }

    startY.current = null
    currentY.current = null
    hasTriggeredHaptic.current = false
  }, [enabled, isRefreshing, isPulledPastThreshold, triggerRefresh])

  // Reset on unmount
  useEffect(() => {
    return () => {
      startY.current = null
      currentY.current = null
      setPullDistance(0)
      setIsPulledPastThreshold(false)
    }
  }, [])

  return {
    isRefreshing,
    pullDistance,
    isPulledPastThreshold,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    triggerRefresh,
  }
}
