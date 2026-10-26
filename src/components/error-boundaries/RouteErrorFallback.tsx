import React from "react"
import { useRouteError, isRouteErrorResponse } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ErrorFallback } from "./ErrorFallback"
import {
  isChunkLoadError,
  reloadForNewVersion,
} from "../../util/chunkLoadError"

/**
 * Error fallback component for React Router errorElement
 *
 * This component is used as the errorElement in route definitions.
 * It extracts the error from React Router's useRouteError hook
 * and displays it using the ErrorFallback component.
 *
 * NOTE on stale-chunk recovery: failed dynamic imports of lazy route chunks
 * (old page → new deploy) go through retryDynamicImport: retried in place, then
 * a rate-limited automatic reload (assetReloadGuard). The error only stays on
 * screen once that budget is spent. Recognising the error here only changes the
 * wording to "new version, reload"; the reload is still the user's click, so
 * nothing here can loop.
 */
export function RouteErrorFallback() {
  const error = useRouteError()
  const { t } = useTranslation()

  const navigate = () => {
    // Reset by navigating to the same route
    window.location.reload()
  }

  if (isChunkLoadError(error)) {
    return (
      <ErrorFallback
        error={error instanceof Error ? error : new Error(String(error))}
        resetErrorBoundary={() => reloadForNewVersion()}
        isRouteError={true}
        showDetails={import.meta.env.DEV}
        title={t("frontendError.newVersionTitle", {
          defaultValue: "A new version of SC Market is available",
        })}
        message={t("frontendError.newVersionMessage", {
          defaultValue:
            "The site was updated while this page was open. Reload to get the latest version.",
        })}
      />
    )
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
