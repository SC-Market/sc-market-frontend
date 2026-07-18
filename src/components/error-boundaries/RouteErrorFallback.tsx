import React from "react"
import { useRouteError, isRouteErrorResponse } from "react-router-dom"
import { ErrorFallback } from "./ErrorFallback"
import { tryEmergencyReload } from "../../util/assetReloadGuard"

/**
 * Detects a failed dynamic import of a lazy route chunk (as opposed to a real
 * application error). After a deploy, an old page still references old chunk
 * hashes; navigating to a lazy route then rejects with one of these messages.
 * We treat that as "stale build" and auto-recover, rather than showing an error.
 */
function isStaleChunkError(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : String(error ?? "")
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) || // Safari
    /'?text\/html'? is not a valid JavaScript MIME type/i.test(msg) || // Chrome: SPA fallback served HTML for a gone chunk
    /NS_ERROR_CORRUPTED_CONTENT/i.test(msg) || // Firefox: HTML served for a gone chunk (nosniff)
    /expected a JavaScript.*module.*but.*MIME type/i.test(msg) // Firefox alt wording
  )
}

/**
 * Error fallback component for React Router errorElement
 *
 * This component is used as the errorElement in route definitions.
 * It extracts the error from React Router's useRouteError hook
 * and displays it using the ErrorFallback component.
 */
export function RouteErrorFallback() {
  const error = useRouteError()

  // Stale-chunk navigation (old page → new deploy): auto-recover with a
  // rate-limited reload (assetReloadGuard caps this at 2 per 120s, so a
  // genuinely-broken chunk can't loop). This turns "click a link, see an error
  // page" into "click a link, page silently refreshes to the new build".
  if (isStaleChunkError(error)) {
    const reloading = tryEmergencyReload()
    if (reloading) {
      return null // blank for the instant before the reload takes over
    }
    // Budget exhausted — fall through to the normal error UI instead of looping.
  }

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
