/**
 * Badge API Hook
 * Manages the app icon badge to show unread notification count
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/setAppBadge
 */

import { useEffect, useRef } from "react"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Hook to update the app icon badge with unread count
 * @param unreadCount The number of unread notifications
 */
export function useBadgeAPI(unreadCount: number) {
  const previousCountRef = useRef<number | null>(null)

  useEffect(() => {
    // Check if Badge API is supported
    if (!("setAppBadge" in navigator)) {
      return
    }

    // Only update if count changed
    if (previousCountRef.current === unreadCount) {
      return
    }

    previousCountRef.current = unreadCount

    // Update badge
    const updateBadge = async () => {
      try {
        if (unreadCount > 0) {
          // Show badge with count (max 99)
          await navigator.setAppBadge(Math.min(unreadCount, 99))
        } else {
          // Clear badge when no unread notifications
          await navigator.clearAppBadge()
        }
      } catch (error) {
        // Silently fail if badge API is not available or fails
        // This can happen if the app is not installed as PWA
        console.debug("Badge API not available:", error)
      }
    }

    updateBadge()
  }, [unreadCount])

  // Clear badge on unmount
  useEffect(() => {
    return () => {
      if ("clearAppBadge" in navigator) {
        navigator.clearAppBadge().catch(() => {
          // Ignore errors on cleanup
        })
      }
    }
  }, [])
}
