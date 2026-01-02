/**
 * Shared API Response Utilities
 * 
 * Utilities for handling API responses that work with both
 * the new standardized format and legacy formats for backward compatibility.
 */

import type {
  APIResponse,
  Response,
  StandardErrorResponse,
  StandardSuccessResponse,
} from "./api-types"

/**
 * Unwrap API response, extracting data from success responses
 * 
 * Supports both new standardized format and legacy formats for backward compatibility.
 * 
 * @param response - API response (new or legacy format)
 * @returns The data from the response, or the response itself if no data property exists
 * 
 * @example
 * ```ts
 * const data = unwrapResponse(response) // Returns T from { data: T }
 * ```
 */
export function unwrapResponse<T, E = any>(response: Response<T, E>): T {
  // New standardized format: { data: T }
  if (response && typeof response === "object" && "data" in response) {
    return (response as StandardSuccessResponse<T>).data
  }
  
  // Legacy format: check for data property
  if ((response as any).data) {
    return (response as any).data
  }
  
  // If no data property, return response as-is (might be error or legacy format)
  return response as any
}

/**
 * Extract error message from API response
 * 
 * Supports both new standardized error format and legacy formats.
 * 
 * @param response - API response (error or success)
 * @returns Error message if present, undefined otherwise
 * 
 * @example
 * ```ts
 * const errorMsg = extractErrorMessage(errorResponse)
 * if (errorMsg) {
 *   console.error(errorMsg)
 * }
 * ```
 */
export function extractErrorMessage(response: any): string | undefined {
  // New standardized format: { error: { code, message, details? } }
  if (response?.error && typeof response.error === "object" && "message" in response.error) {
    return response.error.message
  }
  
  // Legacy formats
  if (response?.error && typeof response.error === "string") {
    return response.error
  }
  if (response?.message) {
    return response.message
  }
  
  return undefined
}

/**
 * Extract error code from API response
 * 
 * Only works with new standardized error format.
 * 
 * @param response - API response (error or success)
 * @returns Error code if present, undefined otherwise
 * 
 * @example
 * ```ts
 * const errorCode = extractErrorCode(errorResponse)
 * if (errorCode === "VALIDATION_ERROR") {
 *   // Handle validation error
 * }
 * ```
 */
export function extractErrorCode(response: any): string | undefined {
  // New standardized format
  if (response?.error && typeof response.error === "object" && "code" in response.error) {
    return response.error.code
  }
  
  return undefined
}

/**
 * Check if a response is an error response
 * 
 * @param response - API response
 * @returns True if the response is an error response
 * 
 * @example
 * ```ts
 * if (isErrorResponse(response)) {
 *   const message = extractErrorMessage(response)
 *   // Handle error
 * }
 * ```
 */
export function isErrorResponse<T>(
  response: Response<T>
): response is StandardErrorResponse {
  return (
    response !== null &&
    typeof response === "object" &&
    "error" in response &&
    typeof (response as any).error === "object" &&
    "code" in (response as any).error &&
    "message" in (response as any).error
  )
}

/**
 * Check if a response is a success response
 * 
 * @param response - API response
 * @returns True if the response is a success response
 * 
 * @example
 * ```ts
 * if (isSuccessResponse(response)) {
 *   const data = unwrapResponse(response)
 *   // Use data
 * }
 * ```
 */
export function isSuccessResponse<T>(
  response: Response<T>
): response is StandardSuccessResponse<T> {
  return (
    response !== null &&
    typeof response === "object" &&
    "data" in response &&
    !("error" in response)
  )
}
