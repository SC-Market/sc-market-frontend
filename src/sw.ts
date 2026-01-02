/**
 * Service Worker for SC Market PWA
 * Handles push notifications and offline functionality
 *
 * Note: This file is used with vite-plugin-pwa injectManifest strategy
 * Workbox will inject the precache manifest and workbox imports during build
 *
 * The build process will:
 * 1. Replace import statements with workbox CDN imports or bundled code
 * 2. Inject the precache manifest into self.__WB_MANIFEST
 * 3. Generate the final service worker
 */

// Type definitions for service worker global scope
declare const self: ServiceWorkerGlobalScope

// Background sync event types (not in standard webworker lib yet)
interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string
}

interface SyncEvent extends ExtendableEvent {
  tag: string
  lastChance: boolean
}

// These imports will be replaced by vite-plugin-pwa during build
// In the final build, they'll be workbox CDN imports or bundled code
import { clientsClaim, skipWaiting } from "workbox-core"
import { precacheAndRoute } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"
import { CacheableResponsePlugin } from "workbox-cacheable-response"

// Take control of all clients immediately
skipWaiting()
clientsClaim()

// Precache assets (injected by vite-plugin-pwa during build)
precacheAndRoute(self.__WB_MANIFEST || [])

// Cache navigation requests with better offline support
registerRoute(
  ({ request }: { request: Request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-v1",
    networkTimeoutSeconds: 3, // Faster timeout for better perceived performance
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache successful responses and opaque responses
      }),
      new ExpirationPlugin({
        maxEntries: 100, // Increased from 50 to cache more pages
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days (increased from 1 day)
        purgeOnQuotaError: true, // Automatically purge if quota exceeded
      }),
    ],
  }),
)

// Cache API calls with StaleWhileRevalidate for better offline experience
// This serves stale data immediately while updating in the background
registerRoute(
  ({ url }: { url: URL }) => {
    const isApiCall =
      url.hostname.includes("sc-market.space") ||
      url.hostname.includes("localhost")
    const isApiPath = url.pathname.startsWith("/api/")
    const isExcluded =
      url.pathname.includes("/auth/") ||
      url.pathname.includes("/register") ||
      url.pathname.includes("/login") ||
      url.pathname.includes("/logout") ||
      url.pathname.includes("/ws") ||
      url.pathname.includes("/admin/") ||
      url.pathname.includes("/payment")

    return isApiCall && isApiPath && !isExcluded
  },
  new StaleWhileRevalidate({
    cacheName: "api-cache-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache successful responses
      }),
      new ExpirationPlugin({
        maxEntries: 200, // Increased from 50 to cache more API responses
        maxAgeSeconds: 60 * 60 * 24, // 24 hours (increased from 1 hour)
        purgeOnQuotaError: true,
      }),
    ],
  }),
)

// Cache images with expiration
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: "images-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 500, // Increased from 200
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days (increased from 7 days)
        purgeOnQuotaError: true,
      }),
    ],
  }),
)

// Cache fonts with CacheFirst strategy
registerRoute(
  /\.(?:woff|woff2|ttf|otf|eot)$/,
  new CacheFirst({
    cacheName: "fonts-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year (fonts rarely change)
        purgeOnQuotaError: true,
      }),
    ],
  }),
)

// Cache CSS and JS files with StaleWhileRevalidate
// This ensures users get cached assets immediately while updates happen in background
registerRoute(
  /\.(?:css|js)$/,
  new StaleWhileRevalidate({
    cacheName: "static-assets-v1",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        purgeOnQuotaError: true,
      }),
    ],
  }),
)

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
  console.log("Push event received:", event)

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
        console.log("Skipping silent/test notification")
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

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions),
  )
})

/**
 * Handle notification click events
 */
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("Notification clicked:", event)

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
          // Check if URL matches (accounting for hash/path differences)
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
        // Fallback: try to open in a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      }),
  )
})

/**
 * Handle notification close events (optional)
 */
self.addEventListener("notificationclose", (event: NotificationEvent) => {
  console.log("Notification closed:", event)
  // Can be used for analytics if needed
})

interface ServiceWorkerMessage {
  type: string
  [key: string]: unknown
}

/**
 * Handle messages from the main app
 */
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  console.log("Service worker received message:", event.data)

  const data = event.data as ServiceWorkerMessage | null
  if (data && data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// ============================================================================
// Periodic Background Sync
// ============================================================================

interface SyncMessage {
  type: string
  timestamp: number
}

/**
 * Handle periodic background sync events
 * This allows the app to sync data periodically even when not open
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PeriodicBackgroundSync
 */
self.addEventListener("periodicsync", (event: Event) => {
  const syncEvent = event as unknown as PeriodicSyncEvent
  console.log("Periodic background sync event:", syncEvent.tag)

  if (syncEvent.tag === "sync-notifications") {
    syncEvent.waitUntil(syncNotifications())
  } else if (syncEvent.tag === "sync-data") {
    syncEvent.waitUntil(syncData())
  }
})

/**
 * Handle one-time background sync (when device comes back online)
 * This is a fallback for browsers that don't support Periodic Background Sync
 */
self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as unknown as SyncEvent
  console.log("Background sync event (one-time):", syncEvent.tag)

  if (syncEvent.tag === "sync-notifications") {
    syncEvent.waitUntil(syncNotifications())
  } else if (syncEvent.tag === "sync-data") {
    syncEvent.waitUntil(syncData())
  }
})

/**
 * Sync notifications in the background
 */
async function syncNotifications(): Promise<void> {
  try {
    // Get all clients (open windows/tabs)
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    })

    // Notify all clients to refresh notifications
    clients.forEach((client) => {
      const message: SyncMessage = {
        type: "SYNC_NOTIFICATIONS",
        timestamp: Date.now(),
      }
      client.postMessage(message)
    })

    console.log("Background sync: Notifications sync requested")
  } catch (error) {
    console.error("Background sync: Failed to sync notifications", error)
  }
}

/**
 * Sync general app data in the background
 */
async function syncData(): Promise<void> {
  try {
    // Get all clients (open windows/tabs)
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    })

    // Notify all clients to refresh data
    clients.forEach((client) => {
      const message: SyncMessage = {
        type: "SYNC_DATA",
        timestamp: Date.now(),
      }
      client.postMessage(message)
    })

    console.log("Background sync: Data sync requested")
  } catch (error) {
    console.error("Background sync: Failed to sync data", error)
  }
}
