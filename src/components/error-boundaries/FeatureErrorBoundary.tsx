import React, { ReactNode } from "react"
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"

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

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // TODO: Log to error tracking service with feature context
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
