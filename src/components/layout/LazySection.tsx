import React, { Component, ReactElement, Suspense } from "react"
import { Grid, GridProps } from "@mui/material"

interface LazySectionProps {
  // Lazy-loaded component
  component: React.LazyExoticComponent<React.ComponentType<any>>

  // Props to pass to the component
  componentProps?: Record<string, any>

  // Loading state
  skeleton: React.ComponentType

  // Error handling
  errorFallback?: React.ComponentType<{ error: Error }>

  // Grid configuration
  gridProps?: GridProps
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component for isolating errors in lazy-loaded sections
 */
class SectionErrorBoundary extends Component<
  {
    fallback?: React.ComponentType<{ error: Error }>
    children: React.ReactNode
  },
  ErrorBoundaryState
> {
  constructor(props: {
    fallback?: React.ComponentType<{ error: Error }>
    children: React.ReactNode
  }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log errors to console for debugging
    console.error("Section error:", error, errorInfo)
    // TODO: Send to error tracking service (e.g., Sentry, Bugsnag)
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback
      if (Fallback) {
        return <Fallback error={this.state.error} />
      }
      // Default error fallback
      return (
        <Grid item xs={12}>
          <div style={{ padding: "16px", color: "red" }}>
            An error occurred while loading this section.
          </div>
        </Grid>
      )
    }
    return this.props.children
  }
}

/**
 * LazySection wrapper component for lazy loading content sections with error boundaries
 *
 * This component:
 * - Wraps lazy components in React.Suspense
 * - Displays skeleton during loading
 * - Includes error boundary for error isolation
 * - Applies grid props to container
 * - Logs errors to console
 *
 * @example
 * ```tsx
 * <LazySection
 *   component={lazy(() => import('./MySection'))}
 *   componentProps={{ data: myData }}
 *   skeleton={MySectionSkeleton}
 *   gridProps={{ xs: 12, md: 6 }}
 * />
 * ```
 */
export function LazySection(props: LazySectionProps): ReactElement {
  const {
    component: LazyComponent,
    componentProps = {},
    skeleton: Skeleton,
    errorFallback,
    gridProps = {},
  } = props

  return (
    <Grid item xs={12} {...gridProps}>
      <SectionErrorBoundary fallback={errorFallback}>
        <Suspense fallback={<Skeleton />}>
          <LazyComponent {...componentProps} />
        </Suspense>
      </SectionErrorBoundary>
    </Grid>
  )
}
