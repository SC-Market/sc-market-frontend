import { useEffect, useState } from "react"
import { useGetPushSubscriptionsQuery } from "../../features/push-notifications"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Calculate optimal polling interval based on:
 * - Push notification subscription status
 * - App visibility (foreground/background)
 *
 * Returns polling interval in milliseconds:
 * - 0 = disabled (push enabled + app in background)
 * - 600000 = 10 minutes (push enabled + app in foreground)
 * - 120000 = 2 minutes (push not enabled)
 */
export function useNotificationPollingInterval(): number {
  const { data: subscriptions } = useGetPushSubscriptionsQuery()
  const [isVisible, setIsVisible] = useState(true)

  // Check if user has push subscriptions
  const hasPushSubscription = subscriptions && subscriptions.length > 0

  // Track app visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    setIsVisible(!document.hidden) // Set initial state

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // Calculate polling interval
  if (hasPushSubscription && !isVisible) {
    // Push enabled + app in background: disable polling
    return 0
  } else if (hasPushSubscription && isVisible) {
    // Push enabled + app in foreground: reduce to 10 minutes
    return 600000 // 10 minutes
  } else {
    // Push not enabled: keep default 2 minutes
    return 120000 // 2 minutes
  }
}
