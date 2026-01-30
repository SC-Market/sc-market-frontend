import { serviceApi as api } from "../service"
export const addTagTypes = ["Profiles", "Email"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      syncRsiHandle: build.mutation<
        SyncRsiHandleApiResponse,
        SyncRsiHandleApiArg
      >({
        query: (queryArg) => ({
          url: `/api/profile/auth/sync-handle`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Profiles"],
      }),
      unlinkStarCitizenAccount: build.mutation<
        UnlinkStarCitizenAccountApiResponse,
        UnlinkStarCitizenAccountApiArg
      >({
        query: (queryArg) => ({
          url: `/api/profile/auth/unlink`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Profiles"],
      }),
      updateProfile: build.mutation<
        UpdateProfileApiResponse,
        UpdateProfileApiArg
      >({
        query: (queryArg) => ({
          url: `/api/profile`,
          method: "PUT",
          body: queryArg.profileUpdateBody,
        }),
        invalidatesTags: ["Profiles"],
      }),
      getCurrentUserProfile: build.query<
        GetCurrentUserProfileApiResponse,
        GetCurrentUserProfileApiArg
      >({
        query: () => ({ url: `/api/profile` }),
        providesTags: ["Profiles"],
      }),
      uploadProfileAvatar: build.mutation<
        UploadProfileAvatarApiResponse,
        UploadProfileAvatarApiArg
      >({
        query: () => ({ url: `/api/profile/avatar`, method: "POST" }),
        invalidatesTags: ["Profiles"],
      }),
      uploadProfileBanner: build.mutation<
        UploadProfileBannerApiResponse,
        UploadProfileBannerApiArg
      >({
        query: () => ({ url: `/api/profile/banner`, method: "POST" }),
        invalidatesTags: ["Profiles"],
      }),
      getUserBlocklist: build.query<
        GetUserBlocklistApiResponse,
        GetUserBlocklistApiArg
      >({
        query: () => ({ url: `/api/profile/blocklist` }),
        providesTags: ["Profiles"],
      }),
      blockUser: build.mutation<BlockUserApiResponse, BlockUserApiArg>({
        query: (queryArg) => ({
          url: `/api/profile/blocklist/block`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Profiles"],
      }),
      unblockUser: build.mutation<UnblockUserApiResponse, UnblockUserApiArg>({
        query: (queryArg) => ({
          url: `/api/profile/blocklist/unblock/${queryArg.username}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Profiles"],
      }),
      postApiProfileEmail: build.mutation<
        PostApiProfileEmailApiResponse,
        PostApiProfileEmailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/profile/email`,
          method: "POST",
          body: queryArg.addEmailRequest,
        }),
        invalidatesTags: ["Email"],
      }),
      patchApiProfileEmail: build.mutation<
        PatchApiProfileEmailApiResponse,
        PatchApiProfileEmailApiArg
      >({
        query: (queryArg) => ({
          url: `/api/profile/email`,
          method: "PATCH",
          body: queryArg.updateEmailRequest,
        }),
        invalidatesTags: ["Email"],
      }),
      deleteApiProfileEmail: build.mutation<
        DeleteApiProfileEmailApiResponse,
        DeleteApiProfileEmailApiArg
      >({
        query: () => ({ url: `/api/profile/email`, method: "DELETE" }),
        invalidatesTags: ["Email"],
      }),
      postApiProfileEmailVerify: build.mutation<
        PostApiProfileEmailVerifyApiResponse,
        PostApiProfileEmailVerifyApiArg
      >({
        query: () => ({ url: `/api/profile/email/verify`, method: "POST" }),
        invalidatesTags: ["Email"],
      }),
      getApiProfileEmailVerifyByToken: build.query<
        GetApiProfileEmailVerifyByTokenApiResponse,
        GetApiProfileEmailVerifyByTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/profile/email/verify/${queryArg.token}`,
        }),
        providesTags: ["Email"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as profileApi }
export type SyncRsiHandleApiResponse =
  /** status 200 RSI handle successfully synced from Spectrum */ {
    data: GetCurrentUserProfileSuccess
  }
export type SyncRsiHandleApiArg = {
  body: {}
}
export type UnlinkStarCitizenAccountApiResponse =
  /** status 200 Star Citizen account successfully unlinked */ {
    data: GetCurrentUserProfileSuccess
  }
export type UnlinkStarCitizenAccountApiArg = {
  body: {}
}
export type UpdateProfileApiResponse =
  /** status 200 OK - Profile successfully updated */ {
    data: {
      message: string
      locale: "en" | "es" | "uk" | "zh-CN" | "fr" | "de" | "ja"
    }
    status: string
  }
export type UpdateProfileApiArg = {
  profileUpdateBody: ProfileUpdateBody
}
export type GetCurrentUserProfileApiResponse =
  /** status 200 OK - User profile retrieved successfully */ GetCurrentUserProfileSuccess
export type GetCurrentUserProfileApiArg = void
export type UploadProfileAvatarApiResponse =
  /** status 200 Avatar uploaded successfully */ {
    result: string
    resource_id: string
    url: string
  }
export type UploadProfileAvatarApiArg = void
export type UploadProfileBannerApiResponse =
  /** status 200 Banner uploaded successfully */ {
    result: string
    resource_id: string
    url: string
  }
export type UploadProfileBannerApiArg = void
export type GetUserBlocklistApiResponse =
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
export type GetUserBlocklistApiArg = void
export type BlockUserApiResponse =
  /** status 200 OK - User blocked successfully */ {
    data?: {
      message?: string
    }
  }
export type BlockUserApiArg = {
  body: {
    /** Username of the user to block */
    username: string
    /** Optional reason for blocking */
    reason?: string
  }
}
export type UnblockUserApiResponse =
  /** status 200 OK - User unblocked successfully */ {
    data?: {
      message?: string
    }
  }
export type UnblockUserApiArg = {
  /** Username of the user to unblock */
  username: string
}
export type PostApiProfileEmailApiResponse =
  /** status 201 Email address added successfully */ AddEmailResponse
export type PostApiProfileEmailApiArg = {
  addEmailRequest: AddEmailRequest
}
export type PatchApiProfileEmailApiResponse =
  /** status 200 Email address updated successfully */ AddEmailResponse
export type PatchApiProfileEmailApiArg = {
  updateEmailRequest: UpdateEmailRequest
}
export type DeleteApiProfileEmailApiResponse =
  /** status 200 Email address removed successfully */ {
    message?: string
  }
export type DeleteApiProfileEmailApiArg = void
export type PostApiProfileEmailVerifyApiResponse =
  /** status 200 Verification email sent */ {
    message?: string
  }
export type PostApiProfileEmailVerifyApiArg = void
export type GetApiProfileEmailVerifyByTokenApiResponse = unknown
export type GetApiProfileEmailVerifyByTokenApiArg = {
  /** Email verification token */
  token: string
}
export type GetCurrentUserProfileSuccess = {
  /** Unique identifier for the user */
  user_id: string
  /** Username */
  username: string
  /** Display name */
  display_name: string
  /** User profile description */
  profile_description: string
  /** User role */
  role: "user" | "admin"
  /** Whether the user is banned */
  banned: boolean
  /** User balance */
  balance: number
  /** Account creation timestamp */
  created_at: string
  /** Discord official server ID */
  official_server_id?: string | null
  /** Discord thread channel ID */
  discord_thread_channel_id?: string | null
  /** Default market order template */
  market_order_template: string
  /** Preferred locale */
  locale: "en" | "es" | "uk" | "zh-CN" | "fr" | "de" | "ja"
  /** Contractors the user belongs to */
  contractors: {
    contractor_id?: string
    spectrum_id?: string
    name?: string
    description?: string
    avatar?: string
    banner?: string
    size?: number
    role?: string
  }[]
  /** Avatar URL */
  avatar: string
  /** Banner URL */
  banner: string
  /** User settings */
  settings: {
    discord_order_share?: boolean
    discord_public?: boolean
  }
  /** User rating summary */
  rating: {
    average?: number
    count?: number
  }
  /** Linked Discord profile */
  discord_profile: {
    username?: string | null
    discriminator?: string | null
    id?: string | null
  } | null
}
export type Unauthorized = {
  message: "Unauthorized"
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
export type ServerError = {
  message: "Internal Server Error"
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
}
export type ProfileUpdateBody = {
  /** User's preferred locale/language */
  locale: "en" | "es" | "uk" | "zh-CN" | "fr" | "de" | "ja"
}
export type AddEmailResponse = {
  /** Unique identifier for the email record */
  email_id: string
  /** Email address */
  email: string
  /** Whether the email is verified */
  email_verified: boolean
  /** Number of notification preferences created */
  preferences_created: number
  /** Success message */
  message: string
}
export type Conflict = {
  message: "Conflict"
}
export type AddEmailRequest = {
  /** Email address to add */
  email: string
  /** Array of notification action type IDs to enable */
  notificationTypeIds?: number[]
}
export type NotFound = {
  message: "Not Found"
}
export type UpdateEmailRequest = {
  /** New email address */
  email: string
}
export const {
  useSyncRsiHandleMutation,
  useUnlinkStarCitizenAccountMutation,
  useUpdateProfileMutation,
  useGetCurrentUserProfileQuery,
  useUploadProfileAvatarMutation,
  useUploadProfileBannerMutation,
  useGetUserBlocklistQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  usePostApiProfileEmailMutation,
  usePatchApiProfileEmailMutation,
  useDeleteApiProfileEmailMutation,
  usePostApiProfileEmailVerifyMutation,
  useGetApiProfileEmailVerifyByTokenQuery,
} = injectedRtkApi
