/**
 * The root route's component (src/root.tsx renders it through the app
 * shell, src/app/shell.ts): app-wide effects (prefetching, service worker
 * messages, periodic sync, web vitals) around the route outlet.
 */
import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { SharedIntersectionObserver } from "../hooks/prefetch/usePrefetchOnVisible"
import { useAppDispatch } from "../store/hooks"
import { notificationApi } from "../features/notifications/api/notificationApi"
import { usePeriodicBackgroundSync } from "../hooks/pwa/usePeriodicBackgroundSync"
import { useWebVitals } from "../hooks/performance/useWebVitals"
import { markRouterReady } from "../routes/definePage"

export function App() {
  const dispatch = useAppDispatch()
  const { registerPeriodicSync, isSupported: periodicSyncSupported } =
    usePeriodicBackgroundSync()

  // Track Core Web Vitals
  useWebVitals()

  useEffect(() => markRouterReady(), [])

  useEffect(() => {
    // The app's theme styles are in now; drop document.html's pre-app page
    // background so it can't show through under a different theme.
    document.documentElement.removeAttribute("data-pre-theme")
    // A prerendered page that was rendered from scratch (entry.client.tsx)
    // is ready to show.
    document.documentElement.removeAttribute("data-render-fresh")

    // No blanket background prefetching here: it evaluated chunks for pages
    // most visitors never open while the current page was still rendering
    // (idle long tasks, input delay). Prefetching is per page ("likely next",
    // via the idle queue in router/idlePrefetchQueue.ts) and on intent
    // (installLinkIntentPrefetch in entry.client.tsx).

    // Register periodic background sync if supported
    if (periodicSyncSupported) {
      // Register sync for notifications (every 12 hours)
      registerPeriodicSync("sync-notifications", 12 * 60 * 60 * 1000).catch(
        () => {
          // Silently fail if registration fails (permission denied, etc.)
        },
      )

      // Register sync for general data (every 24 hours)
      registerPeriodicSync("sync-data", 24 * 60 * 60 * 1000).catch(() => {
        // Silently fail if registration fails
      })
    }

    // Set up push notification handling: service worker posts messages here;
    // we invalidate RTK Query tags so any subscribed useGetNotificationsQuery
    // (and other invalidated endpoints) refetch automatically.
    if ("serviceWorker" in navigator) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === "PUSH_NOTIFICATION_RECEIVED") {
          // SW sent this after showing a push; invalidate so notification queries refetch
          dispatch(
            notificationApi.util.invalidateTags(["Notifications" as const]),
          )
        } else if (event.data?.type === "SYNC_NOTIFICATIONS") {
          // SW background sync fetched notifications; invalidate to refetch
          dispatch(
            notificationApi.util.invalidateTags(["Notifications" as const]),
          )
        } else if (event.data?.type === "SYNC_DATA") {
          // SW periodic data sync; invalidate so dashboard/orders/market refetch
          dispatch(
            notificationApi.util.invalidateTags([
              "Notifications",
              "Orders",
              "MarketListings",
            ] as const),
          )
        }
      }

      navigator.serviceWorker.addEventListener("message", messageHandler)

      // Cleanup function
      return () => {
        navigator.serviceWorker.removeEventListener("message", messageHandler)
        // Cleanup shared intersection observer
        SharedIntersectionObserver.getInstance().cleanup()
      }
    }

    // Cleanup function to prevent memory leaks
    return () => {
      // Cleanup shared intersection observer
      SharedIntersectionObserver.getInstance().cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodicSyncSupported])

  return <Outlet />
}
