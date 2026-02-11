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
export const addTagTypes = ["Starmap"] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      getStarmapRoute: build.query<
        GetStarmapRouteApiResponse,
        GetStarmapRouteApiArg
      >({
        query: (queryArg) => ({
          url: `/api/starmap/route/${queryArg["from"]}/${queryArg.to}`,
        }),
        providesTags: ["Starmap"],
      }),
      getCelestialObject: build.query<
        GetCelestialObjectApiResponse,
        GetCelestialObjectApiArg
      >({
        query: (queryArg) => ({
          url: `/api/starmap/route/${queryArg.identifier}`,
        }),
        providesTags: ["Starmap"],
      }),
      searchStarmap: build.query<SearchStarmapApiResponse, SearchStarmapApiArg>(
        {
          query: (queryArg) => ({
            url: `/api/starmap/search/${queryArg.query}`,
          }),
          providesTags: ["Starmap"],
        },
      ),
    }),
    overrideExisting: false,
  })
export { injectedRtkApi as starmapApi }
export type GetStarmapRouteApiResponse =
  /** status 200 Route retrieved successfully */ StarmapRoute
export type GetStarmapRouteApiArg = {
  /** Starting location */
  from: string
  /** Destination location */
  to: string
}
export type GetCelestialObjectApiResponse =
  /** status 200 Celestial object retrieved successfully */ StarmapObject
export type GetCelestialObjectApiArg = {
  /** Celestial object identifier */
  identifier: string
}
export type SearchStarmapApiResponse =
  /** status 200 Search results retrieved successfully */ StarmapSearchResult
export type SearchStarmapApiArg = {
  /** Search query */
  query: string
}
export type StarmapRoute = {
  /** Route distance */
  distance?: number
  /** Travel time in seconds */
  duration?: number
  waypoints?: {
    name?: string
    coordinates?: {
      x?: number
      y?: number
      z?: number
    }
  }[]
}
export type BadRequest = {
  errors?: {
    message: string
  }[]
  message: string
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
export type StarmapObject = {
  id?: string
  name?: string
  type?: string
  coordinates?: {
    x?: number
    y?: number
    z?: number
  }
  description?: string | null
}
export type StarmapSearchResult = {
  results?: StarmapObject[]
}
export const {
  useGetStarmapRouteQuery,
  useGetCelestialObjectQuery,
  useSearchStarmapQuery,
} = injectedRtkApi
