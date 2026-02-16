import React, { ReactNode } from "react"
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"
import { getBugsnagInstance } from "../../util/monitoring/bugsnagLoader"

export interface ComponentErrorBoundaryProps extends Omit<
  ErrorBoundaryProps,
  "fallback"
> {
  /**
   * Children to render
   */
  children: ReactNode
  /**
   * Component name for logging/debugging
   */
  componentName?: string
  /**
   * Custom fallback component
   */
  fallback?: ErrorBoundaryProps["fallback"]
  /**
   * Whether to show home button (defaults to false for component-level errors)
   */
  showHomeButton?: boolean
  /**
   * Custom message
   */
  message?: string
}

/**
 * Error Boundary for component-level errors
 *
 * Catches errors within a specific component. Useful for isolating errors
 * in critical components without affecting the rest of the application.
 *
 * @example
 * ```tsx
 * <ComponentErrorBoundary componentName="OrderForm">
 *   <OrderForm />
 * </ComponentErrorBoundary>
 * ```
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  fallback,
  showHomeButton = false,
  message,
  onError,
  ...props
}: ComponentErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log component-specific error
    if (import.meta.env.DEV) {
      console.error(
        `[ComponentErrorBoundary${componentName ? `:${componentName}` : ""}] Error:`,
        error,
        errorInfo,
      )
    }

    // Report to Bugsnag
    const bugsnag = getBugsnagInstance()
    if (bugsnag) {
      bugsnag.notify(error, (event: any) => {
        event.context = componentName || "Component"
        event.addMetadata("errorBoundary", {
          type: "component",
          componentName,
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
      showHomeButton={showHomeButton}
      message={
        message ||
        (componentName
          ? `The ${componentName} component encountered an error. You can try again.`
          : "This component encountered an error. You can try again.")
      }
    />
  )

  return (
    <ErrorBoundary
      {...props}
      name={componentName ? `Component:${componentName}` : "Component"}
      fallback={fallback || defaultFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}
