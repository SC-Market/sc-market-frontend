import React, { ReactNode } from "react"
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"
import { getBugsnagInstance } from "../../util/monitoring/bugsnagLoader"

export interface FeatureErrorBoundaryProps extends Omit<
  ErrorBoundaryProps,
  "fallback"
> {
  /**
   * Children to render
   */
  children: ReactNode
  /**
   * Feature name for logging/debugging
   */
  featureName: string
  /**
   * Custom fallback component
   */
  fallback?: ErrorBoundaryProps["fallback"]
}

/**
 * Error Boundary for feature-level errors
 *
 * Catches errors within a specific feature (e.g., market, orders, contracts).
 * Provides feature-specific error handling and logging.
 *
 * @example
 * ```tsx
 * <FeatureErrorBoundary featureName="Market">
 *   <MarketListings />
 *   <MarketFilters />
 * </FeatureErrorBoundary>
 * ```
 */
export function FeatureErrorBoundary({
  children,
  featureName,
  fallback,
  onError,
  ...props
}: FeatureErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log feature-specific error
    if (import.meta.env.DEV) {
      console.error(
        `[FeatureErrorBoundary:${featureName}] Error:`,
        error,
        errorInfo,
      )
    }

    // Report to Bugsnag
    const bugsnag = getBugsnagInstance()
    if (bugsnag) {
      bugsnag.notify(error, (event: any) => {
        event.context = featureName
        event.addMetadata("errorBoundary", {
          type: "feature",
          featureName,
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
      isRouteError={false}
      showDetails={import.meta.env.DEV}
      title={`Error in ${featureName}`}
      message={`The ${featureName} feature encountered an error. You can try again or continue using other parts of the application.`}
    />
  )

  return (
    <ErrorBoundary
      {...props}
      name={`Feature:${featureName}`}
      fallback={fallback || defaultFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}
