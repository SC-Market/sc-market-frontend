import React, { Component, ErrorInfo, ReactNode } from "react"

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

export interface ErrorBoundaryProps {
  /**
   * Children to render when no error occurs
   */
  children: ReactNode
  /**
   * Custom fallback UI to display when an error occurs
   * If not provided, uses default ErrorFallback
   */
  fallback?:
    | ReactNode
    | ((error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode)
  /**
   * Callback fired when an error is caught
   * Useful for logging errors to external services
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /**
   * Whether to reset the error state when children change
   * Useful for route changes
   */
  resetOnChange?: boolean | string | string[]
  /**
   * Custom reset function
   * If not provided, uses internal state reset
   */
  onReset?: () => void
  /**
   * Component name for logging/debugging
   */
  name?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Base Error Boundary component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<ErrorFallback />}
 *   onError={(error, errorInfo) => console.error(error, errorInfo)}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(
        `[ErrorBoundary${this.props.name ? ` ${this.props.name}` : ""}] Error caught:`,
        error,
        errorInfo,
      )
    }

    // TODO: Log to error tracking service (e.g., Sentry)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //   })
    // }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnChange, children } = this.props

    // Reset error state when resetOnChange conditions are met
    if (resetOnChange && this.state.hasError) {
      if (resetOnChange === true) {
        // Reset on any children change
        if (prevProps.children !== children) {
          this.resetErrorBoundary()
        }
      } else if (typeof resetOnChange === "string") {
        // Reset when specific prop changes
        if (
          prevProps[resetOnChange as keyof ErrorBoundaryProps] !==
          this.props[resetOnChange as keyof ErrorBoundaryProps]
        ) {
          this.resetErrorBoundary()
        }
      } else if (Array.isArray(resetOnChange)) {
        // Reset when any of the specified props change
        const shouldReset = resetOnChange.some(
          (prop) =>
            prevProps[prop as keyof ErrorBoundaryProps] !==
            this.props[prop as keyof ErrorBoundaryProps],
        )
        if (shouldReset) {
          this.resetErrorBoundary()
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId !== null) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  resetErrorBoundary = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props

      if (fallback) {
        if (typeof fallback === "function") {
          return fallback(
            this.state.error,
            this.state.errorInfo!,
            this.resetErrorBoundary,
          )
        }
        return fallback
      }

      // Default fallback - will be replaced by ErrorFallback component
      return (
        <div style={{ padding: "1rem", textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={this.resetErrorBoundary}>Try again</button>
        </div>
      )
    }

    return this.props.children
  }
}
