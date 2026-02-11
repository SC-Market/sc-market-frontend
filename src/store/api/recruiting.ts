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
  "RecruitingPosts",
  "Recruiting",
  "RecruitingPostComments",
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getRecruitingPosts: build.query<
        GetRecruitingPostsApiResponse,
        GetRecruitingPostsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/recruiting/posts`,
          params: {
            index: queryArg.index,
            sorting: queryArg.sorting,
            query: queryArg.query,
            fields: queryArg.fields,
            rating: queryArg.rating,
            pageSize: queryArg.pageSize,
          },
        }),
        providesTags: ["RecruitingPosts", "Recruiting"],
      }),
      createRecruitingPost: build.mutation<
        CreateRecruitingPostApiResponse,
        CreateRecruitingPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/recruiting/posts`,
          method: "POST",
          body: queryArg.createRecruitingPostRequest,
        }),
        invalidatesTags: ["RecruitingPosts", "Recruiting"],
      }),
      getRecruitingPostById: build.query<
        GetRecruitingPostByIdApiResponse,
        GetRecruitingPostByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/api/recruiting/posts/${queryArg.postId}`,
        }),
        providesTags: ["RecruitingPosts", "Recruiting"],
      }),
      getRecruitingPostComments: build.query<
        GetRecruitingPostCommentsApiResponse,
        GetRecruitingPostCommentsApiArg
      >({
        query: (queryArg) => ({
          url: `/api/recruiting/posts/${queryArg.postId}/comments`,
        }),
        providesTags: [
          "RecruitingPosts",
          "RecruitingPostComments",
          "Recruiting",
        ],
      }),
      getRecruitingPostByContractor: build.query<
        GetRecruitingPostByContractorApiResponse,
        GetRecruitingPostByContractorApiArg
      >({
        query: (queryArg) => ({
          url: `/api/recruiting/contractors/${queryArg.spectrumId}/posts`,
        }),
        providesTags: ["RecruitingPosts", "Recruiting"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as recruitingApi }
export type GetRecruitingPostsApiResponse =
  /** status 200 OK - Successfully retrieved recruiting posts */ {
    /** Total number of posts matching the query */
    total: number
    /** Array of recruiting posts */
    items: RecruitingPost[]
  }
export type GetRecruitingPostsApiArg = {
  /** Page index (0-based) */
  index?: number
  /** Sort method */
  sorting?:
    | "rating"
    | "name"
    | "activity"
    | "all-time"
    | "members"
    | "date"
    | "post-date"
    | "rating-reverse"
    | "name-reverse"
    | "activity-reverse"
    | "all-time-reverse"
    | "members-reverse"
    | "date-reverse"
    | "post-date-reverse"
  /** Search query */
  query?: string
  /** Comma-separated list of fields to search */
  fields?: string
  /** Minimum rating filter */
  rating?: number
  /** Number of items per page */
  pageSize?: number
}
export type CreateRecruitingPostApiResponse =
  /** status 201 Created - Recruiting post successfully created */ {
    data: RecruitingPost
  }
export type CreateRecruitingPostApiArg = {
  createRecruitingPostRequest: CreateRecruitingPostRequest
}
export type GetRecruitingPostByIdApiResponse =
  /** status 200 OK - Successfully retrieved recruiting post */ {
    data: RecruitingPost
  }
export type GetRecruitingPostByIdApiArg = {
  /** The ID of the recruiting post */
  postId: string
}
export type GetRecruitingPostCommentsApiResponse =
  /** status 200 OK - Successfully retrieved comments */ {
    data: RecruitingComment[]
  }
export type GetRecruitingPostCommentsApiArg = {
  /** The ID of the recruiting post */
  postId: string
}
export type GetRecruitingPostByContractorApiResponse =
  /** status 200 OK - Successfully retrieved recruiting post */ {
    data: RecruitingPost
  }
export type GetRecruitingPostByContractorApiArg = {
  /** The Spectrum ID of the contractor */
  spectrumId: string
}
export type Rating = {
  avg_rating: number
  rating_count: number
  streak: number
  total_orders: number
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
export type RecruitingPost = {
  post_id: string
  contractor: Contractor
  title: string
  body: string
  timestamp: string
  upvotes: number
  downvotes: number
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
export type CreateRecruitingPostRequest = {
  title: string
  body: string
  contractor: string
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
export type RecruitingComment = {
  comment_id: string
  author: MinimalUser
  content: string
  replies?: RecruitingComment[]
  timestamp: string
  upvotes: number
  downvotes: number
  deleted: boolean
}
export const {
  useGetRecruitingPostsQuery,
  useCreateRecruitingPostMutation,
  useGetRecruitingPostByIdQuery,
  useGetRecruitingPostCommentsQuery,
  useGetRecruitingPostByContractorQuery,
} = injectedRtkApi
