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

// These imports will be replaced by vite-plugin-pwa during build
// In the final build, they'll be workbox CDN imports or bundled code
import { clientsClaim, skipWaiting } from "workbox-core"
import { precacheAndRoute } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { NetworkFirst, CacheFirst } from "workbox-strategies"

// Take control of all clients immediately
skipWaiting()
clientsClaim()

// Precache assets (injected by vite-plugin-pwa during build)
precacheAndRoute(self.__WB_MANIFEST || [])

// Cache navigation requests
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-v1",
    networkTimeoutSeconds: 5,
  }),
)

// Cache API calls
registerRoute(
  ({ url }) => {
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
  new NetworkFirst({
    cacheName: "api-cache-v1",
    networkTimeoutSeconds: 10,
  }),
)

// Cache images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: "images-v1",
  }),
)

// ============================================================================
// Push Notification Handling
// ============================================================================

/**
 * Handle push events (when a push notification is received)
 */
self.addEventListener("push", (event) => {
  console.log("Push event received:", event)

  // Default notification data optimized for Android
  // Android requires proper PNG icons (not favicon.ico)
  let notificationData = {
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
      const data = event.data.json()
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
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      vibrate: notificationData.vibrate,
      timestamp: notificationData.timestamp,
    }),
  )
})

/**
 * Handle notification click events
 */
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  const notificationData = event.notification.data || {}
  const urlToOpen = notificationData.url || "/"

  event.waitUntil(
    clients
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
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
      .catch((error) => {
        console.error("Failed to handle notification click:", error)
        // Fallback: try to open in a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})

/**
 * Handle notification close events (optional)
 */
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event)
  // Can be used for analytics if needed
})

/**
 * Handle messages from the main app
 */
self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
