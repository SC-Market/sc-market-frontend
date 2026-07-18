/**
 * Service Worker for SC Market PWA — minimal, push-first.
 *
 * DESIGN (2026 rewrite): this SW deliberately does NOT precache, cache, or route
 * any assets. It exists only for the two things that require a service worker —
 * Web Push notifications and PWA installability. Hashed build assets are cached
 * by the browser/CDN via HTTP immutable headers (see public/_headers), which is
 * faster for repeat visits than SW precache and, crucially, cannot serve a stale
 * or corrupted chunk after a deploy.
 *
 * WHY WE REMOVED ASSET CACHING: the previous SW precached and routed /assets/*,
 * which meant that after a deploy a client could be served an old/evicted chunk
 * from the SW cache — the browser then failed to execute it (Chrome MIME error,
 * Firefox NS_ERROR_CORRUPTED_CONTENT), crashing the page. "Hard refresh works,
 * normal refresh crashes" was the signature: hard refresh bypasses the SW, the
 * next normal refresh hit the bad cache again. A SW that never touches assets
 * cannot cause that class of bug. Stale-chunk recovery for lazy routes is
 * handled entirely on the client (vite:preloadError + RouteErrorFallback + the
 * inline guard in index.html, all rate-limited by assetReloadGuard).
 *
 * Still uses vite-plugin-pwa injectManifest so we keep our custom push handlers;
 * the injected __WB_MANIFEST is referenced (required by the plugin) but not used
 * for precaching.
 */

// injectManifest injects the precache manifest into self.__WB_MANIFEST. We don't
// precache, but the build REQUIRES the token to be referenced, so we declare and
// reference it without using it.
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<unknown>
}

import { clientsClaim } from "workbox-core"
import { precacheAndRoute } from "workbox-precaching"

// injectManifest bundles this file (esbuild) BEFORE substituting the manifest,
// so the `self.__WB_MANIFEST` token must survive bundling — i.e. it can't be an
// unused expression (that gets tree-shaken, and then injection fails with
// "Unable to find a place to inject the manifest"). Passing it as a call
// argument keeps it. We filter it to empty so NOTHING is actually precached:
// the SW stays asset-transparent, we just satisfy the build's token requirement.
precacheAndRoute((self.__WB_MANIFEST || []).filter(() => false))

// ============================================================================
// Lifecycle
// ============================================================================

// Activate immediately and take control, and PURGE every Cache Storage entry.
// This is what frees clients that were trapped on the old asset-caching SW:
// when they receive this minimal SW, all previously-cached (possibly stale)
// assets and API responses are deleted, so subsequent requests go to the
// network/CDN and can never replay a bad chunk.
self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      clientsClaim()
    })(),
  )
})

// Kept for backward compat with clients that post SKIP_WAITING (e.g. an old
// "Update available" prompt). This SW already skips waiting on install.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// NOTE: no fetch handler. With no fetch listener, the browser handles every
// request natively (network + HTTP cache) — the SW is transparent to asset and
// navigation loading, which is exactly what prevents stale-chunk crashes.

// ============================================================================
// Push Notification Handling
// ============================================================================

interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    url?: string
    [key: string]: unknown
  }
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  timestamp?: number
}

interface PushMessageData {
  title?: string
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    url?: string
    [key: string]: unknown
  }
  requireInteraction?: boolean
  silent?: boolean
  test?: boolean
  vibrate?: number[]
  timestamp?: number
}

/**
 * Handle push events (when a push notification is received)
 */
self.addEventListener("push", (event: PushEvent) => {
  // Default notification data optimized for Android
  // Android requires proper PNG icons (not favicon.ico)
  let notificationData: NotificationData = {
    title: "SC Market",
    body: "You have a new notification",
    icon: "/android-chrome-192x192.png", // Android-optimized icon
    badge: "/android-chrome-192x192.png", // Badge for Android notification tray
    tag: "scmarket-notification",
    data: {
      url: "/",
    },
    // Android-specific options
    requireInteraction: false,
    silent: false,
  }

  // Parse push event data if available
  if (event.data) {
    try {
      const data = event.data.json() as PushMessageData

      // Skip silent/test notifications
      if (data.silent === true || data.test === true) {
        return
      }

      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: data.data || notificationData.data,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        vibrate: data.vibrate,
        timestamp: data.timestamp || Date.now(),
      }
    } catch (error) {
      console.error("Failed to parse push event data:", error)
      // Use default notification data
    }
  }

  // Show notification
  const notificationOptions: NotificationOptions & {
    vibrate?: number[]
    timestamp?: number
  } = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction,
    silent: notificationData.silent,
  }

  // Add vibrate and timestamp if provided (these are valid but not in standard types)
  if (notificationData.vibrate) {
    notificationOptions.vibrate = notificationData.vibrate
  }
  if (notificationData.timestamp) {
    notificationOptions.timestamp = notificationData.timestamp
  }

  // Notify all window clients so the app can invalidate RTK Query cache and refetch
  // notifications. App.tsx listens for PUSH_NOTIFICATION_RECEIVED and dispatches
  // notificationApi.util.invalidateTags(["Notifications"]) so subscribed
  // useGetNotificationsQuery hooks refetch.
  const notifyClients = self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      const message = {
        type: "PUSH_NOTIFICATION_RECEIVED" as const,
        timestamp: Date.now(),
      }
      clientList.forEach((client) => {
        try {
          client.postMessage(message)
        } catch {
          // Ignore if client is closed
        }
      })
    })

  event.waitUntil(
    self.registration
      .showNotification(notificationData.title, notificationOptions)
      .then(() => notifyClients),
  )
})

/**
 * Handle notification click events
 */
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()

  const notificationData = (event.notification.data || {}) as {
    url?: string
    [key: string]: unknown
  }
  const urlToOpen = notificationData.url || "/"

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        // This works for both browser and PWA contexts
        for (const client of clientList) {
          const clientUrl = new URL(client.url)
          const targetUrl = new URL(urlToOpen, self.location.origin)

          if (
            clientUrl.origin === targetUrl.origin &&
            clientUrl.pathname === targetUrl.pathname &&
            "focus" in client
          ) {
            return client.focus()
          }
        }

        // If no matching window, open a new one
        // This works in both browser and PWA (standalone) mode on Android
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
      .catch((error) => {
        console.error("Failed to handle notification click:", error)
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      }),
  )
})

/**
 * Handle notification close events (optional)
 */
self.addEventListener("notificationclose", () => {
  // Can be used for analytics if needed
})
