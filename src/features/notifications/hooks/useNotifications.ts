import { useCallback } from "react"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../api/notificationApi"
import type { NotificationScope } from "../domain/types"
import { useNotificationPollingInterval } from "../../../hooks/notifications/useNotificationPolling"

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

/**
 * Hook for managing notifications with filtering and pagination
 */
export function useNotifications(
  page: number = 0,
  pageSize: number = 20,
  scope: NotificationScope = "all",
  contractorId?: string,
) {
  // Calculate optimal polling interval based on push subscription and app visibility
  const pollingInterval = useNotificationPollingInterval()

  const { data, refetch, isLoading, error } = useGetNotificationsQuery(
    {
      page,
      pageSize,
      scope: scope !== "all" ? scope : undefined,
      contractorId: contractorId || undefined,
    },
    {
      pollingInterval: pollingInterval > 0 ? pollingInterval : undefined,
      refetchOnMountOrArgChange: true,
    },
  )

  const notifications = data?.notifications || []
  const pagination = data?.pagination
  const unreadCount = data?.unread_count || 0

  const [bulkUpdate] = useNotificationBulkUpdateMutation()
  const [bulkDelete] = useNotificationBulkDeleteMutation()

  const markAllAsRead = useCallback(async () => {
    return await bulkUpdate({ read: true }).unwrap()
  }, [bulkUpdate])

  const deleteAll = useCallback(async () => {
    return await bulkDelete({}).unwrap()
  }, [bulkDelete])

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAllAsRead,
    deleteAll,
  }
}
