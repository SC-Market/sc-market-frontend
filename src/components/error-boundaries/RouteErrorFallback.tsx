import React from "react"
import { useRouteError, isRouteErrorResponse } from "react-router-dom"
import { ErrorFallback } from "./ErrorFallback"

/**
 * Error fallback component for React Router errorElement
 *
 * This component is used as the errorElement in route definitions.
 * It extracts the error from React Router's useRouteError hook
 * and displays it using the ErrorFallback component.
 *
 * NOTE on stale-chunk recovery: we deliberately do NOT sniff error message text
 * here. Failed dynamic imports of lazy route chunks (old page → new deploy) are
 * handled generically by the `vite:preloadError` listener in index.tsx, which is
 * Vite's typed, cross-browser signal and calls preventDefault() so the error
 * never reaches this fallback. If one ever does slip through, showing the normal
 * error UI (with a reload button) is an acceptable, non-looping last resort.
 */
export function RouteErrorFallback() {
  const error = useRouteError()

  const navigate = () => {
    // Reset by navigating to the same route
    window.location.reload()
  }

  // Handle React Router error responses
  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        error={new Error(error.statusText || `Error ${error.status}`)}
        resetErrorBoundary={navigate}
        isRouteError={true}
        showDetails={import.meta.env.DEV}
        title={`Error ${error.status}`}
        message={error.data?.message || error.statusText || "An error occurred"}
      />
    )
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return (
      <ErrorFallback
        error={error}
        resetErrorBoundary={navigate}
        isRouteError={true}
        showDetails={import.meta.env.DEV}
      />
    )
  }

  // Fallback for unknown error types
  return (
    <ErrorFallback
      error={new Error(String(error))}
      resetErrorBoundary={navigate}
      isRouteError={true}
      showDetails={import.meta.env.DEV}
    />
  )
}
