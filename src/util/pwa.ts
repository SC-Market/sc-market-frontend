/**
 * PWA utility functions for service worker registration and management
 */

import {
  leaveBugsnagBreadcrumb,
  notifyBugsnag,
} from "./monitoring/bugsnagLoader"

export interface ServiceWorkerRegistrationState {
  registration: ServiceWorkerRegistration | null
  updateAvailable: boolean
  offline: boolean
}

let registrationState: ServiceWorkerRegistrationState | null = null

// Created on first use (not at import) so this module has no browser access at
// module scope.
function getState(): ServiceWorkerRegistrationState {
  if (!registrationState) {
    registrationState = {
      registration: null,
      updateAvailable: false,
      offline: !navigator.onLine,
    }
  }
  return registrationState
}

const listeners: Array<(state: ServiceWorkerRegistrationState) => void> = []

/**
 * Result of probing the service worker script after a registration failure.
 * `ourFault` is true only when the server itself is serving a bad script (bad
 * deploy, 404, 5xx, HTML fallback instead of JS) — i.e. something we can fix.
 */
export interface SwScriptProbe {
  ourFault: boolean
  status: number | null
  contentType: string | null
  probeError?: string
}

const JS_CONTENT_TYPE = /(java|ecma)script/i

/**
 * HEAD the service worker script to tell environmental registration failures
 * (private mode, extensions, flaky network, browser quirks) apart from a script
 * we are actually serving wrong.
 *
 * A HEAD that cannot complete at all (network error) is treated as
 * environmental: the same flaky connection that broke register() breaks the
 * probe, and a broken deploy shows up as an HTTP status, not a network error.
 */
export async function probeServiceWorkerScript(
  swPath: string,
): Promise<SwScriptProbe> {
  let response: Response
  try {
    response = await fetch(swPath, { method: "HEAD", cache: "no-store" })
  } catch (err) {
    return {
      ourFault: false,
      status: null,
      contentType: null,
      probeError: err instanceof Error ? err.message : String(err),
    }
  }
  const contentType = response.headers.get("content-type")
  const ourFault =
    !response.ok || !contentType || !JS_CONTENT_TYPE.test(contentType)
  return { ourFault, status: response.status, contentType }
}

/**
 * Handle a failed register()/update() call. Never throws.
 * Environmental failures are logged + breadcrumbed; a broken script is
 * reported to Bugsnag with the probe result in metadata.
 */
export async function handleServiceWorkerFailure(
  error: unknown,
  context: string,
  swPath: string,
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error))
  try {
    const probe = await probeServiceWorkerScript(swPath)
    const metadata = {
      context,
      swPath,
      url: window.location.origin + window.location.pathname,
      errorName: err.name,
      errorMessage: err.message,
      ...probe,
    }
    if (probe.ourFault) {
      notifyBugsnag(err, metadata)
    } else {
      console.warn(
        "Service Worker registration failed (environmental, not reported):",
        err.message,
      )
      leaveBugsnagBreadcrumb("Service worker registration failed", metadata)
    }
  } catch (handlerError) {
    console.warn("Service Worker failure handling errored:", handlerError)
  }
}

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
  // In production, vite-plugin-pwa generates sw.js in the dist folder
  const swPath = import.meta.env.DEV ? "/dev-sw.js?dev-sw" : "/sw.js"

  // Log for debugging
  if (!import.meta.env.DEV) {
    console.log("Registering service worker from:", swPath)
  }

  // In dev mode, wait a bit for the service worker to be available
  const registerSW = (): Promise<ServiceWorkerRegistration | null> => {
    return navigator.serviceWorker
      .register(swPath, { scope: "/" })
      .then(
        (registration: ServiceWorkerRegistration | undefined | null) => {
          // Some browsers (private modes, extension-patched navigators) resolve
          // register() with undefined instead of a registration or a rejection.
          if (!registration) {
            console.warn(
              "Service Worker register() resolved without a registration",
            )
            leaveBugsnagBreadcrumb(
              "Service worker register() resolved without a registration",
              { swPath },
            )
            return null
          }

          console.log("✅ Service Worker registered successfully:", {
            scope: registration.scope,
            active: registration.active?.state,
            installing: registration.installing?.state,
            waiting: registration.waiting?.state,
            controller: navigator.serviceWorker.controller?.scriptURL,
          })

          // Log when service worker becomes active
          if (registration.active) {
            console.log(
              "Service Worker is active:",
              registration.active.scriptURL,
            )
          }

          // Wait for service worker to activate
          if (registration.installing) {
            registration.installing.addEventListener("statechange", () => {
              if (registration.installing?.state === "activated") {
                console.log("✅ Service Worker activated and controlling page")
              }
            })
          }

          getState().registration = registration

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
                getState().updateAvailable = true
                notifyListeners()
              }
            })
          })

          // Check for updates periodically (only in production)
          if (!import.meta.env.DEV) {
            setInterval(
              () => {
                Promise.resolve()
                  .then(() => registration.update())
                  .catch((err) =>
                    handleServiceWorkerFailure(
                      err,
                      "sw-periodic-update",
                      swPath,
                    ),
                  )
              },
              60 * 60 * 1000,
            ) // Check every hour
          }

          notifyListeners()
          return registration
        },
        async (error) => {
          // In dev mode, if registration fails, it might be because:
          // 1. The dev SW isn't ready yet
          // 2. Vite's websocket isn't connected (HMR issue)
          // 3. Other dev-specific issues
          // We'll silently fail in dev mode to avoid cluttering console
          if (import.meta.env.DEV) {
            // Only log if it's not a websocket-related error
            const isWebSocketError =
              error?.message?.includes("websocket") ||
              error?.message?.includes("ws is undefined") ||
              error?.message?.includes("WebSocket") ||
              error?.stack?.includes("websocket")

            if (!isWebSocketError) {
              console.warn(
                "Service Worker registration failed (dev mode):",
                error?.message,
              )
            }
            // Silently ignore websocket errors in dev - they're expected if HMR isn't working
          } else {
            await handleServiceWorkerFailure(error, "sw-registration", swPath)
          }
          return null
        },
      )
      .catch((error) => {
        // A bug in our own post-registration handling (not a register()
        // failure) — always worth reporting.
        notifyBugsnag(
          error instanceof Error ? error : new Error(String(error)),
          {
            context: "sw-post-registration",
            swPath,
          },
        )
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
            registerSW()
              .then(resolve)
              .catch(() => resolve(null))
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
        registrations.map((registration) =>
          registration ? registration.unregister() : false,
        ),
      ).then(() => true)
    })
    .catch((error) => {
      console.error("Service Worker unregistration failed:", error)
      return false
    })
}

/**
 * Reload page to apply service worker update.
 * Tells the waiting SW to skipWaiting, then reloads once it takes control.
 */
export function reloadForUpdate(): void {
  const waiting = getState().registration?.waiting
  if (waiting) {
    // Reload once the new SW activates and claims this client
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.location.reload()
      },
      { once: true },
    )
    waiting.postMessage({ type: "SKIP_WAITING" })
  } else {
    window.location.reload()
  }
}

/**
 * Check if update is available
 */
export function isUpdateAvailable(): boolean {
  return getState().updateAvailable
}

/**
 * Get current registration state
 */
export function getRegistrationState(): ServiceWorkerRegistrationState {
  return { ...getState() }
}

/**
 * Subscribe to registration state changes
 */
export function subscribe(
  listener: (state: ServiceWorkerRegistrationState) => void,
): () => void {
  listeners.push(listener)
  // Immediately call with current state
  listener(getState())

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
  listeners.forEach((listener) => listener(getState()))
}

/**
 * Initialize online/offline detection
 */
export function initOnlineDetection(): void {
  const updateOnlineStatus = () => {
    getState().offline = !navigator.onLine
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
    // In dev mode, unregister any existing service workers and skip registration
    // This prevents the offline page from showing during development
    if (import.meta.env.DEV) {
      if ("serviceWorker" in navigator) {
        // Unregister any existing service workers
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            registrations.forEach((registration) => {
              registration?.unregister().catch(() => {
                // Ignore errors
              })
            })
          })
          .catch(() => {
            // Ignore errors
          })
      }
      // Only initialize online detection in dev mode
      initOnlineDetection()
      return
    }

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.log("Service Workers not supported in this browser")
      // Still initialize online detection
      initOnlineDetection()
      return
    }

    // Register service worker after page loads (production only)
    // Wait a bit to ensure the service worker file is available
    const delay = 1000

    const register = () => {
      // registerServiceWorker() handles its own failures; this outer catch
      // (and the try around the call) guarantee nothing escapes to Bugsnag's
      // global unhandled-rejection handler.
      Promise.resolve()
        .then(() => registerServiceWorker())
        .then((registration) => {
          if (registration) {
            console.log("✅ PWA Service Worker active and ready")
          }
        })
        .catch((error) => {
          console.warn("Service worker registration failed:", error)
        })
    }

    if (document.readyState === "complete") {
      // Page already loaded, register after a short delay
      setTimeout(register, delay)
    } else {
      window.addEventListener("load", () => {
        setTimeout(register, delay)
      })
    }

    // Initialize online detection
    initOnlineDetection()

    // controllerchange is now only triggered via reloadForUpdate() which registers
    // a one-shot listener before telling the waiting SW to activate.
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
