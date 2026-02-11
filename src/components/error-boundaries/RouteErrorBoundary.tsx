import React, { ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { ErrorBoundary, ErrorBoundaryProps } from "./ErrorBoundary"
import { ErrorFallback } from "./ErrorFallback"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
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

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // TODO: Log to error tracking service with route context
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
