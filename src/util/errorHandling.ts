import { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import { SerializedError } from "@reduxjs/toolkit"

/**
 * Determines if an error should result in a 404 redirect
 * 400 (Bad Request) and 404 (Not Found) errors should redirect to 404
 */
export function shouldRedirectTo404(
  error: FetchBaseQueryError | SerializedError | undefined,
): boolean {
  if (!error || typeof error !== "object") return false

  // Check if it's a FetchBaseQueryError with status
  if ("status" in error) {
    return error.status === 400 || error.status === 404
  }

  // If it's not a FetchBaseQueryError, don't redirect to 404
  return false
}

/**
 * Determines if an error should show the error page
 * Any error that's not a 400/404 should show the error page
 */
export function shouldShowErrorPage(
  error: FetchBaseQueryError | SerializedError | undefined,
): boolean {
  if (!error) return false
  if (typeof error !== "object") return true

  // Check if it's a FetchBaseQueryError with status
  if ("status" in error) {
    return error.status !== 400 && error.status !== 404
  }

  // If it's not a FetchBaseQueryError, show error page
  return true
}

/**
 * Gets the error status code from a FetchBaseQueryError
 */
export function getErrorStatus(
  error: FetchBaseQueryError | SerializedError | undefined,
): number | undefined {
  if (!error || !("status" in error)) return undefined
  return error.status as number
}

/**
 * Gets the error message from a FetchBaseQueryError
 */
export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string | undefined {
  if (!error) return undefined

  if ("status" in error) {
    if (typeof error.data === "string") {
      return error.data
    }
    if (
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data
    ) {
      return (error.data as any).message
    }
  }

  // Handle SerializedError type
  if ("error" in error && error.error) {
    return error.error
  }

  return "An error occurred"
}
