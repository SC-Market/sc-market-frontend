import React, { Suspense, ReactNode } from "react"
import { CircularProgress, Box } from "@mui/material"
import { PageFallback } from "../components/metadata/Page"
import { ComponentErrorBoundary } from "../components/error-boundaries"
import { ErrorFallback } from "../components/error-boundaries"

interface DynamicImportOptions {
  fallback?: ReactNode
  errorFallback?: ReactNode
}

export function createDynamicImport<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {},
) {
  const { fallback = <PageFallback />, errorFallback } = options

  const LazyComponent = React.lazy(importFn)

  return function DynamicComponent(props: React.ComponentProps<T>) {
    const defaultErrorFallback = (error: Error, errorInfo: React.ErrorInfo, reset: () => void) => (
      <ErrorFallback
        error={error}
        errorInfo={errorInfo}
        resetErrorBoundary={reset}
        isRouteError={false}
        showDetails={import.meta.env.DEV}
        showHomeButton={false}
        title="Failed to load component"
        message="The component failed to load. This may be due to a network issue or a problem with the component bundle."
      />
    )

    return (
      <ComponentErrorBoundary
        componentName="DynamicImport"
        fallback={errorFallback || defaultErrorFallback}
        onError={(error, errorInfo) => {
          console.error("Dynamic import error:", error, errorInfo)
        }}
      >
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ComponentErrorBoundary>
    )
  }
}

// Predefined loading components for different use cases
export const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" p={3}>
    <CircularProgress />
  </Box>
)

export const LoadingSkeleton = () => (
  <Box p={2}>
    <Box height={20} bgcolor="grey.300" borderRadius={1} mb={1} />
    <Box height={16} bgcolor="grey.200" borderRadius={1} mb={1} />
    <Box height={16} bgcolor="grey.200" borderRadius={1} width="80%" />
  </Box>
)
