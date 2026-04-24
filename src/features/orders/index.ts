// Ensure API endpoints are registered (side effects)
import "./api/ordersApi"
import "./api/orderSettingsApi"

// ── Domain ──

export type {
  OrderStatus,
  OrderKind,
  PaymentType,
  Order,
  OrderAvailability,
  OrderApplicant,
  OrderComment,
  OrderReview,
  OrderBody,
  ServiceBody,
  Service,
  OrderStub,
  OrderSearchSortMethod,
  OrderSearchStatus,
  OrderSearchQuery,
  OrderTrendDatapoint,
  OrderAnalytics,
  ContractorOrderMetrics,
  ContractorOrderData,
  OrderSetting,
  CreateOrderSettingRequest,
  UpdateOrderSettingRequest,
  OrderLimits,
} from "./domain/types"

export { statusColors, statusNames } from "./domain/constants"
export { romanize, makeOrderTrend, formatCurrency } from "./domain/formatters"

// ── API hooks ──

export {
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useCreateOrderThreadMutation,
  useApplyToOrderMutation,
  useAcceptOrderApplicantMutation,
  useAssignOrderMutation,
  useUnassignOrderMutation,
  useLeaveOrderReviewMutation,
  useSetOrderStatusMutation,
  useSearchOrdersQuery,
  useRequestReviewRevisionMutation,
  useUpdateOrderReviewMutation,
  useGetContractorOrderMetricsQuery,
  useGetContractorOrderDataQuery,
  useGetUserOrderDataQuery,
} from "./api/ordersApi"

export {
  useGetUserOrderSettingsQuery,
  useCreateUserOrderSettingMutation,
  useUpdateUserOrderSettingMutation,
  useDeleteUserOrderSettingMutation,
  useGetContractorOrderSettingsQuery,
  useCreateContractorOrderSettingMutation,
  useUpdateContractorOrderSettingMutation,
  useDeleteContractorOrderSettingMutation,
  useCheckContractorAvailabilityRequirementQuery,
  useCheckUserAvailabilityRequirementQuery,
  useCheckContractorOrderLimitsQuery,
  useCheckUserOrderLimitsQuery,
} from "./api/orderSettingsApi"

// ── Hooks ──

export { useOrderMetrics } from "./hooks/useOrderMetrics"
export { useOrgOrderTrend, useUserOrderTrend } from "./hooks/useOrderTrend"
export { useOrderReview } from "./hooks/useOrderReview"
export { useMemberAssign } from "./hooks/useMemberAssign"
export { useAcceptApplicant, useApplyToOrder } from "./hooks/useOrderApplications"
export { useOrderSearch } from "./hooks/useOrderSearch"
export { usePendingOrderCount } from "./hooks/usePendingOrderCount"
export { CurrentOrderContext, useCurrentOrder } from "./hooks/CurrentOrderContext"
