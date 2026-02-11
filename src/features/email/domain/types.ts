/**
 * User email record
 */
import { SxProps } from '@mui/material/SxProps';

import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
export interface UserEmail {
  email_id: string
  email: string
  email_verified: boolean
  is_primary: boolean
}

/**
 * Email notification preference
 */
export interface EmailPreference {
  preference_id: string
  action_type_id: number
  action_name: string | null
  enabled: boolean
  frequency: "immediate" | "daily" | "weekly"
  digest_time: string | null
  created_at: string
  updated_at: string
  contractor_id?: string | null // NULL for individual preferences, UUID for org preferences
}

/**
 * Grouped email preferences response
 */
export interface GroupedEmailPreferences {
  individual: EmailPreference[]
  organizations: Array<{
    contractor_id: string
    preferences: EmailPreference[]
  }>
}

/**
 * Notification type (available notification action)
 */
export interface NotificationType {
  action_type_id: number
  action: string
  entity: string
  description: string | null
}

/**
 * Add email request
 */
export interface AddEmailRequest {
  email: string
  notificationTypeIds?: number[]
}

/**
 * Update email request
 */
export interface UpdateEmailRequest {
  email: string
}

/**
 * Update email preferences request
 */
export interface UpdateEmailPreferencesRequest {
  preferences: Array<{
    action_type_id: number
    enabled?: boolean
    frequency?: "immediate" | "daily" | "weekly"
    digest_time?: string | null
    contractor_id?: string | null // NULL for individual, UUID for org
  }>
}
