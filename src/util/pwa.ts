/**
 * PWA utility functions for service worker registration and management
 */

export interface ServiceWorkerRegistrationState {
  registration: ServiceWorkerRegistration | null
  updateAvailable: boolean
  offline: boolean
}

let registrationState: ServiceWorkerRegistrationState = {
  registration: null,
  updateAvailable: false,
  offline: !navigator.onLine,
}

const listeners: Array<(state: ServiceWorkerRegistrationState) => void> = []

/**
 * Register service worker
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported")
    return Promise.resolve(null)
  }

  // Check if we're on a secure context (HTTPS or localhost)
  const isSecureContext =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.endsWith(".localhost") ||
    window.isSecureContext

  if (!isSecureContext) {
    console.warn(
      "Service Worker requires HTTPS or localhost. Current origin:",
      window.location.origin,
      "Protocol:",
      window.location.protocol,
      "Hostname:",
      window.location.hostname,
    )
    return Promise.resolve(null)
  }

  // In development, use the dev service worker path
  // Wait a bit for Vite to serve the dev service worker
  const swPath = import.meta.env.DEV ? "/dev-sw.js?dev-sw" : "/sw.js"

  // In dev mode, wait a bit for the service worker to be available
  const registerSW = () => {
    return navigator.serviceWorker
      .register(swPath, { scope: "/" })
      .then((registration) => {
        console.log("Service Worker registered successfully:", registration.scope)

        registrationState.registration = registration

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available
              registrationState.updateAvailable = true
              notifyListeners()
            }
          })
        })

        // Check for updates periodically (only in production)
        if (!import.meta.env.DEV) {
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check every hour
        }

        notifyListeners()
        return registration
      })
      .catch((error) => {
        // In dev mode, if registration fails, it might be because:
        // 1. The dev SW isn't ready yet
        // 2. Vite's websocket isn't connected (HMR issue)
        // 3. Other dev-specific issues
        // We'll silently fail in dev mode to avoid cluttering console
        if (import.meta.env.DEV) {
          // Only log if it's not a websocket-related error
          const isWebSocketError =
            error.message?.includes("websocket") ||
            error.message?.includes("ws is undefined") ||
            error.message?.includes("WebSocket") ||
            error.stack?.includes("websocket")

          if (!isWebSocketError) {
            console.warn(
              "Service Worker registration failed (dev mode):",
              error.message,
            )
          }
          // Silently ignore websocket errors in dev - they're expected if HMR isn't working
        } else {
          console.error("Service Worker registration failed:", error)
        }
        return null
      })
  }

  // In dev mode, wait a bit for Vite to serve the dev service worker
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      // Try immediately
      registerSW()
        .then(resolve)
        .catch(() => {
          // If it fails, wait a bit and try again
          setTimeout(() => {
            registerSW().then(resolve).catch(() => resolve(null))
          }, 1000)
        })
    })
  }

  return registerSW()
}

/**
 * Unregister service worker (useful for development)
 */
export function unregisterServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return Promise.resolve(false)
  }

  return navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      return Promise.all(
        registrations.map((registration) => registration.unregister()),
      ).then(() => true)
    })
    .catch((error) => {
      console.error("Service Worker unregistration failed:", error)
      return false
    })
}

/**
 * Reload page to apply service worker update
 */
export function reloadForUpdate(): void {
  if (registrationState.registration?.waiting) {
    registrationState.registration.waiting.postMessage({ type: "SKIP_WAITING" })
  }
  window.location.reload()
}

/**
 * Check if update is available
 */
export function isUpdateAvailable(): boolean {
  return registrationState.updateAvailable
}

/**
 * Get current registration state
 */
export function getRegistrationState(): ServiceWorkerRegistrationState {
  return { ...registrationState }
}

/**
 * Subscribe to registration state changes
 */
export function subscribe(
  listener: (state: ServiceWorkerRegistrationState) => void,
): () => void {
  listeners.push(listener)
  // Immediately call with current state
  listener(registrationState)

  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}

/**
 * Notify all listeners of state changes
 */
function notifyListeners(): void {
  listeners.forEach((listener) => listener(registrationState))
}

/**
 * Initialize online/offline detection
 */
export function initOnlineDetection(): void {
  const updateOnlineStatus = () => {
    registrationState.offline = !navigator.onLine
    notifyListeners()
  }

  window.addEventListener("online", updateOnlineStatus)
  window.addEventListener("offline", updateOnlineStatus)

  updateOnlineStatus()
}

/**
 * Initialize PWA features
 */
export function initPWA(): void {
  if (typeof window === "undefined") return

  try {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.log("Service Workers not supported in this browser")
      // Still initialize online detection
      initOnlineDetection()
      return
    }

    // Register service worker after page loads
    // In dev mode, wait longer for Vite to set up the dev service worker
    // and for websocket connections to be established
    const delay = import.meta.env.DEV ? 3000 : 0

    if (document.readyState === "complete") {
      // Page already loaded, register immediately (with delay)
      setTimeout(() => {
        registerServiceWorker().catch((error) => {
          console.warn("Service worker registration failed (non-critical):", error)
        })
      }, delay)
    } else {
      window.addEventListener("load", () => {
        setTimeout(() => {
          registerServiceWorker().catch((error) => {
            console.warn("Service worker registration failed (non-critical):", error)
          })
        }, delay)
      })
    }

    // Initialize online detection
    initOnlineDetection()

    // Listen for service worker controller changes (only in production)
    if (!import.meta.env.DEV) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed - reloading page")
        window.location.reload()
      })
    }
  } catch (error) {
    console.warn("PWA initialization error (non-critical):", error)
    // Still try to initialize online detection even if SW fails
    try {
      initOnlineDetection()
    } catch (e) {
      // Ignore online detection errors too
    }
  }
}
