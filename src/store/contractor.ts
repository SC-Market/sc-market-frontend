/**
 * @deprecated Import from "features/contractor/api/contractorApi" instead.
 * This file re-exports for backward compatibility during migration.
 */

// Ensure the API endpoints are registered (side effect)
import "../features/contractor/api/contractorApi"

// Re-export everything
export {
  contractorsApi,
  useGetContractorInvitesQuery,
  useGetContractorWebhooksQuery,
  useGetContractorReviewsQuery,
  useGetContractorBySpectrumIDQuery,
  useRefetchContractorDetailsMutation,
  useGetContractorCustomersQuery,
  useGetContractorMembersQuery,
  useCheckContractorMembershipQuery,
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
} from "../features/contractor/api/contractorApi"
