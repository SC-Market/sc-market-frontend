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
let bugsnagInstance: any = null
let bugsnagReactPlugin: any = null

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
        const [Bugsnag, BugsnagPluginReact, BugsnagPerformance] =
          await Promise.all([
            import("@bugsnag/js"),
            import("@bugsnag/plugin-react"),
            import("@bugsnag/browser-performance"),
          ])

        // Initialize Bugsnag
        bugsnagInstance = Bugsnag.default.start({
          apiKey,
          plugins: [new BugsnagPluginReact.default()],
        })

        // Initialize Bugsnag Performance
        BugsnagPerformance.default.start({
          apiKey,
        })

        bugsnagReactPlugin = bugsnagInstance.getPlugin("react")
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
): React.ComponentType<any> {
  if (bugsnagReactPlugin) {
    return bugsnagReactPlugin.createErrorBoundary(ReactInstance)
  }

  // Fallback error boundary if Bugsnag fails to load
  return class FallbackErrorBoundary extends ReactInstance.Component<
    { children: React.ReactNode },
    { hasError: boolean }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props)
      this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
      return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.error("Error caught by fallback boundary:", error, errorInfo)
      }
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
  metadata?: Record<string, any>,
): void {
  if (bugsnagInstance) {
    bugsnagInstance.notify(error, (event: any) => {
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
