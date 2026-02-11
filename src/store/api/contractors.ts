import { generatedApi as api } from "../generatedApi"
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MaterialLink from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import PeopleAltRounded from '@mui/icons-material/PeopleAltRounded';
import PrivacyTipRounded from '@mui/icons-material/PrivacyTipRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import Block from '@mui/icons-material/Block';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidRounded from '@mui/icons-material/PhoneAndroidRounded';
import NoteAddRounded from '@mui/icons-material/NoteAddRounded';
export const addTagTypes = [
  "Contractor",
  "Contractors",
  "ContractorInvite",
  "Contractor Invites",
  "Contractor Members",
  "Order Reviews",
  "Contractor Roles",
  "OrderWebhook",
  "Contractor Webhooks",
  "Discord",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      authLink: build.mutation<AuthLinkApiResponse, AuthLinkApiArg>({
        query: (queryArg) => ({
          url: `/api/contractors/auth/link`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      createContractor: build.mutation<
        CreateContractorApiResponse,
        CreateContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/`,
          method: "POST",
          body: queryArg.contractorBody,
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      searchContractors: build.query<
        SearchContractorsApiResponse,
        SearchContractorsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/search/${queryArg.query}`,
        }),
        providesTags: ["Contractor", "Contractors"],
      }),
      getInviteCode: build.query<GetInviteCodeApiResponse, GetInviteCodeApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/contractors/invites/${queryArg.inviteId}`,
          }),
          providesTags: ["ContractorInvite", "Contractor Invites"],
        },
      ),
      acceptCodeInvite: build.mutation<
        AcceptCodeInviteApiResponse,
        AcceptCodeInviteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/invites/${queryArg.inviteId}/accept`,
          method: "POST",
        }),
        invalidatesTags: ["ContractorInvite", "Contractor Invites"],
      }),
      searchContractorMembers: build.query<
        SearchContractorMembersApiResponse,
        SearchContractorMembersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/members/search/${queryArg.query}`,
        }),
        providesTags: ["Contractor", "Contractors", "Contractor Members"],
      }),
      getContractorMembersCsv: build.query<
        GetContractorMembersCsvApiResponse,
        GetContractorMembersCsvApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/members/csv`,
        }),
        providesTags: ["Contractor", "Contractors", "Contractor Members"],
      }),
      getContractorCustomers: build.query<
        GetContractorCustomersApiResponse,
        GetContractorCustomersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/customers`,
        }),
        providesTags: ["Contractor", "Contractors"],
      }),
      getContractorReviews: build.query<
        GetContractorReviewsApiResponse,
        GetContractorReviewsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/reviews`,
        }),
        providesTags: ["Order Reviews"],
      }),
      getContractorAuditLogs: build.query<
        GetContractorAuditLogsApiResponse,
        GetContractorAuditLogsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/audit-logs`,
          params: {
            page: queryArg.page,
            page_size: queryArg.pageSize,
            action: queryArg.action,
            actor_id: queryArg.actorId,
            start_date: queryArg.startDate,
            end_date: queryArg.endDate,
          },
        }),
        providesTags: ["Contractor", "Contractors"],
      }),
      getContractor: build.query<GetContractorApiResponse, GetContractorApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/contractors/${queryArg.spectrumId}`,
          }),
          providesTags: ["Contractor", "Contractors"],
        },
      ),
      archiveContractor: build.mutation<
        ArchiveContractorApiResponse,
        ArchiveContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}`,
          method: "DELETE",
          body: queryArg.body,
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      updateContractor: build.mutation<
        UpdateContractorApiResponse,
        UpdateContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}`,
          method: "PUT",
          body: queryArg.contractorUpdateBody,
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      checkContractorMembership: build.query<
        CheckContractorMembershipApiResponse,
        CheckContractorMembershipApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/members/${queryArg.username}`,
        }),
        providesTags: ["Contractor", "Contractors"],
      }),
      kickContractorMember: build.mutation<
        KickContractorMemberApiResponse,
        KickContractorMemberApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/members/${queryArg.username}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Members"],
      }),
      getContractorMembers: build.query<
        GetContractorMembersApiResponse,
        GetContractorMembersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/members`,
          params: {
            page: queryArg.page,
            page_size: queryArg.pageSize,
            search: queryArg.search,
            sort: queryArg.sort,
            role_filter: queryArg.roleFilter,
          },
        }),
        providesTags: ["Contractor", "Contractors", "Contractor Members"],
      }),
      contractorInviteMembers: build.mutation<
        ContractorInviteMembersApiResponse,
        ContractorInviteMembersApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/members`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Members"],
      }),
      createContractorRole: build.mutation<
        CreateContractorRoleApiResponse,
        CreateContractorRoleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/roles`,
          method: "POST",
          body: queryArg.contractorRoleBody,
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Roles"],
      }),
      updateContractorRole: build.mutation<
        UpdateContractorRoleApiResponse,
        UpdateContractorRoleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/roles/${queryArg.roleId}`,
          method: "PUT",
          body: queryArg.contractorRoleUpdateBody,
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Roles"],
      }),
      deleteContractorRole: build.mutation<
        DeleteContractorRoleApiResponse,
        DeleteContractorRoleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/roles/${queryArg.roleId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Roles"],
      }),
      giveContractorRole: build.mutation<
        GiveContractorRoleApiResponse,
        GiveContractorRoleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/roles/${queryArg.roleId}/members/${queryArg.username}`,
          method: "POST",
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Roles"],
      }),
      removeContractorRole: build.mutation<
        RemoveContractorRoleApiResponse,
        RemoveContractorRoleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/roles/${queryArg.roleId}/members/${queryArg.username}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Contractor", "Contractors", "Contractor Roles"],
      }),
      transferOwnership: build.mutation<
        TransferOwnershipApiResponse,
        TransferOwnershipApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/transfer-ownership`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      uploadOrganizationAvatar: build.mutation<
        UploadOrganizationAvatarApiResponse,
        UploadOrganizationAvatarApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/avatar`,
          method: "POST",
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      uploadOrganizationBanner: build.mutation<
        UploadOrganizationBannerApiResponse,
        UploadOrganizationBannerApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/banner`,
          method: "POST",
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      createContractorWebhook: build.mutation<
        CreateContractorWebhookApiResponse,
        CreateContractorWebhookApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/webhooks`,
          method: "POST",
          body: queryArg.orderWebhook,
        }),
        invalidatesTags: ["OrderWebhook", "Contractor Webhooks"],
      }),
      getContractorWebhooks: build.query<
        GetContractorWebhooksApiResponse,
        GetContractorWebhooksApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/webhooks`,
        }),
        providesTags: ["OrderWebhook", "Contractor Webhooks"],
      }),
      deleteContractorWebhook: build.mutation<
        DeleteContractorWebhookApiResponse,
        DeleteContractorWebhookApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/webhooks/${queryArg.webhookId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["OrderWebhook", "Contractor Webhooks"],
      }),
      createContractorInvite: build.mutation<
        CreateContractorInviteApiResponse,
        CreateContractorInviteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/invites`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["ContractorInvite", "Contractor Invites"],
      }),
      getContractorInvites: build.query<
        GetContractorInvitesApiResponse,
        GetContractorInvitesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/invites`,
        }),
        providesTags: ["ContractorInvite", "Contractor Invites"],
      }),
      getContractorInviteById: build.mutation<
        GetContractorInviteByIdApiResponse,
        GetContractorInviteByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/invites/${queryArg.inviteId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["ContractorInvite", "Contractor Invites"],
      }),
      acceptContractorInvite: build.mutation<
        AcceptContractorInviteApiResponse,
        AcceptContractorInviteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/accept`,
          method: "POST",
        }),
        invalidatesTags: ["ContractorInvite", "Contractor Invites"],
      }),
      declineContractorInvite: build.mutation<
        DeclineContractorInviteApiResponse,
        DeclineContractorInviteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/decline`,
          method: "POST",
        }),
        invalidatesTags: ["ContractorInvite", "Contractor Invites"],
      }),
      getContractors: build.query<
        GetContractorsApiResponse,
        GetContractorsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors`,
          params: {
            index: queryArg.index,
            pageSize: queryArg.pageSize,
            sorting: queryArg.sorting,
            reverseSort: queryArg.reverseSort,
            query: queryArg.query,
            fields: queryArg.fields,
            rating: queryArg.rating,
          },
        }),
        providesTags: ["Contractor", "Contractors"],
      }),
      getContractorDiscordSettings: build.query<
        GetContractorDiscordSettingsApiResponse,
        GetContractorDiscordSettingsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/settings/discord`,
        }),
        providesTags: ["Contractor", "Contractors", "Discord"],
      }),
      useOfficialDiscordContractor: build.mutation<
        UseOfficialDiscordContractorApiResponse,
        UseOfficialDiscordContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/settings/discord/use_official`,
          method: "POST",
        }),
        invalidatesTags: ["OrderWebhook", "Contractor Webhooks", "Discord"],
      }),
      leaveContractor: build.mutation<
        LeaveContractorApiResponse,
        LeaveContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/leave`,
          method: "POST",
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      getOrgBlocklist: build.query<
        GetOrgBlocklistApiResponse,
        GetOrgBlocklistApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/blocklist`,
        }),
        providesTags: ["Contractor", "Contractors"],
      }),
      blockUserForOrg: build.mutation<
        BlockUserForOrgApiResponse,
        BlockUserForOrgApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/blocklist/block`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
      unblockUserForOrg: build.mutation<
        UnblockUserForOrgApiResponse,
        UnblockUserForOrgApiArg
      >({
        query: (queryArg) => ({
          url: `/api/contractors/${queryArg.spectrumId}/blocklist/unblock/${queryArg.username}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Contractor", "Contractors"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as contractorsApi }
export type AuthLinkApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type AuthLinkApiArg = {
  body: {
    content?: string
  }
}
export type CreateContractorApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type CreateContractorApiArg = {
  contractorBody: ContractorBody
}
export type SearchContractorsApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: MinimalContractor[]
  }
export type SearchContractorsApiArg = {
  query: string
}
export type GetInviteCodeApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: {
      spectrum_id?: string
    }
  }
export type GetInviteCodeApiArg = {
  inviteId: string
}
export type AcceptCodeInviteApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type AcceptCodeInviteApiArg = {
  inviteId: string
}
export type SearchContractorMembersApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: MinimalUser[]
  }
export type SearchContractorMembersApiArg = {
  spectrumId: string
  query: string
}
export type GetContractorMembersCsvApiResponse =
  /** status 200 OK - Successful request with response body */ Blob
export type GetContractorMembersCsvApiArg = {
  spectrumId: string
}
export type GetContractorCustomersApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: MinimalUser[]
  }
export type GetContractorCustomersApiArg = {
  spectrumId: string
}
export type GetContractorReviewsApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: {
      content: string
      rating: number
      role: "contractor" | "customer"
      contractor_author?: MinimalContractor
      user_author?: MinimalUser
    }[]
  }
export type GetContractorReviewsApiArg = {
  spectrumId: string
}
export type GetContractorAuditLogsApiResponse =
  /** status 200 Audit logs retrieved successfully */ {
    data: AuditLogsResponse
  }
export type GetContractorAuditLogsApiArg = {
  /** Contractor spectrum ID */
  spectrumId: string
  /** Page number (1-based) */
  page?: number
  /** Number of audit log entries per page */
  pageSize?: number
  /** Filter by action type (e.g., 'org.archived') */
  action?: string
  /** Filter by actor user ID */
  actorId?: string
  /** Filter logs after this date (ISO 8601 format) */
  startDate?: string
  /** Filter logs before this date (ISO 8601 format) */
  endDate?: string
}
export type GetContractorApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: Contractor
  }
export type GetContractorApiArg = {
  spectrumId: string
}
export type ArchiveContractorApiResponse = unknown
export type ArchiveContractorApiArg = {
  /** Contractor spectrum ID */
  spectrumId: string
  body: {
    /** Optional reason describing why the contractor was archived. */
    reason?: string
  }
}
export type UpdateContractorApiResponse =
  /** status 201 Updated - Resource successfully updated */ {
    data: {}
  }
export type UpdateContractorApiArg = {
  spectrumId: string
  contractorUpdateBody: ContractorBody2
}
export type CheckContractorMembershipApiResponse =
  /** status 200 OK - Membership status retrieved */ {
    data: {
      is_member: boolean
      user_id: string
      username: string
      roles: string[]
    }
  }
export type CheckContractorMembershipApiArg = {
  /** Contractor spectrum ID */
  spectrumId: string
  /** Username to check */
  username: string
}
export type KickContractorMemberApiResponse =
  /** status 204 Deleted - Resource successfully deleted */ {
    data: {}
  }
export type KickContractorMemberApiArg = {
  spectrumId: string
  username: string
}
export type GetContractorMembersApiResponse =
  /** status 200 OK - Successful request with paginated members */ {
    data: {
      total: number
      page: number
      page_size: number
      members: {
        user_id: string
        username: string
        roles: string[]
        avatar: string
      }[]
    }
  }
export type GetContractorMembersApiArg = {
  /** Contractor spectrum ID */
  spectrumId: string
  /** Page number (0-based) */
  page?: number
  /** Number of items per page */
  pageSize?: number
  /** Search by username */
  search?: string
  /** Sort field */
  sort?: "username" | "role"
  /** Filter by role ID */
  roleFilter?: string
}
export type ContractorInviteMembersApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: ContractorInviteCode
  }
export type ContractorInviteMembersApiArg = {
  spectrumId: string
  body: {
    message?: string
    usernames?: string[]
  }
}
export type CreateContractorRoleApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type CreateContractorRoleApiArg = {
  spectrumId: string
  contractorRoleBody: ContractorRoleBody
}
export type UpdateContractorRoleApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type UpdateContractorRoleApiArg = {
  spectrumId: string
  roleId: string
  contractorRoleUpdateBody: ContractorRoleUpdateBody
}
export type DeleteContractorRoleApiResponse =
  /** status 204 Deleted - Resource successfully deleted */ {
    data: {}
  }
export type DeleteContractorRoleApiArg = {
  spectrumId: string
  roleId: string
}
export type GiveContractorRoleApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type GiveContractorRoleApiArg = {
  spectrumId: string
  roleId: string
  username: string
}
export type RemoveContractorRoleApiResponse =
  /** status 204 Deleted - Resource successfully deleted */ {
    data: {}
  }
export type RemoveContractorRoleApiArg = {
  spectrumId: string
  roleId: string
  username: string
}
export type TransferOwnershipApiResponse =
  /** status 200 OK - Ownership successfully transferred */ {
    data: {
      result: string
      message: string
    }
  }
export type TransferOwnershipApiArg = {
  /** Contractor spectrum ID */
  spectrumId: string
  body: {
    /** Username of the member to transfer ownership to */
    username: string
  }
}
export type UploadOrganizationAvatarApiResponse =
  /** status 200 Avatar uploaded successfully */ {
    result: string
    resource_id: string
    url: string
  }
export type UploadOrganizationAvatarApiArg = {
  /** Organization spectrum ID */
  spectrumId: string
}
export type UploadOrganizationBannerApiResponse =
  /** status 200 Banner uploaded successfully */ {
    result: string
    resource_id: string
    url: string
  }
export type UploadOrganizationBannerApiArg = {
  /** Organization spectrum ID */
  spectrumId: string
}
export type CreateContractorWebhookApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type CreateContractorWebhookApiArg = {
  spectrumId: string
  orderWebhook: ContractorRoleBody2
}
export type GetContractorWebhooksApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: ContractorRoleBody2[]
  }
export type GetContractorWebhooksApiArg = {
  spectrumId: string
}
export type DeleteContractorWebhookApiResponse =
  /** status 204 Deleted - Resource successfully deleted */ {
    data: {}
  }
export type DeleteContractorWebhookApiArg = {
  spectrumId: string
  webhookId: string
}
export type CreateContractorInviteApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: ContractorInviteCode
  }
export type CreateContractorInviteApiArg = {
  spectrumId: string
  body: {
    max_uses?: number
  }
}
export type GetContractorInvitesApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: ContractorInviteCode[]
  }
export type GetContractorInvitesApiArg = {
  spectrumId: string
}
export type GetContractorInviteByIdApiResponse =
  /** status 200 OK - Successful request with response body */ {
    data: ContractorInviteCode[]
  }
export type GetContractorInviteByIdApiArg = {
  spectrumId: string
  inviteId: string
}
export type AcceptContractorInviteApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type AcceptContractorInviteApiArg = {
  spectrumId: string
}
export type DeclineContractorInviteApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type DeclineContractorInviteApiArg = {
  spectrumId: string
}
export type GetContractorsApiResponse =
  /** status 200 Contractors list retrieved successfully */ {
    /** Total number of contractors matching the criteria */
    total: number
    items: {
      contractor_id: string
      spectrum_id: string
      name: string
      description?: string | null
      avatar?: string | null
      banner?: string | null
      site_url?: string | null
      locale?: string | null
      market_order_template?: string | null
      created_at: string
      updated_at: string
      /** Contractor specialization fields */
      fields: string[]
      /** Average contractor rating */
      rating?: number | null
      /** Available contractor roles */
      roles: {
        role_id?: string
        name?: string
        position?: number
        permissions?: object
      }[]
    }[]
  }
export type GetContractorsApiArg = {
  /** Page index for pagination */
  index?: number
  /** Number of items per page */
  pageSize?: number
  /** Field to sort by */
  sorting?:
    | "name"
    | "name-reverse"
    | "rating"
    | "rating-reverse"
    | "created_at"
    | "created_at-reverse"
    | "members"
    | "members-reverse"
    | "member_count"
    | "date"
    | "date-reverse"
  /** Reverse the sort order */
  reverseSort?: boolean
  /** Search query to filter contractors by name or description */
  query?: string
  /** Comma-separated list of fields to filter by */
  fields?: string
  /** Filter by minimum rating */
  rating?: string
}
export type GetContractorDiscordSettingsApiResponse =
  /** status 200 Discord settings retrieved successfully */ {
    /** Discord server avatar URL */
    guild_avatar?: string | null
    /** Discord server name */
    guild_name?: string | null
    /** Discord channel name */
    channel_name?: string | null
    /** Official Discord server ID */
    official_server_id?: string | null
    /** Discord thread channel ID */
    discord_thread_channel_id?: string | null
  }
export type GetContractorDiscordSettingsApiArg = {
  /** Contractor spectrum ID */
  spectrumId: string
}
export type UseOfficialDiscordContractorApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type UseOfficialDiscordContractorApiArg = {
  spectrumId: string
}
export type LeaveContractorApiResponse =
  /** status 201 Created - Resource successfully created */ {
    data: {}
  }
export type LeaveContractorApiArg = {
  spectrumId: string
}
export type GetOrgBlocklistApiResponse =
  /** status 200 OK - Blocklist retrieved successfully */ {
    data?: {
      id?: string
      blocked_id?: string
      created_at?: string
      reason?: string
      blocked_user?: {
        username?: string
        display_name?: string
        avatar?: string
      }
    }[]
  }
export type GetOrgBlocklistApiArg = {
  /** Organization spectrum ID */
  spectrumId: string
}
export type BlockUserForOrgApiResponse =
  /** status 200 OK - User blocked successfully */ {
    data?: {
      message?: string
    }
  }
export type BlockUserForOrgApiArg = {
  /** Organization spectrum ID */
  spectrumId: string
  body: {
    /** Username of the user to block */
    username: string
    /** Optional reason for blocking */
    reason?: string
  }
}
export type UnblockUserForOrgApiResponse =
  /** status 200 OK - User unblocked successfully */ {
    data?: {
      message?: string
    }
  }
export type UnblockUserForOrgApiArg = {
  /** Organization spectrum ID */
  spectrumId: string
  /** Username of the user to unblock */
  username: string
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type Unauthorized = {
  message: "Unauthorized"
}
export type Forbidden = {
  message: "Forbidden"
}
export type Conflict = {
  message: "Conflict"
}
export type RateLimitError = {
  /** Error type identifier */
  error: "RATE_LIMIT_EXCEEDED"
  /** Human-readable error message */
  message: string
  /** Seconds to wait before retrying */
  retryAfter: number
  /** Maximum requests allowed per time window */
  limit: number
  /** Requests remaining in current window */
  remaining: number
  /** Unix timestamp when rate limit resets */
  resetTime: number
  /** User tier that triggered the rate limit */
  userTier: "anonymous" | "authenticated" | "admin"
  /** Endpoint that was rate limited */
  endpoint: string
}
export type ContractorBody = {
  logo: string
  banner: string
  name: string
  description: string
  identifier: string
}
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_orders: number
}
export type MinimalContractor = {
  avatar: string
  name: string
  spectrum_id: string
  rating: Rating
}
export type NotFound = {
  message: "Not Found"
}
export type MinimalUser = {
  username: string
  display_name: string
  avatar: string
  rating: Rating
  discord_profile?: {
    id: string
    discriminator: string
    username: string
  } | null
}
export type AuditLogEntry = {
  /** Unique identifier for the audit log entry */
  audit_log_id: string
  /** Action that was performed (e.g., 'org.archived') */
  action: string
  /** User ID of the actor who performed the action */
  actor_id?: string | null
  /** User details of the actor (if actor_id exists) */
  actor?: MinimalUser
  /** Type of entity the action was performed on */
  subject_type: string
  /** ID of the entity the action was performed on */
  subject_id: string
  /** Additional metadata about the action */
  metadata: {
    [key: string]: any
  }
  /** Timestamp when the action was performed */
  created_at: string
}
export type AuditLogsResponse = {
  items: AuditLogEntry[]
  /** Total number of audit log entries matching the filters */
  total: number
  /** Current page number */
  page: number
  /** Number of items per page */
  page_size: number
}
export type ServerError = {
  message: "Internal Server Error"
}
export type ContractorKindIconKey =
  | "combat"
  | "freight"
  | "refuel"
  | "repair"
  | "mining"
  | "transport"
  | "exploration"
  | "escort"
  | "salvage"
  | "refining"
  | "construction"
  | "social"
  | "roleplay"
  | "medical"
  | "intelligence"
export type ContractorRole = {
  contractor_id: string
  name: string
  position: number
  role_id: string
  manage_roles: boolean
  manage_orders: boolean
  kick_members: boolean
  manage_invites: boolean
  manage_org_details: boolean
  manage_stock: boolean
  manage_market: boolean
  manage_recruiting: boolean
  manage_webhooks: boolean
}
export type Contractor = {
  kind: "independent" | "organization"
  avatar: string
  banner: string
  site_url?: string
  rating: Rating
  size: number
  name: string
  description: string
  fields: ContractorKindIconKey[]
  spectrum_id: string
  market_order_template?: string
  members: {
    username: string
    roles: string[]
  }[]
  roles?: ContractorRole[]
  default_role?: string
  owner_role?: string
  balance?: number
  /** Preferred locale for the contractor */
  locale?: "en" | "es" | "uk" | "zh-CN" | "fr" | "de" | "ja"
}
export type ContractorBody2 = {
  site_url?: string
  name?: string
  description?: string
  market_order_template?: string
  tags?: (
    | "combat"
    | "freight"
    | "refuel"
    | "repair"
    | "mining"
    | "transport"
    | "exploration"
    | "escort"
    | "salvage"
    | "refining"
    | "construction"
    | "social"
    | "roleplay"
    | "medical"
    | "intelligence"
  )[]
  /** Preferred locale for the contractor */
  locale?: "en" | "es" | "uk" | "zh-CN" | "fr" | "de" | "ja"
}
export type ContractorInviteCode = {
  invite_id: string
  max_uses: number
  times_used: number
}
export type ContractorRoleBody = {
  name: string
  manage_roles: boolean
  manage_orders: boolean
  kick_members: boolean
  manage_invites: boolean
  manage_org_details: boolean
  manage_stock: boolean
  manage_market: boolean
  manage_recruiting: boolean
  manage_webhooks: boolean
  manage_blocklist: boolean
}
export type ContractorRoleUpdateBody = {
  name: string
  position: number
  manage_roles: boolean
  manage_orders: boolean
  kick_members: boolean
  manage_invites: boolean
  manage_org_details: boolean
  manage_stock: boolean
  manage_market: boolean
  manage_recruiting: boolean
  manage_webhooks: boolean
  manage_blocklist: boolean
}
export type ContractorRoleBody2 = {
  name: string
  webhook_url: string
  actions: string[]
}
export const {
  useAuthLinkMutation,
  useCreateContractorMutation,
  useSearchContractorsQuery,
  useGetInviteCodeQuery,
  useAcceptCodeInviteMutation,
  useSearchContractorMembersQuery,
  useGetContractorMembersCsvQuery,
  useGetContractorCustomersQuery,
  useGetContractorReviewsQuery,
  useGetContractorAuditLogsQuery,
  useGetContractorQuery,
  useArchiveContractorMutation,
  useUpdateContractorMutation,
  useCheckContractorMembershipQuery,
  useKickContractorMemberMutation,
  useGetContractorMembersQuery,
  useContractorInviteMembersMutation,
  useCreateContractorRoleMutation,
  useUpdateContractorRoleMutation,
  useDeleteContractorRoleMutation,
  useGiveContractorRoleMutation,
  useRemoveContractorRoleMutation,
  useTransferOwnershipMutation,
  useUploadOrganizationAvatarMutation,
  useUploadOrganizationBannerMutation,
  useCreateContractorWebhookMutation,
  useGetContractorWebhooksQuery,
  useDeleteContractorWebhookMutation,
  useCreateContractorInviteMutation,
  useGetContractorInvitesQuery,
  useGetContractorInviteByIdMutation,
  useAcceptContractorInviteMutation,
  useDeclineContractorInviteMutation,
  useGetContractorsQuery,
  useGetContractorDiscordSettingsQuery,
  useUseOfficialDiscordContractorMutation,
  useLeaveContractorMutation,
  useGetOrgBlocklistQuery,
  useBlockUserForOrgMutation,
  useUnblockUserForOrgMutation,
} = injectedRtkApi
