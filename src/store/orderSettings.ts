/**
 * @deprecated Import from "features/orders/api/orderSettingsApi" instead.
 * This file re-exports for backward compatibility during migration.
 */

// Ensure the API endpoints are registered (side effect)
import "../features/orders/api/orderSettingsApi"

// Re-export types
export type {
  OrderSetting,
  CreateOrderSettingRequest,
  UpdateOrderSettingRequest,
  OrderLimits,
} from "../features/orders/domain/types"

// Re-export API hooks
export {
  orderSettingsApi,
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
} from "../features/orders/api/orderSettingsApi"
