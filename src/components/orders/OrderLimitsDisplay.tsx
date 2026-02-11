import React from "react"
import { OrderLimits } from "../../store/orderSettings"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { TypographyProps } from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import FilterList from '@mui/icons-material/FilterList';
import AddRounded from '@mui/icons-material/AddRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import MessageRounded from '@mui/icons-material/MessageRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface OrderLimitsDisplayProps {
  limits: OrderLimits
  currentSize?: number // Current order size (sum of quantities)
  currentValue?: number // Current order value (cost)
  showValidation?: boolean // Show real-time validation feedback
}

type ValidationState = "info" | "warning" | "error" | "success"

function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value
  return num.toLocaleString("en-US")
}

function getSizeValidationState(
  limits: OrderLimits,
  currentSize: number,
  showValidation: boolean,
): ValidationState | null {
  if (!showValidation) return null

  const minSize = limits.min_order_size
    ? parseInt(limits.min_order_size, 10)
    : null
  const maxSize = limits.max_order_size
    ? parseInt(limits.max_order_size, 10)
    : null

  if (minSize !== null && currentSize < minSize) {
    return "error"
  }
  if (maxSize !== null && currentSize > maxSize) {
    return "error"
  }
  if (minSize !== null && currentSize < minSize * 1.1) {
    return "warning"
  }
  if (maxSize !== null && currentSize > maxSize * 0.9) {
    return "warning"
  }
  if (minSize !== null || maxSize !== null) {
    return "success"
  }
  return null
}

function getValueValidationState(
  limits: OrderLimits,
  currentValue: number,
  showValidation: boolean,
): ValidationState | null {
  if (!showValidation) return null

  const minValue = limits.min_order_value
    ? parseInt(limits.min_order_value, 10)
    : null
  const maxValue = limits.max_order_value
    ? parseInt(limits.max_order_value, 10)
    : null

  if (minValue !== null && currentValue < minValue) {
    return "error"
  }
  if (maxValue !== null && currentValue > maxValue) {
    return "error"
  }
  if (minValue !== null && currentValue < minValue * 1.1) {
    return "warning"
  }
  if (maxValue !== null && currentValue > maxValue * 0.9) {
    return "warning"
  }
  if (minValue !== null || maxValue !== null) {
    return "success"
  }
  return null
}

export function OrderLimitsDisplay({
  limits,
  currentSize,
  currentValue,
  showValidation = false,
}: OrderLimitsDisplayProps) {
  // Check if any limits are set
  const hasLimits =
    limits.min_order_size ||
    limits.max_order_size ||
    limits.min_order_value ||
    limits.max_order_value

  if (!hasLimits) {
    return null // Don't display anything if no limits are set
  }

  const sizeState =
    currentSize !== undefined
      ? getSizeValidationState(limits, currentSize, showValidation)
      : null
  const valueState =
    currentValue !== undefined
      ? getValueValidationState(limits, currentValue, showValidation)
      : null

  const hasErrors = sizeState === "error" || valueState === "error"
  const hasWarnings = sizeState === "warning" || valueState === "warning"

  // Determine overall severity
  let severity: "info" | "warning" | "error" = "info"
  if (hasErrors) {
    severity = "error"
  } else if (hasWarnings) {
    severity = "warning"
  }

  return (
    <Alert severity={severity} icon={<Info />}>
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        Order Requirements
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {/* Size limits */}
        {(limits.min_order_size || limits.max_order_size) && (
          <Box>
            <Typography variant="body2" component="span">
              <strong>Size:</strong>{" "}
              {limits.min_order_size && (
                <span>Min {formatCurrency(limits.min_order_size)} items</span>
              )}
              {limits.min_order_size && limits.max_order_size && " • "}
              {limits.max_order_size && (
                <span>Max {formatCurrency(limits.max_order_size)} items</span>
              )}
            </Typography>
            {showValidation && currentSize !== undefined && (
              <Box sx={{ ml: 2, mt: 0.5 }}>
                {sizeState === "error" && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <ErrorIcon fontSize="small" />
                    Current size ({currentSize}){" "}
                    {limits.min_order_size &&
                      currentSize < parseInt(limits.min_order_size, 10) &&
                      `is below minimum (${formatCurrency(limits.min_order_size)})`}
                    {limits.max_order_size &&
                      currentSize > parseInt(limits.max_order_size, 10) &&
                      `exceeds maximum (${formatCurrency(limits.max_order_size)})`}
                  </Typography>
                )}
                {sizeState === "warning" && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Warning fontSize="small" />
                    Current size ({currentSize}) is close to limit
                  </Typography>
                )}
                {sizeState === "success" && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CheckCircle fontSize="small" />
                    Size meets requirements
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Value limits */}
        {(limits.min_order_value || limits.max_order_value) && (
          <Box>
            <Typography variant="body2" component="span">
              <strong>Value:</strong>{" "}
              {limits.min_order_value && (
                <span>Min {formatCurrency(limits.min_order_value)} aUEC</span>
              )}
              {limits.min_order_value && limits.max_order_value && " • "}
              {limits.max_order_value && (
                <span>Max {formatCurrency(limits.max_order_value)} aUEC</span>
              )}
            </Typography>
            {showValidation && currentValue !== undefined && (
              <Box sx={{ ml: 2, mt: 0.5 }}>
                {valueState === "error" && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <ErrorIcon fontSize="small" />
                    Current value ({formatCurrency(currentValue)}){" "}
                    {limits.min_order_value &&
                      currentValue < parseInt(limits.min_order_value, 10) &&
                      `is below minimum (${formatCurrency(limits.min_order_value)})`}
                    {limits.max_order_value &&
                      currentValue > parseInt(limits.max_order_value, 10) &&
                      `exceeds maximum (${formatCurrency(limits.max_order_value)})`}
                  </Typography>
                )}
                {valueState === "warning" && (
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Warning fontSize="small" />
                    Current value ({formatCurrency(currentValue)}) is close to
                    limit
                  </Typography>
                )}
                {valueState === "success" && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <CheckCircle fontSize="small" />
                    Value meets requirements
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Alert>
  )
}
