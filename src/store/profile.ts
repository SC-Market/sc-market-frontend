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
import type { RootState } from "./store"
import { DiscordSettings, OrderWebhook, Rating } from "../datatypes/Contractor"
import { unwrapResponse } from "./api-utils"
import { Language } from "../constants/languages"
import { createOptimisticUpdate } from "../util/optimisticUpdates"

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
    // Logout mutation
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
        credentials: "include",
      }),
      // Invalidate all cache on logout
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          // Clear all RTK Query cache
          dispatch(serviceApi.util.resetApiState())
          // Invalidate all authentication-related tags
          dispatch(
            serviceApi.util.invalidateTags([
              "MyProfile",
              "Profile",
              "Orders",
              "Notifications",
              "Chat",
              "MarketListings",
              "MyListings",
              "Offers",
            ]),
          )
        } catch {
          // Even if logout fails, clear cache (session might be destroyed anyway)
          dispatch(serviceApi.util.resetApiState())
        }
      },
    }),
    profileGetUserProfile: builder.query<UserProfileState, void>({
      query: () => `${baseUrl}`,
      // Keep user profile in cache for 5 minutes (frequently accessed)
      keepUnusedDataFor: 300,
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
    profileGetUserByName: builder.query<User, string>({
      query: (username) => `${baseUrl}/user/${username}`,
      // Keep user profiles in cache for 5 minutes (users navigate back/forth)
      keepUnusedDataFor: 300,
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
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: Array<{ undo: () => void }> = []

            // Optimistically update settings in profile
            const profilePatch = dispatch(
              userApi.util.updateQueryData(
                "profileGetUserProfile",
                undefined,
                (draft) => {
                  if (draft.settings) {
                    Object.assign(draft.settings, body)
                  }
                },
              ),
            )
            patches.push(profilePatch)

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileUpdateAvailability: builder.mutation<void, AccountAvailabilityBody>({
      query: (body) => ({
        url: `${baseUrl}/availability/update`,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "MyProfile" as const },
        "MyProfile" as const,
        // Invalidate all availability requirement checks so forms can re-enable submit buttons
        { type: "AvailabilityRequirement" as const },
      ],
    }),
    profileUpdateProfile: builder.mutation<
      UserProfileState,
      {
        about?: string
        display_name?: string
        market_order_template?: string
      }
    >({
      query: (body) => ({
        url: `${baseUrl}/update`,
        method: "POST",
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled, getState }) {
        await createOptimisticUpdate(
          (dispatch) => {
            const patches: Array<{ undo: () => void }> = []

            // Optimistically update user profile
            const profilePatch = dispatch(
              userApi.util.updateQueryData(
                "profileGetUserProfile",
                undefined,
                (draft) => {
                  if (body.display_name !== undefined)
                    draft.display_name = body.display_name
                  if (body.market_order_template !== undefined)
                    draft.market_order_template = body.market_order_template
                  // 'about' maps to 'profile_description' in UserProfileState
                  if (body.about !== undefined)
                    draft.profile_description = body.about
                },
              ),
            )
            patches.push(profilePatch)

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
      invalidatesTags: (result, error, arg) => [
        {
          type: "Profile" as const,
          id: result?.username,
        },
        { type: "MyProfile" as const },
        "MyProfile" as const,
      ],
    }),
    profileUploadAvatar: builder.mutation<
      { result: string; resource_id: string; url: string },
      File
    >({
      query: (file) => {
        const formData = new FormData()
        formData.append("avatar", file)
        return {
          url: `${baseUrl}/avatar`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      },
      async onQueryStarted(file, { dispatch, queryFulfilled, getState }) {
        // Create preview URL for immediate feedback
        const previewUrl = URL.createObjectURL(file)

        await createOptimisticUpdate(
          (dispatch) => {
            const patches: Array<{ undo: () => void }> = []

            // Optimistically update avatar with preview
            const profilePatch = dispatch(
              userApi.util.updateQueryData(
                "profileGetUserProfile",
                undefined,
                (draft) => {
                  draft.avatar = previewUrl
                },
              ),
            )
            patches.push(profilePatch)

            // Also update if viewing own profile by username
            const state = getState() as RootState
            const profile = state?.serviceApi?.queries?.[
              "profileGetUserProfile(undefined)"
            ]?.data as UserProfileState | undefined
            if (profile?.username) {
              const userProfilePatch = dispatch(
                userApi.util.updateQueryData(
                  "profileGetUserByName",
                  profile.username,
                  (draft) => {
                    draft.avatar = previewUrl
                  },
                ),
              )
              patches.push(userProfilePatch)
            }

            // Clean up preview URL after server response
            queryFulfilled.then(() => {
              URL.revokeObjectURL(previewUrl)
            })

            return patches
          },
          queryFulfilled,
          dispatch,
        )
      },
      invalidatesTags: [
        { type: "MyProfile" as const },
        "MyProfile" as const,
        { type: "Profile" as const, id: "LIST" },
      ],
    }),
    profileUploadBanner: builder.mutation<
      { result: string; resource_id: string; url: string },
      File
    >({
      query: (file) => {
        const formData = new FormData()
        formData.append("banner", file)
        return {
          url: `${baseUrl}/banner`,
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let the browser set it with boundary for multipart/form-data
        }
      },
      invalidatesTags: [
        { type: "MyProfile" as const },
        "MyProfile" as const,
        { type: "Profile" as const, id: "LIST" },
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
    profileGetLinks: builder.query<
      Array<{
        provider_type: string
        provider_id: string
        is_primary: boolean
        linked_at: string
        last_used_at: string | null
      }>,
      void
    >({
      query: () => `${baseUrl}/links`,
      transformResponse: (response: {
        data: {
          providers: Array<{
            provider_type: string
            provider_id: string
            is_primary: boolean
            linked_at: string
            last_used_at: string | null
          }>
        }
      }) => response.data.providers,
      providesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileUnlinkProvider: builder.mutation<void, { provider_type: string }>({
      query: (body) => ({
        url: `${baseUrl}/links/${body.provider_type}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileSetPrimaryProvider: builder.mutation<
      void,
      { provider_type: string }
    >({
      query: (body) => ({
        url: `${baseUrl}/links/${body.provider_type}/primary`,
        method: "PUT",
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileSyncHandle: builder.mutation<UserProfileState, void>({
      query: () => ({
        url: `${baseUrl}/auth/sync-handle`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "MyProfile" as const }, "MyProfile" as const],
    }),
    profileUnlinkAccount: builder.mutation<UserProfileState, void>({
      query: () => ({
        url: `${baseUrl}/auth/unlink`,
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
    // Language endpoints
    profileGetLanguages: builder.query<{ languages: Language[] }, void>({
      query: () => `${baseUrl}/languages`,
      transformResponse: (response: { data: { languages: Language[] } }) =>
        response.data,
      providesTags: ["UserLanguages" as const],
    }),
    profileSetLanguages: builder.mutation<
      { languages: Language[] },
      { language_codes: string[] }
    >({
      query: (body) => ({
        url: `${baseUrl}/languages`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { data: { languages: Language[] } }) =>
        response.data,
      invalidatesTags: [
        "UserLanguages" as const,
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
export const useLogoutMutation = userApi.endpoints.logout.useMutation
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
export const useProfileUpdateLocale =
  userApi.endpoints.profileUpdateLocale.useMutation
export const useUpdateProfile =
  userApi.endpoints.profileUpdateProfile.useMutation

export const {
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
} = userApi
