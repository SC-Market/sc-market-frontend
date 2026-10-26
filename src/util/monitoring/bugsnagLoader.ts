/**
 * Optimized Bugsnag loader that doesn't block critical rendering path.
 *
 * This module provides async initialization of Bugsnag with error boundary fallback.
 *
 * Requirements: 7.4 - Optimize Bugsnag loading
 */

import React from "react"
import { onPageInteractive } from "../scripts/delayedScriptLoader"

let bugsnagInitialized = false
import type { Client } from "@bugsnag/core"
import type { BugsnagPluginReactResult } from "@bugsnag/plugin-react"

let bugsnagInstance: Client | null = null
let performanceStarted = false

/**
 * "https://sc-market.space/a/b?x=1#y" -> "https://sc-market.space/a/b".
 * Query strings can carry OAuth codes and search terms.
 */
export function stripQuery(url: string): string {
  const cut = url.search(/[?#]/)
  return cut === -1 ? url : url.slice(0, cut)
}

/**
 * BugSnag Performance (page-load and navigation timings) is analytics, so it
 * only starts after the visitor clicks "Accept" in the cookie banner
 * (components/alert/CookieConsent.tsx). It stores no device id, sends no
 * page URL or referrer, and sends network request URLs without query strings.
 */
export async function startPerformanceMonitoring(apiKey: string) {
  if (performanceStarted || !apiKey) return
  performanceStarted = true
  try {
    const BugsnagPerformance = await import("@bugsnag/browser-performance")
    BugsnagPerformance.default.start({
      apiKey,
      generateAnonymousId: false,
      // The page URL attribute is the full href (query string included).
      sendPageAttributes: { url: false, referrer: false, title: true },
      networkRequestCallback: (requestInfo) => ({
        ...requestInfo,
        url: requestInfo.url ? stripQuery(requestInfo.url) : requestInfo.url,
      }),
    })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Bugsnag Performance failed to start (non-critical):", error)
    }
  }
}

let bugsnagReactPlugin: BugsnagPluginReactResult | null = null

/**
 * Initialize Bugsnag asynchronously after page is interactive.
 *
 * @param apiKey - Bugsnag API key
 * @returns Promise that resolves when Bugsnag is initialized
 */
export async function initializeBugsnagAsync(apiKey: string): Promise<void> {
  if (bugsnagInitialized) {
    return
  }

  return new Promise((resolve) => {
    // Delay Bugsnag initialization until page is interactive
    onPageInteractive(async () => {
      try {
        // Dynamically import Bugsnag modules
        const [Bugsnag, BugsnagPluginReact] = await Promise.all([
          import("@bugsnag/js"),
          import("@bugsnag/plugin-react"),
        ])

        // Error reporting is essential and anonymous, so it runs without
        // cookie consent and sends no user identity: no IP address, no stored
        // device id, no user id, and no query strings. Only error,
        // navigation (path only), state and manual breadcrumbs are kept:
        // request breadcrumbs carry API URLs, user (click) breadcrumbs carry
        // on-screen text, and log breadcrumbs carry console output. The
        // privacy policy (public/privacy.html) describes exactly this.
        bugsnagInstance = Bugsnag.default.start({
          apiKey,
          plugins: [new BugsnagPluginReact.default()],
          collectUserIp: false,
          generateAnonymousId: false,
          enabledBreadcrumbTypes: ["error", "manual", "navigation", "state"],
          onBreadcrumb: (breadcrumb) => {
            for (const key of ["from", "to"]) {
              const value = breadcrumb.metadata[key]
              if (typeof value === "string") {
                breadcrumb.metadata[key] = stripQuery(value)
              }
            }
          },
          onError: (event) => {
            if (event.request.url) {
              event.request.url = stripQuery(event.request.url)
            }
            if (event.context) event.context = stripQuery(event.context)
          },
        })

        bugsnagReactPlugin = bugsnagInstance.getPlugin("react") ?? null
        bugsnagInitialized = true

        resolve()
      } catch (error) {
        // Silently fail - error monitoring is not critical for app functionality
        if (import.meta.env.DEV) {
          console.warn("Bugsnag initialization failed (non-critical):", error)
        }
        resolve()
      }
    })
  })
}

/**
 * Get the Bugsnag error boundary component.
 * Returns a fallback error boundary if Bugsnag is not initialized.
 *
 * @param React - React instance
 * @returns Error boundary component
 */
export function getBugsnagErrorBoundary(
  ReactInstance: typeof React,
): React.ComponentType<{ children?: React.ReactNode }> {
  if (bugsnagReactPlugin) {
    return bugsnagReactPlugin.createErrorBoundary(ReactInstance)
  }

  // Fallback error boundary if Bugsnag fails to load
  return class FallbackErrorBoundary extends ReactInstance.Component<
    { children?: React.ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children?: React.ReactNode }) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error("[ErrorBoundary] Uncaught error:", error, errorInfo)
      // Also try to notify Bugsnag if it loaded
      notifyBugsnag(error, { componentStack: errorInfo.componentStack })
    }

    render() {
      if (this.state.hasError) {
        return ReactInstance.createElement(
          "div",
          {
            style: {
              padding: "20px",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            },
          },
          ReactInstance.createElement("h1", null, "Something went wrong"),
          ReactInstance.createElement(
            "p",
            null,
            "Please refresh the page to continue.",
          ),
          this.state.error &&
            ReactInstance.createElement(
              "pre",
              {
                style: {
                  fontSize: "12px",
                  color: "#888",
                  textAlign: "left",
                  maxWidth: "600px",
                  margin: "10px auto",
                  overflow: "auto",
                },
              },
              this.state.error.message,
            ),
          ReactInstance.createElement(
            "button",
            {
              onClick: () => window.location.reload(),
              style: {
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
              },
            },
            "Refresh Page",
          ),
        )
      }

      return this.props.children
    }
  }
}

/**
 * Get the Bugsnag instance.
 *
 * @returns Bugsnag instance or null if not initialized
 */
export function getBugsnagInstance() {
  return bugsnagInstance
}

/**
 * Check if Bugsnag is initialized.
 *
 * @returns true if Bugsnag is initialized
 */
export function isBugsnagInitialized(): boolean {
  return bugsnagInitialized
}

/**
 * Notify Bugsnag of an error (only if initialized).
 *
 * @param error - Error to report
 * @param metadata - Additional metadata
 */
export function notifyBugsnag(
  error: Error,
  metadata?: Record<string, unknown>,
): void {
  if (bugsnagInstance) {
    bugsnagInstance.notify(error, (event) => {
      if (metadata) {
        event.addMetadata("custom", metadata)
      }
    })
  } else if (import.meta.env.DEV) {
    console.error(
      "Bugsnag not initialized, error not reported:",
      error,
      metadata,
    )
  }
}

/**
 * Leave a Bugsnag breadcrumb (only if initialized). Used for expected,
 * environmental failures that should give context to later errors without
 * being reported as errors themselves.
 *
 * @param message - Breadcrumb message
 * @param metadata - Additional metadata
 */
export function leaveBugsnagBreadcrumb(
  message: string,
  metadata?: Record<string, unknown>,
): void {
  if (bugsnagInstance) {
    bugsnagInstance.leaveBreadcrumb(message, metadata, "error")
  }
}
