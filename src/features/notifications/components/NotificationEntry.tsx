import { Notification } from "../../../hooks/login/UserProfile"
import {
  NotificationOrderCreate,
  NotificationOfferCreate,
  NotificationOfferMessage,
  NotificationOrderComment,
  NotificationOrderReview,
  NotificationOrderMessage,
  NotificationOrderUpdateStatus,
  NotificationBid,
  NotificationAdminAlert,
  NotificationReviewRevisionRequest,
  NotificationContractorInvite,
} from "../types"

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

export function NotificationEntry(props: { notif: Notification }) {
  const { notif } = props
  switch (notif.action) {
    case "order_create":
      return <NotificationOrderCreate notif={notif} />
    case "offer_create":
    case "counter_offer_create":
      return <NotificationOfferCreate notif={notif} />
    case "offer_message":
      return <NotificationOfferMessage notif={notif} />
    case "contractor_invite":
      return <NotificationContractorInvite notif={notif} />
    case "order_assigned":
      return <NotificationOrderCreate notif={notif} />
    case "order_comment":
      return <NotificationOrderComment notif={notif} />
    case "order_review":
      return <NotificationOrderReview notif={notif} />
    case "order_message":
      return <NotificationOrderMessage notif={notif} />
    case "order_status_fulfilled":
    case "order_status_in_progress":
    case "order_status_not_started":
    case "order_status_cancelled":
      return <NotificationOrderUpdateStatus notif={notif} />
    case "market_item_bid":
      return <NotificationBid notif={notif} />
    case "admin_alert":
      return <NotificationAdminAlert notif={notif} />
    case "order_review_revision_requested":
      return <NotificationReviewRevisionRequest notif={notif} />
    default:
      return null
  }
}
