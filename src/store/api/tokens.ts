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
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
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
export const addTagTypes = ["Tokens"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      createApiToken: build.mutation<
        CreateApiTokenApiResponse,
        CreateApiTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/tokens/`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Tokens"],
      }),
      listApiTokens: build.query<ListApiTokensApiResponse, ListApiTokensApiArg>(
        {
          query: () => ({ url: `/api/tokens/` }),
          providesTags: ["Tokens"],
        },
      ),
      getApiToken: build.query<GetApiTokenApiResponse, GetApiTokenApiArg>({
        query: (queryArg) => ({ url: `/api/tokens/${queryArg.tokenId}` }),
        providesTags: ["Tokens"],
      }),
      updateApiToken: build.mutation<
        UpdateApiTokenApiResponse,
        UpdateApiTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/tokens/${queryArg.tokenId}`,
          method: "PUT",
          body: queryArg.body,
        }),
        invalidatesTags: ["Tokens"],
      }),
      revokeApiToken: build.mutation<
        RevokeApiTokenApiResponse,
        RevokeApiTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/tokens/${queryArg.tokenId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Tokens"],
      }),
      extendApiToken: build.mutation<
        ExtendApiTokenApiResponse,
        ExtendApiTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/tokens/${queryArg.tokenId}/extend`,
          method: "POST",
          body: queryArg.body,
        }),
        invalidatesTags: ["Tokens"],
      }),
      getApiTokenStats: build.query<
        GetApiTokenStatsApiResponse,
        GetApiTokenStatsApiArg
      >({
        query: (queryArg) => ({ url: `/api/tokens/${queryArg.tokenId}/stats` }),
        providesTags: ["Tokens"],
      }),
      getAvailableScopes: build.query<
        GetAvailableScopesApiResponse,
        GetAvailableScopesApiArg
      >({
        query: () => ({ url: `/api/tokens/scopes` }),
        providesTags: ["Tokens"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as tokensApi }
export type CreateApiTokenApiResponse =
  /** status 201 Token created successfully */ {
    data?: {
      /** The actual token value (only shown on creation) */
      token?: string
      data?: {
        id?: string
        name?: string
        description?: string | null
        scopes?: string[]
        contractor_spectrum_ids?: string[]
        expires_at?: string | null
        created_at?: string
        updated_at?: string
      }
    }
  }
export type CreateApiTokenApiArg = {
  body: {
    /** Name for the API token */
    name: string
    /** Optional description for the API token */
    description?: string
    /** Array of scopes for the token. Admin scopes (admin:*, admin) and moderation scopes (moderation:*) are only available to admin users. */
    scopes: (
      | "profile:read"
      | "profile:write"
      | "market:read"
      | "market:write"
      | "market:purchase"
      | "market:photos"
      | "orders:read"
      | "orders:write"
      | "orders:reviews"
      | "contractors:read"
      | "contractors:write"
      | "contractors:members"
      | "contractors:webhooks"
      | "contractors:blocklist"
      | "orgs:read"
      | "orgs:write"
      | "orgs:manage"
      | "services:read"
      | "services:write"
      | "services:photos"
      | "offers:read"
      | "offers:write"
      | "chats:read"
      | "chats:write"
      | "notifications:read"
      | "notifications:write"
      | "moderation:read"
      | "moderation:write"
      | "admin:read"
      | "admin:write"
      | "admin:spectrum"
      | "admin:stats"
      | "readonly"
      | "full"
      | "admin"
    )[]
    /** Optional expiration date for the token */
    expires_at?: string
    /** Optional array of contractor Spectrum IDs that this token can access */
    contractor_spectrum_ids?: string[]
  }
}
export type ListApiTokensApiResponse = /** status 200 List of tokens */ {
  data?: {
    id?: string
    name?: string
    description?: string | null
    scopes?: string[]
    contractor_spectrum_ids?: string[]
    expires_at?: string | null
    created_at?: string
    updated_at?: string
    last_used_at?: string | null
  }[]
}
export type ListApiTokensApiArg = void
export type GetApiTokenApiResponse = /** status 200 Token details */ {
  data?: {
    id?: string
    name?: string
    description?: string | null
    scopes?: string[]
    contractor_spectrum_ids?: string[]
    expires_at?: string | null
    created_at?: string
    updated_at?: string
    last_used_at?: string | null
  }
}
export type GetApiTokenApiArg = {
  /** ID of the token to retrieve */
  tokenId: string
}
export type UpdateApiTokenApiResponse =
  /** status 200 Token updated successfully */ {
    data?: {
      id?: string
      name?: string
      description?: string | null
      scopes?: string[]
      contractor_spectrum_ids?: string[]
      expires_at?: string | null
      created_at?: string
      updated_at?: string
    }
  }
export type UpdateApiTokenApiArg = {
  /** ID of the token to update */
  tokenId: string
  body: {
    /** Name for the API token */
    name?: string
    /** Optional description for the API token */
    description?: string
    /** Array of scopes for the token. Admin scopes (admin:*, admin) and moderation scopes (moderation:*) are only available to admin users. */
    scopes?: (
      | "profile:read"
      | "profile:write"
      | "market:read"
      | "market:write"
      | "market:purchase"
      | "market:photos"
      | "orders:read"
      | "orders:write"
      | "orders:reviews"
      | "contractors:read"
      | "contractors:write"
      | "contractors:members"
      | "contractors:webhooks"
      | "contractors:blocklist"
      | "orgs:read"
      | "orgs:write"
      | "orgs:manage"
      | "services:read"
      | "services:write"
      | "services:photos"
      | "offers:read"
      | "offers:write"
      | "chats:read"
      | "chats:write"
      | "notifications:read"
      | "notifications:write"
      | "moderation:read"
      | "moderation:write"
      | "admin:read"
      | "admin:write"
      | "admin:spectrum"
      | "admin:stats"
      | "readonly"
      | "full"
      | "admin"
    )[]
    /** Optional expiration date for the token */
    expires_at?: string
    /** Optional array of contractor Spectrum IDs that this token can access. Set to null to remove all contractor access. */
    contractor_spectrum_ids?: string[]
  }
}
export type RevokeApiTokenApiResponse =
  /** status 200 Token revoked successfully */ {
    data?: {
      message?: string
    }
  }
export type RevokeApiTokenApiArg = {
  /** ID of the token to revoke */
  tokenId: string
}
export type ExtendApiTokenApiResponse =
  /** status 200 Token expiration extended successfully */ {
    data?: {
      message?: string
    }
  }
export type ExtendApiTokenApiArg = {
  /** ID of the token to extend */
  tokenId: string
  body: {
    /** New expiration date for the token */
    expires_at: string
  }
}
export type GetApiTokenStatsApiResponse = /** status 200 Token statistics */ {
  data?: {
    id?: string
    name?: string
    created_at?: string
    last_used_at?: string | null
    expires_at?: string | null
  }
}
export type GetApiTokenStatsApiArg = {
  /** ID of the token to get stats for */
  tokenId: string
}
export type GetAvailableScopesApiResponse =
  /** status 200 List of available scopes */ {
    data?: {
      /** Array of scope names available to the current user */
      scopes?: string[]
    }
  }
export type GetAvailableScopesApiArg = void
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
export type NotFound = {
  message: "Not Found"
}
export const {
  useCreateApiTokenMutation,
  useListApiTokensQuery,
  useGetApiTokenQuery,
  useUpdateApiTokenMutation,
  useRevokeApiTokenMutation,
  useExtendApiTokenMutation,
  useGetApiTokenStatsQuery,
  useGetAvailableScopesQuery,
} = injectedRtkApi
