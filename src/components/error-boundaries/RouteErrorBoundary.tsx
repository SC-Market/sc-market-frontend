import React, { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"
import { getBugsnagInstance } from "../../util/monitoring/bugsnagLoader"

export interface RouteErrorBoundaryProps extends Omit<
  ErrorBoundaryProps,
  "fallback" | "resetOnChange"
> {
  /**
   * Children to render
   */
  children: ReactNode
  /**
   * Custom fallback component
   */
  fallback?: ErrorBoundaryProps["fallback"]
  /**
   * Whether to reset error boundary on route change
   * Defaults to true
   */
  resetOnRouteChange?: boolean
}

/**
 * Error Boundary for route-level errors
 *
 * Automatically resets when the route changes, making it ideal for wrapping
 * route components. Provides route-specific error handling.
 *
 * @example
 * ```tsx
 * <RouteErrorBoundary>
 *   <Route path="/market" element={<MarketPage />} />
 * </RouteErrorBoundary>
 * ```
 */
export function RouteErrorBoundary({
  children,
  fallback,
  resetOnRouteChange = true,
  onError,
  ...props
}: RouteErrorBoundaryProps) {
  const location = useLocation()

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log route-specific error
    if (import.meta.env.DEV) {
      console.error(
        `[RouteErrorBoundary] Error on route ${location.pathname}:`,
        error,
        errorInfo,
      )
    }

    // Report to Bugsnag
    const bugsnag = getBugsnagInstance()
    if (bugsnag) {
      bugsnag.notify(error, (event: any) => {
        event.context = `Route: ${location.pathname}`
        event.addMetadata("errorBoundary", {
          type: "route",
          pathname: location.pathname,
          search: location.search,
          componentStack: errorInfo.componentStack,
        })
      })
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }
  }

  const defaultFallback = (
    error: Error,
    errorInfo: React.ErrorInfo,
    reset: () => void,
  ) => (
    <ErrorFallback
      error={error}
      errorInfo={errorInfo}
      resetErrorBoundary={reset}
      isRouteError={true}
      showDetails={import.meta.env.DEV}
    />
  )

  return (
    <ErrorBoundary
      {...props}
      name={`Route:${location.pathname}`}
      fallback={fallback || defaultFallback}
      resetOnChange={resetOnRouteChange ? location.pathname : undefined}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}
