import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import { Contractor } from "../../../datatypes/Contractor"
import type {
  ApiToken,
  CreateTokenRequest,
  UpdateTokenRequest,
  TokenStats,
  ExtendTokenRequest,
} from "../domain/types"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useTheme } from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';

// Re-export types for convenience
export type {
  ApiToken,
  CreateTokenRequest,
  UpdateTokenRequest,
  TokenStats,
  ExtendTokenRequest,
} from "../domain/types"

const baseUrl = `${BACKEND_URL}/api`

/**
 * API Tokens API endpoints
 */
export const tokensApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get all tokens for the current user
    getTokens: builder.query<ApiToken[], void>({
      query: () => "/tokens",
      transformResponse: unwrapResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ApiToken" as const, id })),
              { type: "ApiToken", id: "LIST" },
            ]
          : [{ type: "ApiToken", id: "LIST" }],
    }),

    // Get a specific token
    getToken: builder.query<ApiToken, string>({
      query: (tokenId) => `/tokens/${tokenId}`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, tokenId) => [
        { type: "ApiToken", id: tokenId },
      ],
    }),

    // Create a new token
    createToken: builder.mutation<
      { token: string; data: ApiToken },
      CreateTokenRequest
    >({
      query: (body) => ({
        url: "/tokens",
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: [{ type: "ApiToken", id: "LIST" }],
    }),

    // Update a token
    updateToken: builder.mutation<
      ApiToken,
      { tokenId: string; body: UpdateTokenRequest }
    >({
      query: ({ tokenId, body }) => ({
        url: `/tokens/${tokenId}`,
        method: "PUT",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { tokenId }) => [
        { type: "ApiToken", id: tokenId },
        { type: "ApiToken", id: "LIST" },
      ],
    }),

    // Delete a token
    deleteToken: builder.mutation<void, string>({
      query: (tokenId) => ({
        url: `/tokens/${tokenId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, tokenId) => [
        { type: "ApiToken", id: tokenId },
        { type: "ApiToken", id: "LIST" },
      ],
    }),

    // Extend token expiration
    extendToken: builder.mutation<
      ApiToken,
      { tokenId: string; body: ExtendTokenRequest }
    >({
      query: ({ tokenId, body }) => ({
        url: `/tokens/${tokenId}/extend`,
        method: "POST",
        body,
      }),
      transformResponse: unwrapResponse,
      invalidatesTags: (result, error, { tokenId }) => [
        { type: "ApiToken", id: tokenId },
        { type: "ApiToken", id: "LIST" },
      ],
    }),

    // Get token statistics
    getTokenStats: builder.query<TokenStats, string>({
      query: (tokenId) => `/tokens/${tokenId}/stats`,
      transformResponse: unwrapResponse,
      providesTags: (result, error, tokenId) => [
        { type: "ApiToken", id: tokenId },
      ],
    }),

    // Get contractors for token creation
    getContractorsForTokens: builder.query<Contractor[], void>({
      query: () => "/contractors",
      transformResponse: (response: { data: Contractor[] }) => response.data,
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetTokensQuery,
  useGetTokenQuery,
  useCreateTokenMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
  useExtendTokenMutation,
  useGetTokenStatsQuery,
  useGetContractorsForTokensQuery,
} = tokensApi
