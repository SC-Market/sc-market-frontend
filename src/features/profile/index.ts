// Ensure API endpoints are registered (side effect)
import "./api/profileApi"

// ── Domain ──

export type { SerializedError, BlocklistEntry } from "./domain/types"
export { external_resource_regex } from "./domain/constants"

// ── API hooks ──

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
} from "./api/profileApi"

// ── Components ──

export { ViewProfile } from "./components/ViewProfile"
export { ProfileSkeleton } from "./components/ProfileSkeleton"
export { ProfileBannerArea } from "./components/ProfileBannerArea"
export { ProfileStoreView, OrgStoreView } from "./components/ProfileStoreView"
export {
  ProfileServicesView,
  OrgServicesView,
} from "./components/ProfileServicesView"
export { ProfileAboutTab } from "./components/ProfileAboutTab"
export {
  LightBannerContainer,
  DarkBannerContainer,
} from "./components/BannerContainers"
