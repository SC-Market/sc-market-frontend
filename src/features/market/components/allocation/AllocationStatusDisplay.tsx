/**
 * AllocationStatusDisplay Component
 *
 * Displays allocation status for an order in a compact format.
 * Shows total allocated quantity and provides a link to view details.
 *
 * Requirements: 5.3, 6.1, 6.2, 6.3
 */

import React from "react"
import { useGetOrderAllocationsQuery } from "../../../../store/api/stockLotsApi"

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

interface AllocationStatusDisplayProps {
  orderId: string
  orderQuantity?: number
  compact?: boolean
  showDetailsLink?: boolean
}

export function AllocationStatusDisplay({
  orderId,
  orderQuantity,
  compact = false,
  showDetailsLink = false,
}: AllocationStatusDisplayProps) {
  const {
    data: allocationsData,
    isLoading,
    error,
  } = useGetOrderAllocationsQuery({ order_id: orderId })

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Loading allocation status...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return null // Silently fail - allocations may not exist for all orders
  }

  if (!allocationsData || allocationsData.grouped_allocations.length === 0) {
    return null // No allocations to display
  }

  const { grouped_allocations, total_allocated } = allocationsData
  const hasActiveAllocations = grouped_allocations.some(
    (a: any) => a.status === "active",
  )
  const allFulfilled = grouped_allocations.every(
    (a: any) => a.status === "fulfilled",
  )
  const allReleased = grouped_allocations.every(
    (a: any) => a.status === "released",
  )

  const isPartial =
    orderQuantity !== undefined && total_allocated < orderQuantity

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {hasActiveAllocations && (
          <Chip
            icon={<InventoryRounded />}
            label={`${total_allocated} allocated`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        {allFulfilled && (
          <Chip
            icon={<CheckCircleRounded />}
            label="Stock consumed"
            size="small"
            color="success"
            variant="outlined"
          />
        )}
        {allReleased && (
          <Chip
            icon={<CheckCircleRounded />}
            label="Stock released"
            size="small"
            color="info"
            variant="outlined"
          />
        )}
        {isPartial && (
          <Chip
            icon={<WarningRounded />}
            label="Partial"
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
      </Box>
    )
  }

  return (
    <Box>
      {hasActiveAllocations && (
        <Alert
          severity={isPartial ? "warning" : "info"}
          icon={<InventoryRounded />}
        >
          <Typography variant="body2">
            <strong>{total_allocated}</strong> units allocated from stock
            {orderQuantity !== undefined && ` (of ${orderQuantity} requested)`}
          </Typography>
          {isPartial && (
            <Typography variant="caption" color="text.secondary">
              Partial allocation - insufficient stock available
            </Typography>
          )}
          {showDetailsLink && (
            <Link
              href="#allocations"
              variant="caption"
              sx={{ display: "block", mt: 0.5 }}
            >
              View allocation details
            </Link>
          )}
        </Alert>
      )}

      {allFulfilled && (
        <Alert severity="success" icon={<CheckCircleRounded />}>
          <Typography variant="body2">
            Stock consumed - <strong>{total_allocated}</strong> units removed
            from inventory
          </Typography>
        </Alert>
      )}

      {allReleased && (
        <Alert severity="info" icon={<CheckCircleRounded />}>
          <Typography variant="body2">
            Stock released - <strong>{total_allocated}</strong> units returned
            to available inventory
          </Typography>
        </Alert>
      )}
    </Box>
  )
}
