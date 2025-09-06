import { BACKEND_URL } from "../util/constants"
import { User } from "../datatypes/User"
import {
  AccountAvailability,
  AccountAvailabilityBody,
  AccountSettingsBody,
  UserProfileState,
} from "../hooks/login/UserProfile"
import { OrderReview } from "../datatypes/Order"
import { serviceApi } from "./service"
import { DiscordSettings, OrderWebhook, Rating } from "../datatypes/Contractor"
import { unwrapResponse } from "./orders"

export interface SerializedError {
  error?: string
}

export interface BlocklistEntry {
  id: string
  blocked_username: string | null
  created_at: string
  reason: string
  blocked_user: {
    username: string
    display_name: string
    avatar: string
    rating: Rating
  } | null
}

const baseUrl = `${BACKEND_URL}/api/profile`

// Define a service using a base URL and expected endpoints
export const userApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    profileGetUserProfile: builder.query<UserProfileState, void>({
      query: () => `${baseUrl}`,
      providesTags: (result, error, arg) => [
        {
          type: "Profile" as const,
          id: result?.username,
        },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
    profileGetDiscordSettings: builder.query<DiscordSettings, void>({
      query: () => `${baseUrl}/settings/discord`,
      providesTags: (result, error) => [{ type: "MyProfile" as const }],
    }),
    profileUseOfficialDiscordSettings: builder.mutation<void, void>({
      query: () => ({
        url: `${baseUrl}/settings/discord/use_official`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileGetAvailability: builder.query<
      AccountAvailability,
      string | null | undefined
    >({
      query: (spectrum_id?: string | null) =>
        spectrum_id
          ? `${baseUrl}/availability/contractor/${spectrum_id}`
          : `${baseUrl}/availability`,
      providesTags: (result, error, arg) => [
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
    profileGetAllUsers: builder.query<(User & { role: string })[], void>({
      query: () => `${baseUrl}/allusers`,
    }),
    profileGetUserByName: builder.query<User, string>({
      query: (username) => `${baseUrl}/user/${username}`,
      providesTags: (result, error, arg) => [
        { type: "Profile" as const, id: arg },
      ],
    }),
    profileGetUserOrderReviews: builder.query<OrderReview[], string>({
      query: (username) => `${baseUrl}/user/${username}/reviews`,
    }),
    profileGetUserWebhooks: builder.query<OrderWebhook[], void>({
      query: () => `${baseUrl}/webhooks`,
      providesTags: ["OrderWebhook" as const],
    }),
    profileSearchUsers: builder.query<User[], string>({
      query: (query) => `${baseUrl}/search/${query}`,
    }),
    profileAccountLink: builder.mutation<void, { username: string }>({
      query: (body) => ({
        url: `${baseUrl}/auth/link`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileUpdateSettings: builder.mutation<void, AccountSettingsBody>({
      query: (body) => ({
        url: `${baseUrl}/settings/update`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileUpdateAvailability: builder.mutation<void, AccountAvailabilityBody>({
      query: (body) => ({
        url: `${baseUrl}/availability/update`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileUpdateProfile: builder.mutation<
      UserProfileState,
      {
        about?: string
        avatar_url?: string
        banner_url?: string
        display_name?: string
        market_order_template?: string
      }
    >({
      query: (body) => ({
        url: `${baseUrl}/update`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        {
          type: "Profile" as const,
          id: result?.username,
        },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
    profileUpdateLocale: builder.mutation<
      { data: { message: string; locale: string }; status: string },
      { locale: string }
    >({
      query: (body) => ({
        url: `${baseUrl}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileCreateWebhook: builder.mutation<
      void,
      {
        name: string
        webhook_url: string
        actions: string[]
      }
    >({
      query: (body) => ({
        url: `${baseUrl}/webhook/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrderWebhook" as const],
    }),
    profileDeleteWebhook: builder.mutation<void, { webhook_id: string }>({
      query: (body) => ({
        url: `${baseUrl}/webhook/delete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["OrderWebhook" as const],
    }),
    profileGetAuthenticatorIdentifier: builder.query<
      { identifier: string },
      void
    >({
      query: () => `${baseUrl}/auth/ident`,
    }),
    profileRefetch: builder.mutation<void, string>({
      query: (username) => ({
        url: `${baseUrl}/${username}/refetch`,
        method: "POST",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Contractor", id: arg },
      ],
    }),
    profileSyncHandle: builder.mutation<UserProfileState, void>({
      query: () => ({
        url: `${baseUrl}/auth/sync-handle`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    // Blocklist endpoints
    profileGetBlocklist: builder.query<BlocklistEntry[], void>({
      query: () => `${baseUrl}/blocklist`,
      providesTags: ["Blocklist" as const],
      transformResponse: unwrapResponse,
    }),
    profileBlockUser: builder.mutation<
      void,
      { username: string; reason?: string }
    >({
      query: (body) => ({
        url: `${baseUrl}/blocklist/block`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        "Blocklist" as const,
        { type: "Profile" as const, id: "LIST" },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
    profileUnblockUser: builder.mutation<void, string>({
      query: (username) => ({
        url: `${baseUrl}/blocklist/unblock/${username}`,
        method: "DELETE",
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [
        "Blocklist" as const,
        { type: "Profile" as const, id: "LIST" },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const useGetUserByUsernameQuery =
  userApi.endpoints.profileGetUserByName.useQuery
export const useGetUserProfileQuery =
  userApi.endpoints.profileGetUserProfile.useQuery
export const useGetUserOrderReviews =
  userApi.endpoints.profileGetUserOrderReviews.useQuery
export const useGetUserWebhooks =
  userApi.endpoints.profileGetUserWebhooks.useQuery
export const useSearchUsersQuery = userApi.endpoints.profileSearchUsers.useQuery
export const useGetAuthenticatorIdentifier =
  userApi.endpoints.profileGetAuthenticatorIdentifier.useQuery
export const useActivateAccountLink =
  userApi.endpoints.profileAccountLink.useMutation
export const useProfileCreateWebhook =
  userApi.endpoints.profileCreateWebhook.useMutation
export const useProfileDeleteWebhook =
  userApi.endpoints.profileDeleteWebhook.useMutation
export const useUpdateProfile =
  userApi.endpoints.profileUpdateProfile.useMutation
export const useProfileGetAllUsers =
  userApi.endpoints.profileGetAllUsers.useQuery
export const useProfileUpdateLocale =
  userApi.endpoints.profileUpdateLocale.useMutation

export const {
  useProfileUpdateSettingsMutation,
  useProfileUpdateAvailabilityMutation,
  useProfileGetAvailabilityQuery,
  useProfileRefetchMutation,
  useProfileGetDiscordSettingsQuery,
  useProfileUseOfficialDiscordSettingsMutation,
  useProfileSyncHandleMutation,
  useProfileGetBlocklistQuery,
  useProfileBlockUserMutation,
  useProfileUnblockUserMutation,
} = userApi
