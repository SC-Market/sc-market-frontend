import React, { ReactNode } from "react"
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
