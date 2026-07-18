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
import type { PrecacheEntry } from "workbox-precaching"
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching"
import { registerRoute, setCatchHandler } from "workbox-routing"
import {
  NetworkFirst,
  NetworkOnly,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies"
import { ExpirationPlugin } from "workbox-expiration"
import { CacheableResponsePlugin } from "workbox-cacheable-response"
import { BackgroundSyncPlugin } from "workbox-background-sync"

// Only skip waiting when explicitly told by the client (user clicks "Update").
// Unconditional skipWaiting + clientsClaim causes all open tabs to reload
// simultaneously when the new SW's precache manifest no longer contains
// the old hashed assets that those tabs reference.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    skipWaiting()
    clientsClaim()
  }
})

// Clean up old precache entries from previous SW versions
cleanupOutdatedCaches()

/** HTML shell cache — must not survive across SW generations or unregister (Cache Storage persists). */
const NAVIGATION_CACHE_NAME = "pages-v1"

// Drop any cached document from a previous registration so the first load after
// activate/controllerchange cannot replay an old index.html (wrong hashed /assets).
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(caches.delete(NAVIGATION_CACHE_NAME))
})

// Precache assets (injected by vite-plugin-pwa during build)
const manifest = self.__WB_MANIFEST || []
precacheAndRoute(manifest)

// Build a set of precached URLs for quick lookup
const precachedUrls = new Set(
  manifest.map((entry: PrecacheEntry | string) => {
    const url = typeof entry === "string" ? entry : entry.url
    return new URL(url, self.location.href).pathname
  }),
)

// Handle stale asset requests after deploy.
// When a new SW activates, old HTML may reference hashed assets not in the new precache.
// precacheAndRoute ignores requests not in its manifest, so they fall through here.
// We try network, and if that 404s, tell clients to reload for the new HTML.
registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith("/assets/") &&
    !precachedUrls.has(url.pathname),
  async ({ request, event }) => {
    try {
      const response = await fetch(request)
      // A missing asset can come back as 200 text/html (SPA _redirects catch-all)
      // instead of a 404. Executing that HTML as a JS module hard-crashes the
      // page, so treat an HTML response to an asset request as "asset gone".
      const contentType = response.headers.get("content-type") || ""
      const isHtml = contentType.includes("text/html")
      if (response.ok && !isHtml) return response
    } catch {
      // network error
    }
    // Asset gone (404, or HTML masquerading as the asset) — notify the client to
    // reload for the current build.
    const clientId =
      (event as FetchEvent).resultingClientId ||
      (event as FetchEvent).clientId
    if (clientId) {
      const client = await self.clients.get(clientId)
      if (client) {
        client.postMessage({ type: "ASSET_NOT_FOUND" })
      }
    }
    // Clean failed fetch (not a fabricated body) so the import() rejects and the
    // guards handle recovery.
    return Response.error()
  },
)

// HTML must always match current /assets/* hashes. NetworkFirst + pages-v1 cache
// could serve an old index after deploy; NetworkOnly + no-store avoids SW/HTTP cache
// for navigations so clients pick up the latest shell (offline: navigation may fail).
registerRoute(
  ({ request }: { request: Request }) => request.mode === "navigate",
  new NetworkOnly({
    fetchOptions: { cache: "no-store" },
  }),
)

// Cache API calls with NetworkFirst
// Try network first, fall back to cache if offline
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
  new NetworkFirst({
    cacheName: "api-cache-v1",
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24,
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

// Cache non-bundled CSS/JS only. Vite emits hashed chunks under /assets/ — those are
// precached (or handled by the /assets/ fallback above). Applying StaleWhileRevalidate
// to /assets/*.js caused the SW to throw when cache+network both failed (handlerDidError
// returned undefined), which browsers surface as "unexpected error".
registerRoute(
  ({ url }: { url: URL }) =>
    url.origin === self.location.origin &&
    !url.pathname.startsWith("/assets/") &&
    /\.(?:css|js)$/.test(url.pathname),
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
      {
        handlerDidError: async ({ request }: { request: Request }) => {
          try {
            return await fetch(request)
          } catch {
            return new Response("Offline", { status: 503 })
          }
        },
      },
    ],
  }),
)

// Handle failed mutations (POST/PUT/DELETE) with background sync
// Retries failed requests when device comes back online
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    const isApiCall =
      url.hostname.includes("sc-market.space") ||
      url.hostname.includes("localhost")
    const isApiPath = url.pathname.startsWith("/api/")
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
      request.method,
    )
    const isExcluded =
      url.pathname.includes("/auth/") ||
      url.pathname.includes("/register") ||
      url.pathname.includes("/login") ||
      url.pathname.includes("/logout") ||
      url.pathname.includes("/ws") ||
      url.pathname.includes("/admin/") ||
      url.pathname.includes("/payment")

    return isApiCall && isApiPath && isMutation && !isExcluded
  },
  new NetworkFirst({
    cacheName: "api-mutations-v1",
    plugins: [
      // Queue failed mutations to retry when back online
      new BackgroundSyncPlugin("api-mutations-queue", {
        maxRetentionTime: 24 * 60, // Retry for up to 24 hours
      }),
    ],
  }),
)

// ============================================================================
// Global catch handler — recover instead of crashing
// ============================================================================
//
// Without this, when ANY route handler throws/rejects (e.g. a precached entry
// was evicted or corrupted, or the network fetch fails for a script the app
// needs), Workbox lets the error bubble to the browser as "A serviceworker
// intercepted the request and encountered an unexpected error". For an app
// chunk (index-*.js, vendor chunks) that is a hard crash with no recovery,
// and if it's the entry chunk the app never boots — so none of the client-side
// guards (vite:preloadError, assetReloadGuard) ever run → infinite reload loop.
//
// Strategy: catch every handler failure. For a script/style request, treat it
// as "I'm running a stale build": try a fresh network fetch; if that 404s or
// fails, PURGE all SW caches (so the next load starts clean and can fetch the
// latest index + chunks) and tell the client to do a rate-limited reload via
// the existing ASSET_NOT_FOUND channel (bounded by assetReloadGuard, max 2 per
// 120s — so we recover without looping). Never return undefined here.
async function purgeAllCaches(): Promise<void> {
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => caches.delete(k)))
  } catch {
    // best-effort
  }
}

async function notifyClientToReload(event: ExtendableEvent): Promise<void> {
  const fetchEvent = event as FetchEvent
  const clientId = fetchEvent.resultingClientId || fetchEvent.clientId
  let notified = false
  if (clientId) {
    const client = await self.clients.get(clientId)
    if (client) {
      client.postMessage({ type: "ASSET_NOT_FOUND" })
      notified = true
    }
  }
  if (!notified) {
    // Entry-chunk case: the requesting client may not be controllable yet.
    // Broadcast so any window that IS up can trigger the guarded reload.
    const all = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    for (const c of all) c.postMessage({ type: "ASSET_NOT_FOUND" })
  }
}

setCatchHandler(async ({ request, event }) => {
  const isScriptOrStyle =
    request.destination === "script" ||
    request.destination === "style" ||
    /\.(?:js|css|mjs)$/.test(new URL(request.url).pathname)

  if (isScriptOrStyle) {
    // Try the network directly — this is the freshest copy available. A precache
    // handler can throw when its cache entry was evicted/corrupted even though
    // the asset is fine on the network, so this recovers the common case.
    try {
      const fresh = await fetch(request)
      if (fresh.ok) return fresh
    } catch {
      // fall through to recovery
    }
    // Genuinely unrecoverable (asset gone / offline). Purge caches so the next
    // boot is clean, and ask the client to do a rate-limited reload.
    await purgeAllCaches()
    await notifyClientToReload(event)
    // IMPORTANT: return a network error, NOT a fabricated 503/200 body. A JS
    // module request that receives a non-JS body (or a 503) becomes a hard,
    // unrecoverable module error. Response.error() makes it a clean failed
    // fetch, so the browser + existing guards (vite:preloadError,
    // RouteErrorFallback, the index.html inline handler) handle it and the
    // pending reload takes over.
    return Response.error()
  }

  // Non-critical requests (images, etc.): fail soft, never throw.
  return Response.error()
})

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
 * Handle messages from the main app (non-lifecycle messages)
 */
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  console.log("Service worker received message:", event.data)
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
 * Fetches notification data and caches it, then notifies clients
 */
async function syncNotifications(): Promise<void> {
  try {
    const BACKEND_URL = "https://sc-market.space"
    const API_URL = `${BACKEND_URL}/api/notification/0?pageSize=20`

    // Fetch notifications from API
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include", // Include cookies for authentication
    })

    if (response.ok) {
      const data = await response.json()

      // Cache the notification data
      const cache = await caches.open("api-cache-v1")
      await cache.put(API_URL, new Response(JSON.stringify(data)))

      console.log("Background sync: Notifications fetched and cached", {
        count: data.notifications?.length || 0,
        unread: data.unread_count || 0,
      })
    } else {
      console.warn(
        "Background sync: Failed to fetch notifications",
        response.status,
      )
    }

    // Notify all clients to refresh notifications
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    })

    clients.forEach((client) => {
      try {
        const message: SyncMessage = {
          type: "SYNC_NOTIFICATIONS",
          timestamp: Date.now(),
        }
        client.postMessage(message)
      } catch (error) {
        // Ignore errors if client is closed
        console.debug("Failed to post message to client:", error)
      }
    })
  } catch (error) {
    console.error("Background sync: Failed to sync notifications", error)
  }
}

/**
 * Sync general app data in the background
 * Fetches key data endpoints and caches them
 */
async function syncData(): Promise<void> {
  try {
    const BACKEND_URL = "https://sc-market.space"
    const cache = await caches.open("api-cache-v1")

    // First, fetch user profile to check if user has a contractor/org
    const profileUrl = `${BACKEND_URL}/api/profile`
    let userSpectrumId: string | null = null

    try {
      const profileResponse = await fetch(profileUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        // Cache profile data
        await cache.put(profileUrl, profileResponse.clone())
        console.log("Background sync: Cached profile")

        // Extract spectrum_id from profile if available
        // Profile may have contractor data in various formats
        if (profileData?.contractor?.spectrum_id) {
          userSpectrumId = profileData.contractor.spectrum_id
        } else if (profileData?.spectrum_id) {
          userSpectrumId = profileData.spectrum_id
        } else if (profileData?.contractors?.[0]?.spectrum_id) {
          userSpectrumId = profileData.contractors[0].spectrum_id
        }
      }
    } catch (error) {
      console.warn("Background sync: Failed to fetch profile", error)
    }

    // Sync key data endpoints that users frequently access
    // These are prioritized for offline availability
    const endpoints = [
      // User's own data (high priority)
      `${BACKEND_URL}/api/orders/user/data`, // User orders data with trends
      `${BACKEND_URL}/api/chats`, // User's chat list (important for communication)
      `${BACKEND_URL}/api/market/mine?pageSize=20`, // User's own market listings
      `${BACKEND_URL}/api/ships/mine`, // User's ships

      // Public/active data (medium priority)
      `${BACKEND_URL}/api/contracts`, // Active public contracts
      `${BACKEND_URL}/api/market/listings?pageSize=20`, // Recent market listings (default sort)
      `${BACKEND_URL}/api/market/stats`, // Market statistics
      `${BACKEND_URL}/api/services/public?pageSize=20`, // Public services
      `${BACKEND_URL}/api/recruiting/posts?pageSize=20`, // Recruiting posts
    ]

    // Add user's org/contractor data if available
    if (userSpectrumId) {
      endpoints.push(
        `${BACKEND_URL}/api/contractors/${userSpectrumId}`, // User's organization/contractor data
      )
    }

    const syncPromises = endpoints.map(async (url) => {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.clone()
          await cache.put(url, data)
          console.log(`Background sync: Cached ${url}`)
        } else if (response.status === 401) {
          // User not authenticated - skip silently
          console.debug(`Background sync: Skipping ${url} (not authenticated)`)
        } else if (response.status === 404) {
          // Resource not found - skip silently (e.g., user has no org)
          console.debug(`Background sync: Skipping ${url} (not found)`)
        }
      } catch (error) {
        console.warn(`Background sync: Failed to sync ${url}`, error)
      }
    })

    await Promise.allSettled(syncPromises)

    // Notify all clients to refresh data
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    })

    clients.forEach((client) => {
      try {
        const message: SyncMessage = {
          type: "SYNC_DATA",
          timestamp: Date.now(),
        }
        client.postMessage(message)
      } catch (error) {
        // Ignore errors if client is closed
        console.debug("Failed to post message to client:", error)
      }
    })

    console.log("Background sync: Data sync completed")
  } catch (error) {
    console.error("Background sync: Failed to sync data", error)
  }
}
