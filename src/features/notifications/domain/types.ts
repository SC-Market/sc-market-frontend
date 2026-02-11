import { Contractor, ContractorInvite } from "../../../datatypes/Contractor"
import { Order, OrderComment, OrderReview } from "../../../datatypes/Order"
import { MarketBid, MarketListing } from "../../../features/market/index"
import { MinimalUser } from "../../../datatypes/User"
import { OfferSession } from "../../../store/offer"

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

/**
 * Notification entity types
 */
export type NotificationEntity =
  | ContractorInvite
  | Order
  | Contractor
  | MarketListing
  | MarketBid
  | OrderReview
  | OrderComment
  | OfferSession

/**
 * Notification action types
 */
export type NotificationAction =
  | "order_create"
  | "order_assigned"
  | "order_review"
  | "order_status_fulfilled"
  | "order_status_in_progress"
  | "order_status_not_started"
  | "order_status_cancelled"
  | "order_comment"
  | "order_message"
  | "contractor_invite"
  | "market_item_bid"
  | "market_item_offer"
  | "offer_create"
  | "counter_offer_create"
  | "offer_message"
  | "admin_alert"
  | "order_review_revision_requested"

/**
 * Notification scope
 */
export type NotificationScope = "individual" | "organization" | "all"

/**
 * Notification data structure
 */
export interface Notification {
  read: boolean
  notification_id: string
  action: string
  entity_type: string
  entity: NotificationEntity
  timestamp: string
  actors: MinimalUser[]
  scope?: NotificationScope
  contractor_id?: string | null
}

/**
 * Notification pagination response
 */
export interface NotificationPagination {
  total: number
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Notifications query response
 */
export interface NotificationsResponse {
  notifications: Notification[]
  pagination: NotificationPagination
  unread_count: number
}

/**
 * Notification query parameters
 */
export interface NotificationQueryParams {
  page?: number
  pageSize?: number
  action?: string
  entityId?: string
  scope?: NotificationScope
  contractorId?: string
}
