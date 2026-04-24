// Ensure API endpoints are registered (side effect)
import "./api/contractorApi"

// ── Domain ──

export type {
  ContractorKindIconKey,
  Rating,
  Contractor,
  MinimalContractor,
  UserContractorState,
  ContractorRole,
  ContractorMember,
  ContractorInviteCode,
  ContractorInvite,
  OrderWebhook,
  DiscordSettings,
  AuditLogEntry,
  AuditLogsResponse,
} from "./domain/types"

export {
  has_permission,
  min_position,
  getMemberPosition,
  self_member_role_removal_forbidden,
  min_role,
} from "./domain/permissions"

// ── API hooks ──

export {
  contractorsApi,
  useGetContractorBySpectrumIDQuery,
  useGetContractorMembersQuery,
  useCheckContractorMembershipQuery,
  useGetContractorInvitesQuery,
  useGetContractorWebhooksQuery,
  useGetContractorReviewsQuery,
  useGetContractorCustomersQuery,
  useRefetchContractorDetailsMutation,
  useCreateContractorRoleMutation,
  useUpdateContractorRoleMutation,
  useDeleteContractorRoleMutation,
  useApplyContractorRoleMutation,
  useRemoveContractorRoleMutation,
  useKickContractorMemberMutation,
  useTransferOwnershipMutation,
  useAdminExpressVerifyContractorMutation,
  useRegisterContractorMutation,
  useGetDiscordSettingsQuery,
  useUseOfficialDiscordSettingsMutation,
  useContractorLinkMutation,
  useInviteContractorMembersMutation,
  useAcceptContractorInviteMutation,
  useAcceptContractorInviteCodeMutation,
  useGetContractorInviteCodeQuery,
  useDeclineContractorInviteMutation,
  useUpdateContractorMutation,
  useContractorUploadAvatarMutation,
  useContractorUploadBannerMutation,
  useCreateContractorWebhookMutation,
  useDeleteContractorWebhookMutation,
  useArchiveContractorMutation,
  useCreateContractorInviteMutation,
  useDeleteContractorInviteMutation,
  useGetContractorsQuery,
  useSearchContractorsQuery,
  useLeaveContractorMutation,
  useGetOrgBlocklistQuery,
  useBlockUserForOrgMutation,
  useUnblockUserForOrgMutation,
  useGetContractorAuditLogsQuery,
  useGetAdminAuditLogsQuery,
  useGetContractorLanguagesQuery,
  useSetContractorLanguagesMutation,
} from "./api/contractorApi"

// ── Hooks ──

export { useOrgTab } from "./hooks/useOrgTab"
export { usePageContractors } from "./hooks/usePageContractors"
export { usePageOrg } from "./hooks/usePageOrg"
export { usePageOrgManage } from "./hooks/usePageOrgManage"

// ── Components ──

export { OrgBannerArea } from "./components/OrgBannerArea"
export { OrgHeader } from "./components/OrgHeader"
export { OrgInfo, OrgInfoSkeleton } from "./components/OrgInfo"
export { OrgMetaTags } from "./components/OrgMetaTags"
export { OrgTabContent } from "./components/OrgTabContent"
export { OrgTabs } from "./components/OrgTabs"
