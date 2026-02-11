import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';

export type ValidationErrorType =
  | "negative_quantity"
  | "over_allocation"
  | "character_limit"
  | "required_field"
  | "invalid_format"
  | "generic"

export interface ValidationError {
  type: ValidationErrorType
  message: string
  field?: string
  limit?: number
  current?: number
}

interface ValidationErrorAlertProps {
  errors: ValidationError[]
  onDismiss?: () => void
}

export function ValidationErrorAlert({
  errors,
  onDismiss,
}: ValidationErrorAlertProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <Alert severity="error" icon={<ErrorOutlineRounded />} onClose={onDismiss}>
      <Stack spacing={0.5}>
        {errors.length === 1 ? (
          <Typography variant="body2">{errors[0].message}</Typography>
        ) : (
          <>
            <Typography variant="body2" fontWeight="medium">
              Please fix the following errors:
            </Typography>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2" component="div">
                • {error.message}
              </Typography>
            ))}
          </>
        )}
      </Stack>
    </Alert>
  )
}

/**
 * Helper function to create validation errors with consistent messaging
 */
export const createValidationError = {
  negativeQuantity: (field: string = "Quantity"): ValidationError => ({
    type: "negative_quantity",
    message: `${field} cannot be negative`,
    field,
  }),

  overAllocation: (
    allocated: number,
    available: number,
    field?: string,
  ): ValidationError => ({
    type: "over_allocation",
    message: field
      ? `${field} allocation (${allocated}) exceeds available quantity (${available})`
      : `Allocation (${allocated}) exceeds available quantity (${available})`,
    current: allocated,
    limit: available,
  }),

  characterLimit: (
    field: string,
    current: number,
    limit: number,
  ): ValidationError => ({
    type: "character_limit",
    message: `${field} exceeds maximum length of ${limit} characters (current: ${current})`,
    field,
    current,
    limit,
  }),

  requiredField: (field: string): ValidationError => ({
    type: "required_field",
    message: `${field} is required`,
    field,
  }),

  invalidFormat: (field: string, expected: string): ValidationError => ({
    type: "invalid_format",
    message: `${field} has invalid format. Expected: ${expected}`,
    field,
  }),

  generic: (message: string): ValidationError => ({
    type: "generic",
    message,
  }),
}
