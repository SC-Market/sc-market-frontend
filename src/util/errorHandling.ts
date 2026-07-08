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

  if ("status" in error) {
    return error.status === 400 || error.status === 404
  }

  return false
}

/**
 * Determines if an error is a 403 Forbidden
 */
export function isForbiddenError(
  error: FetchBaseQueryError | SerializedError | undefined,
): boolean {
  if (!error || typeof error !== "object") return false
  if ("status" in error) {
    return error.status === 403
  }
  return false
}

/**
 * Determines if an error should show the error page
 * Any error that's not a 400/403/404 should show the error page
 */
export function shouldShowErrorPage(
  error: FetchBaseQueryError | SerializedError | undefined,
): boolean {
  if (!error) return false
  if (typeof error !== "object") return true

  if ("status" in error) {
    return error.status !== 400 && error.status !== 403 && error.status !== 404
  }

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
    if (error.data && typeof error.data === "object") {
      const data = error.data as Record<string, unknown>
      if (data.error && typeof data.error === "object" && "message" in (data.error as object)) {
        return (data.error as { message: string }).message
      }
      if ("message" in data) {
        return data.message as string
      }
    }
  }

  // Handle SerializedError type
  if ("error" in error && error.error) {
    return error.error
  }

  return "An error occurred"
}
