/**
 * Shared API Response Types
 *
 * These types match the backend response format from:
 * sc-market-backend/src/api/routes/v1/util/response.ts
 *
 * This ensures type safety between frontend and backend.
 */

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Standardized error response from backend
 * Matches: StandardErrorResponse in backend
 */
export interface StandardErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
    validationErrors?: ValidationError[]
  }
}

/**
 * Standardized success response from backend
 * Matches: StandardSuccessResponse<T> in backend
 */
export interface StandardSuccessResponse<T> {
  data: T
}

/**
 * Union type for API responses
 * Matches: APIResponse<T> in backend
 */
export type APIResponse<T> = StandardSuccessResponse<T> | StandardErrorResponse

/**
 * Legacy error formats for backward compatibility
 * These are kept for gradual migration
 */
export interface LegacyErrorResponse<E = any> {
  error?: E
  errors?: E[]
  validationErrors?: E[]
  message?: string
}

/**
 * Response type that supports both new and legacy formats
 */
export type Response<T, E = any> = APIResponse<T> | LegacyErrorResponse<E>
