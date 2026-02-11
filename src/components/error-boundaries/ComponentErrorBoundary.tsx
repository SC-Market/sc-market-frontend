import React, { ReactNode } from "react"
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"

import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';

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

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // TODO: Log to error tracking service with component context
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
