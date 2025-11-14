import {
  Contractor,
  ContractorInviteCode,
  DiscordSettings,
  OrderWebhook,
  MinimalContractor,
  ContractorMember,
} from "../datatypes/Contractor"
import { MinimalUser, User } from "../datatypes/User"
import { OrderReview } from "../datatypes/Order"
import { serviceApi } from "./service"
import { ContractorSearchState } from "../hooks/contractor/ContractorSearch"
import { unwrapResponse } from "./orders"
import { BlocklistEntry } from "./profile"

export const contractorsApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    getContractorBySpectrumID: builder.query<Contractor, string>({
      query: (spectrum_id) => `/api/contractors/${spectrum_id}`,
      providesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
      ],
      transformResponse: unwrapResponse,
    }),
    getDiscordSettings: builder.query<DiscordSettings, string>({
      query: (spectrum_id) =>
        `/api/contractors/${spectrum_id}/settings/discord`,
      providesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
      ],
      transformResponse: unwrapResponse,
    }),
    useOfficialDiscordSettings: builder.mutation<void, string>({
      query: (spectrum_id) => ({
        url: `/api/contractors/${spectrum_id}/settings/discord/use_official`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
      ],
      transformResponse: unwrapResponse,
    }),
    searchContractorMembers: builder.query<
      MinimalUser[],
      { spectrum_id: string; query: string }
    >({
      query: ({ spectrum_id, query }) =>
        `/api/contractors/${spectrum_id}/members/search/${query}`,
      transformResponse: unwrapResponse,
    }),
    getContractorMembers: builder.query<
      {
        total: number
        page: number
        page_size: number
        members: ContractorMember[]
      },
      {
        spectrum_id: string
        page?: number
        page_size?: number
        search?: string
        sort?: string
        role_filter?: string
      }
    >({
      query: ({
        spectrum_id,
        page = 0,
        page_size = 50,
        search = "",
        sort = "username",
        role_filter = "",
      }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: page_size.toString(),
          sort,
        })
        if (search) params.append("search", search)
        if (role_filter) params.append("role_filter", role_filter)

        return `/api/contractors/${spectrum_id}/members?${params.toString()}`
      },
      transformResponse: unwrapResponse,
      providesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.spectrum_id },
      ],
    }),
    checkContractorMembership: builder.query<
      {
        is_member: boolean
        user_id: string
        username: string
        roles: string[]
      },
      { spectrum_id: string; username: string }
    >({
      query: ({ spectrum_id, username }) =>
        `/api/contractors/${spectrum_id}/members/${username}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.spectrum_id },
      ],
    }),
    getContractorCustomers: builder.query<User[], string>({
      query: (spectrum_id) => `/api/contractors/${spectrum_id}/customers`,
      transformResponse: unwrapResponse,
    }),
    getContractorWebhooks: builder.query<OrderWebhook[], string>({
      query: (spectrum_id) => `/api/contractors/${spectrum_id}/webhooks`,
      providesTags: ["OrderWebhook" as const],
      transformResponse: unwrapResponse,
    }),
    getContractorInvites: builder.query<ContractorInviteCode[], string>({
      query: (spectrum_id) => `/api/contractors/${spectrum_id}/invites`,
      providesTags: [
        { type: "ContractorInvite" as const },
        "ContractorInvite" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    getContractorReviews: builder.query<OrderReview[], string>({
      query: (spectrum_id) => `/api/contractors/${spectrum_id}/reviews`,
      transformResponse: unwrapResponse,
    }),
    contractorLink: builder.mutation<void, { contractor: string }>({
      query: (body) => ({
        url: `/api/contractors/auth/link`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    inviteContractorMembers: builder.mutation<
      void,
      { contractor: string; users: string[]; message: string }
    >({
      query: ({ contractor, users, message }) => ({
        url: `/api/contractors/${contractor}/members`,
        method: "POST",
        body: { usernames: users, message },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor", id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    createContractorWebhook: builder.mutation<
      void,
      {
        contractor: string
        body: { name: string; webhook_url: string; actions: string[] }
      }
    >({
      query: ({ contractor, body }) => ({
        url: `/api/contractors/${contractor}/webhooks`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["OrderWebhook" as const],
      transformResponse: unwrapResponse,
    }),
    registerContractor: builder.mutation<
      void,
      {
        description: string
        name: string
        identifier: string
        logo: string
        banner: string
      }
    >({
      query: (body) => ({
        url: `/api/contractors/`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    deleteContractorWebhook: builder.mutation<
      void,
      { contractor: string; webhook_id: string }
    >({
      query: ({ contractor, webhook_id }) => ({
        url: `/api/contractors/${contractor}/webhooks/${webhook_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OrderWebhook" as const],
      transformResponse: unwrapResponse,
    }),
    archiveContractor: builder.mutation<
      void,
      { spectrum_id: string; reason?: string }
    >({
      query: ({ spectrum_id, reason }) => ({
        url: `/api/contractors/${spectrum_id}`,
        method: "DELETE",
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.spectrum_id },
        { type: "Contractor" as const, id: "LIST" },
        "MyProfile" as const,
        { type: "ContractorInvite" as const },
      ],
      transformResponse: (response: unknown) => {
        // Handle 204 No Content responses - RTK Query may return undefined or empty response
        // For void mutations, we just return undefined
        return undefined
      },
    }),
    createContractorInvite: builder.mutation<
      ContractorInviteCode,
      {
        contractor: string
        body: { max_uses: number }
      }
    >({
      query: ({ contractor, body }) => ({
        url: `/api/contractors/${contractor}/invites`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContractorInvite" as const },
        "ContractorInvite" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    deleteContractorInvite: builder.mutation<
      ContractorInviteCode,
      {
        contractor: string
        invite_id: string
      }
    >({
      query: ({ contractor, invite_id }) => ({
        url: `/api/contractors/${contractor}/invites/${invite_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "ContractorInvite" as const },
        "ContractorInvite" as const,
      ],
      transformResponse: unwrapResponse,
    }),
    acceptContractorInvite: builder.mutation<void, { contractor: string }>({
      query: ({ contractor }) => ({
        url: `/api/contractors/${contractor}/accept`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        {
          type: "Contractor",
          id: arg.contractor,
        },
        "MyProfile" as const,
        { type: "MyProfile" as const },
        "Notifications" as const,
        { type: "Notifications" as const },
      ],
      transformResponse: unwrapResponse,
    }),
    getContractorInviteCode: builder.query<{ spectrum_id: string }, string>({
      query: (invite_id) => ({
        url: `/api/contractors/invites/${invite_id}`,
        method: "GET",
      }),
      transformResponse: unwrapResponse,
    }),
    acceptContractorInviteCode: builder.mutation<void, string>({
      query: (invite_id) => ({
        url: `/api/contractors/invites/${invite_id}/accept`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        "MyProfile" as const,
        { type: "MyProfile" as const },
        "Notifications" as const,
        { type: "Notifications" as const },
      ],
      transformResponse: unwrapResponse,
    }),
    declineContractorInvite: builder.mutation<void, { contractor: string }>({
      query: ({ contractor }) => ({
        url: `/api/contractors/${contractor}/decline`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        {
          type: "Contractor",
          id: arg.contractor,
        },
        "MyProfile",
        { type: "MyProfile" as const },
      ],
      transformResponse: unwrapResponse,
    }),
    updateContractor: builder.mutation<
      void,
      {
        contractor: string
        body: {
          description?: string
          tags?: string[]
          site_url?: string
          name?: string
          market_order_template?: string
          locale?: "en" | "es" | "uk" | "zh-CN" | "fr" | "de" | "ja"
        }
      }
    >({
      query: ({ contractor, body }) => ({
        url: `/api/contractors/${contractor}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    contractorUploadAvatar: builder.mutation<
      { result: string; resource_id: string; url: string },
      { contractor: string; file: File }
    >({
      query: ({ contractor, file }) => {
        const formData = new FormData()
        formData.append("avatar", file)
        return {
          url: `/api/contractors/${contractor}/avatar`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
    }),
    contractorUploadBanner: builder.mutation<
      { result: string; resource_id: string; url: string },
      { contractor: string; file: File }
    >({
      query: ({ contractor, file }) => {
        const formData = new FormData()
        formData.append("banner", file)
        return {
          url: `/api/contractors/${contractor}/banner`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
    }),
    refetchContractorDetails: builder.mutation<void, string>({
      query: (spectrum_id) => ({
        url: `/api/contractors/${spectrum_id}/refetch`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
      ],
      transformResponse: unwrapResponse,
    }),
    deleteContractorRole: builder.mutation<
      void,
      {
        contractor: string
        role_id: string
      }
    >({
      query: ({ contractor, role_id }) => ({
        url: `/api/contractors/${contractor}/roles/${role_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    createContractorRole: builder.mutation<
      void,
      {
        contractor: string
        body: {
          manage_roles: boolean
          manage_orders: boolean
          kick_members: boolean
          manage_invites: boolean
          manage_org_details: boolean
          manage_stock: boolean
          manage_market: boolean
          manage_webhooks: boolean
          manage_recruiting: boolean
          name: string
        }
      }
    >({
      query: ({ contractor, body }) => ({
        url: `/api/contractors/${contractor}/roles`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    updateContractorRole: builder.mutation<
      void,
      {
        contractor: string
        role_id: string
        body: {
          manage_roles: boolean
          manage_orders: boolean
          kick_members: boolean
          manage_invites: boolean
          manage_org_details: boolean
          manage_stock: boolean
          manage_market: boolean
          manage_webhooks: boolean
          manage_recruiting: boolean
          name: string
          position: number
        }
      }
    >({
      query: ({ contractor, role_id, body }) => ({
        url: `/api/contractors/${contractor}/roles/${role_id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    applyContractorRole: builder.mutation<
      void,
      {
        contractor: string
        username: string
        role_id: string
      }
    >({
      query: ({ contractor, role_id, username }) => ({
        url: `/api/contractors/${contractor}/roles/${role_id}/members/${username}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    removeContractorRole: builder.mutation<
      void,
      {
        contractor: string
        username: string
        role_id: string
      }
    >({
      query: ({ contractor, username, role_id }) => ({
        url: `/api/contractors/${contractor}/roles/${role_id}/members/${username}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    kickContractorMember: builder.mutation<
      void,
      {
        contractor: string
        username: string
      }
    >({
      query: ({ contractor, username }) => ({
        url: `/api/contractors/${contractor}/members/${username}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg.contractor },
      ],
      transformResponse: unwrapResponse,
    }),
    leaveContractor: builder.mutation<void, string>({
      query: (spectrum_id) => ({
        url: `/api/contractors/${spectrum_id}/leave`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const, id: arg },
        "MyProfile",
      ],
      transformResponse: unwrapResponse,
    }),
    adminExpressVerifyContractor: builder.mutation<
      void,
      {
        spectrum_id: string
        owner_username: string
        owner_discord_id: string
      }
    >({
      query: (body) => ({
        url: `/api/contractors/admin/express_verify`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor" as const },
      ],
      transformResponse: unwrapResponse,
    }),
    getContractors: builder.query<
      { total: number; items: Contractor[] },
      {
        index: number
        pageSize: number
      } & ContractorSearchState
    >({
      query: (params) => ({ url: `/api/contractors`, params }),
      transformResponse: unwrapResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((contractor) => ({
                type: "Contractor" as const,
                id: contractor.spectrum_id,
              })),
              { type: "Contractor" as const, id: "LIST" },
            ]
          : [{ type: "Contractor" as const, id: "LIST" }],
    }),
    searchContractors: builder.query<MinimalContractor[], string>({
      query: (query) => `/api/contractors/search/${query}`,
      transformResponse: (response: { data: MinimalContractor[] }) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map((contractor) => ({
                type: "Contractor" as const,
                id: contractor.spectrum_id,
              })),
              { type: "Contractor" as const, id: "LIST" },
            ]
          : [{ type: "Contractor" as const, id: "LIST" }],
    }),
    // Organization blocklist endpoints
    getOrgBlocklist: builder.query<BlocklistEntry[], string>({
      query: (spectrum_id) => `/api/contractors/${spectrum_id}/blocklist`,
      providesTags: ["OrgBlocklist" as const],
      transformResponse: unwrapResponse,
    }),
    blockUserForOrg: builder.mutation<
      void,
      { spectrum_id: string; username: string; reason?: string }
    >({
      query: ({ spectrum_id, username, reason }) => ({
        url: `/api/contractors/${spectrum_id}/blocklist/block`,
        method: "POST",
        body: { username, reason },
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        "OrgBlocklist" as const,
        { type: "Profile" as const, id: "LIST" },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
    unblockUserForOrg: builder.mutation<
      void,
      { spectrum_id: string; username: string }
    >({
      query: ({ spectrum_id, username }) => ({
        url: `/api/contractors/${spectrum_id}/blocklist/unblock/${username}`,
        method: "DELETE",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        "OrgBlocklist" as const,
        { type: "Profile" as const, id: "LIST" },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
  }),
})

export const {
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
} = contractorsApi
