/**
 * @deprecated Import from "features/orders/api/ordersApi" instead.
 * This file re-exports for backward compatibility during migration.
 */

// Ensure the API endpoints are registered (side effect)
import "../features/orders/api/ordersApi"

// Re-export API hooks
export {
  useUnassignOrderMutation,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useApplyToOrderMutation,
  useAcceptOrderApplicantMutation,
  useAssignOrderMutation,
  useLeaveOrderReviewMutation,
  useSetOrderStatusMutation,
  useCreateOrderThreadMutation,
  useSearchOrdersQuery,
  useRequestReviewRevisionMutation,
  useUpdateOrderReviewMutation,
  useGetContractorOrderMetricsQuery,
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
} from "../features/orders/api/ordersApi"

// Re-export types that were defined here
export type {
  ContractorOrderMetrics,
  ContractorOrderData,
} from "../features/orders/domain/types"

// Re-export shared API types and utilities (legacy re-exports that existed before)
export type {
  APIResponse,
  StandardErrorResponse,
  StandardSuccessResponse,
  Response,
  ValidationError,
} from "./api-types"

export {
  unwrapResponse,
  extractErrorMessage,
  extractErrorCode,
  isErrorResponse,
  isSuccessResponse,
} from "./api-utils"
