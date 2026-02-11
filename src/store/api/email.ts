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
export const addTagTypes = ["Email"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getApiEmailPreferences: build.query<
        GetApiEmailPreferencesApiResponse,
        GetApiEmailPreferencesApiArg
      >({
        query: () => ({ url: `/api/email/preferences` }),
        providesTags: ["Email"],
      }),
      patchApiEmailPreferences: build.mutation<
        PatchApiEmailPreferencesApiResponse,
        PatchApiEmailPreferencesApiArg
      >({
        query: (queryArg) => ({
          url: `/api/email/preferences`,
          method: "PATCH",
          body: queryArg.updateEmailPreferencesRequest,
        }),
        invalidatesTags: ["Email"],
      }),
      postApiEmailUnsubscribeByToken: build.mutation<
        PostApiEmailUnsubscribeByTokenApiResponse,
        PostApiEmailUnsubscribeByTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/api/email/unsubscribe/${queryArg.token}`,
          method: "POST",
        }),
        invalidatesTags: ["Email"],
      }),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as emailApi }
export type GetApiEmailPreferencesApiResponse =
  /** status 200 Email preferences retrieved successfully */ EmailPreferencesResponse
export type GetApiEmailPreferencesApiArg = void
export type PatchApiEmailPreferencesApiResponse =
  /** status 200 Preferences updated successfully */ {
    preferences?: EmailPreference[]
    message?: string
  }
export type PatchApiEmailPreferencesApiArg = {
  updateEmailPreferencesRequest: UpdateEmailPreferencesRequest
}
export type PostApiEmailUnsubscribeByTokenApiResponse = unknown
export type PostApiEmailUnsubscribeByTokenApiArg = {
  /** Unsubscribe token */
  token: string
}
export type EmailPreference = {
  preference_id: string
  /** Notification action type ID */
  action_type_id: number
  /** Notification action name (e.g., 'order_create') */
  action_name?: string | null
  /** Whether email notifications are enabled */
  enabled: boolean
  /** Email frequency */
  frequency: "immediate" | "daily" | "weekly"
  /** Time for daily/weekly digests (HH:MM:SS format) */
  digest_time?: string | null
  created_at: string
  updated_at: string
}
export type EmailPreferencesResponse = {
  preferences: EmailPreference[]
  email: {
    email_id: string
    email: string
    email_verified: boolean
    is_primary: boolean
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
export type UpdateEmailPreferencesRequest = {
  preferences: {
    action_type_id: number
    enabled?: boolean
    frequency?: "immediate" | "daily" | "weekly"
    digest_time?: string | null
  }[]
}
export const {
  useGetApiEmailPreferencesQuery,
  usePatchApiEmailPreferencesMutation,
  usePostApiEmailUnsubscribeByTokenMutation,
} = injectedRtkApi
