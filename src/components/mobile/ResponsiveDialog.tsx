/**
 * ResponsiveDialog Component
 *
 * A responsive dialog that uses:
 * - Dialog on desktop/tablet
 * - BottomSheet on mobile
 *
 * This provides a better mobile UX while maintaining familiar desktop patterns.
 */

import React, { ReactNode } from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "./BottomSheet"

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

interface ResponsiveDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  actions?: ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false
  fullWidth?: boolean
  fullHeight?: boolean
  disableBackdropClose?: boolean
}

/**
 * ResponsiveDialog
 *
 * Automatically switches between Dialog (desktop) and BottomSheet (mobile)
 * based on screen size.
 */
export function ResponsiveDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  fullHeight = false,
  disableBackdropClose = false,
}: ResponsiveDialogProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Mobile: Use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        fullHeight={fullHeight}
        disableBackdropClose={disableBackdropClose}
        showCloseButton={false} // We'll add our own in the title
      >
        {/* Custom header with close button */}
        {title && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              pb: 1,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseRounded />
            </IconButton>
          </Box>
        )}

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", mb: actions ? 2 : 0 }}>
          {children}
        </Box>

        {/* Actions */}
        {actions && (
          <Box
            sx={{
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            {actions}
          </Box>
        )}
      </BottomSheet>
    )
  }

  // Desktop: Use Dialog
  return (
    <Dialog
      open={open}
      onClose={disableBackdropClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  )
}
