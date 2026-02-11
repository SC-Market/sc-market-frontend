import { BACKEND_URL } from "../../../util/constants"
import { serviceApi } from "../../../store/service"
import { unwrapResponse } from "../../../store/api-utils"
import type {
  PushSubscriptionData,
  PushSubscription,
  GroupedPushPreferences,
} from "../domain/types"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import MaterialLink from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';

const baseUrl = `${BACKEND_URL}/api/push`

/**
 * Push notification API endpoints
 */
export const pushNotificationApi = serviceApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // Get user's push subscriptions
    getPushSubscriptions: builder.query<PushSubscription[], void>({
      query: () => ({
        url: `${baseUrl}/subscribe`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { subscriptions: PushSubscription[] }
      }) => {
        // Backend returns { data: { subscriptions: [...] } }
        const unwrapped = unwrapResponse(response) as {
          subscriptions: PushSubscription[]
        }
        return unwrapped.subscriptions
      },
      providesTags: ["PushSubscriptions" as const],
    }),

    // Subscribe to push notifications
    subscribePush: builder.mutation<
      { subscription_id: string; message: string },
      PushSubscriptionData
    >({
      query: (subscription) => ({
        url: `${baseUrl}/subscribe`,
        method: "POST",
        body: subscription,
      }),
      invalidatesTags: ["PushSubscriptions" as const],
    }),

    // Unsubscribe from push notifications
    unsubscribePush: builder.mutation<
      { message: string },
      string // subscription_id
    >({
      query: (subscriptionId) => ({
        url: `${baseUrl}/subscribe/${subscriptionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PushSubscriptions" as const],
    }),

    // Get push notification preferences (grouped by individual and organizations)
    getPushPreferences: builder.query<
      { preferences: GroupedPushPreferences },
      void
    >({
      query: () => ({
        url: `${baseUrl}/preferences`,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { preferences: GroupedPushPreferences }
      }) => {
        // Backend returns { data: { preferences: {...} } }
        const unwrapped = unwrapResponse(response) as {
          preferences: GroupedPushPreferences
        }
        return unwrapped
      },
      providesTags: ["PushPreferences" as const],
    }),

    // Update push notification preference (single or batch)
    updatePushPreference: builder.mutation<
      {
        message: string
        preferences?: Array<{
          action: string
          enabled: boolean
          contractor_id?: string | null
        }>
      },
      | { action: string; enabled: boolean; contractor_id?: string | null }
      | {
          preferences: Array<{
            action: string
            enabled: boolean
            contractor_id?: string | null
          }>
        }
    >({
      query: (body) => ({
        url: `${baseUrl}/preferences`,
        method: "PATCH",
        body: Array.isArray((body as any).preferences) ? body : body,
      }),
      invalidatesTags: ["PushPreferences" as const],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useGetPushSubscriptionsQuery,
  useSubscribePushMutation,
  useUnsubscribePushMutation,
  useGetPushPreferencesQuery,
  useUpdatePushPreferenceMutation,
} = pushNotificationApi
