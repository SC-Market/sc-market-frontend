/**
 * @deprecated Import from "features/profile/api/profileApi" instead.
 * This file re-exports for backward compatibility during migration.
 */

// Ensure the API endpoints are registered (side effect)
import "../features/profile/api/profileApi"

// Re-export types
export type { SerializedError, BlocklistEntry } from "../features/profile/domain/types"

// Re-export API and hooks
export {
  userApi,
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
  useLogoutMutation,
  useGetUserOrderReviews,
  useGetUserWebhooks,
  useSearchUsersQuery,
  useGetAuthenticatorIdentifier,
  useActivateAccountLink,
  useProfileCreateWebhook,
  useProfileDeleteWebhook,
  useProfileUpdateLocale,
  useUpdateProfile,
  useProfileUpdateSettingsMutation,
  useProfileUpdateAvailabilityMutation,
  useProfileGetAvailabilityQuery,
  useProfileRefetchMutation,
  useProfileGetDiscordSettingsQuery,
  useProfileUseOfficialDiscordSettingsMutation,
  useProfileSyncHandleMutation,
  useProfileUnlinkAccountMutation,
  useProfileGetBlocklistQuery,
  useProfileBlockUserMutation,
  useProfileUnblockUserMutation,
  useProfileUploadAvatarMutation,
  useProfileUploadBannerMutation,
  useProfileGetLinksQuery,
  useProfileUnlinkProviderMutation,
  useProfileSetPrimaryProviderMutation,
  useProfileGetLanguagesQuery,
  useProfileSetLanguagesMutation,
  useProfileUpdateInGameStatusMutation,
} from "../features/profile/api/profileApi"
