/**
 * Format notification action names for display
 */
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
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
export function formatNotificationAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get notification icon based on action type
 */
export function getNotificationIcon(action: string): string {
  const iconMap: Record<string, string> = {
    order_create: "create",
    order_assigned: "assignment",
    order_review: "rate_review",
    order_status_fulfilled: "check_circle",
    order_status_in_progress: "hourglass_empty",
    order_status_not_started: "schedule",
    order_status_cancelled: "cancel",
    order_comment: "comment",
    order_message: "message",
    contractor_invite: "group_add",
    market_item_bid: "gavel",
    market_item_offer: "local_offer",
    offer_create: "add_circle",
    counter_offer_create: "swap_horiz",
    offer_message: "chat",
    admin_alert: "notifications",
    order_review_revision_requested: "edit",
  }

  return iconMap[action] || "notifications"
}
