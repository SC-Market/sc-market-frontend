import React, { ReactNode, useEffect, useRef } from "react"
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
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface MobileSidebarWrapperProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  anchor?: "left" | "right" | "top" | "bottom"
  drawerWidth?: number | string
  showCloseButton?: boolean
}

export function MobileSidebarWrapper({
  open,
  onClose,
  children,
  title,
  anchor = "left",
  drawerWidth = 300,
  showCloseButton = true,
}: MobileSidebarWrapperProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // On mobile, use BottomSheet with swipe-down to dismiss
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        showCloseButton={showCloseButton}
        maxHeight="90vh"
      >
        {children}
      </BottomSheet>
    )
  }

  // On desktop, use Drawer
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: drawerWidth,
        },
      }}
    >
      {title && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: 1,
            borderColor: theme.palette.divider,
          }}
        >
          {showCloseButton && (
            <IconButton onClick={onClose} size="small">
              <CloseRounded />
            </IconButton>
          )}
        </Box>
      )}
      <Box sx={{ p: 2, overflow: "auto" }}>{children}</Box>
    </Drawer>
  )
}
