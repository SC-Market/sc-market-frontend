import React from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { haptic } from "../../util/haptics"

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
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';

interface MobileFABProps extends FabProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  offset?: number // Additional offset from edges
  aboveBottomNav?: boolean // Position above mobile bottom nav
}

export function MobileFAB({
  position = "bottom-right",
  offset = 16,
  aboveBottomNav = true,
  onClick,
  sx,
  ...fabProps
}: MobileFABProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    haptic.light()
    onClick?.(event)
  }

  // Calculate position
  const getPositionStyles = () => {
    const bottomNavHeight = isMobile && aboveBottomNav ? 80 : 0 // 64px nav + 16px spacing
    const safeAreaBottom = isMobile ? "env(safe-area-inset-bottom)" : 0

    const positions: Record<string, any> = {
      "bottom-right": {
        bottom: `calc(${offset}px + ${bottomNavHeight}px + ${safeAreaBottom})`,
        right: `calc(${offset}px + env(safe-area-inset-right))`,
        top: "auto",
        left: "auto",
      },
      "bottom-left": {
        bottom: `calc(${offset}px + ${bottomNavHeight}px + ${safeAreaBottom})`,
        left: `calc(${offset}px + env(safe-area-inset-left))`,
        top: "auto",
        right: "auto",
      },
      "top-right": {
        top: `calc(${offset}px + env(safe-area-inset-top))`,
        right: `calc(${offset}px + env(safe-area-inset-right))`,
        bottom: "auto",
        left: "auto",
      },
      "top-left": {
        top: `calc(${offset}px + env(safe-area-inset-top))`,
        left: `calc(${offset}px + env(safe-area-inset-left))`,
        bottom: "auto",
        right: "auto",
      },
    }

    return positions[position]
  }

  return (
    <Fab
      {...fabProps}
      onClick={handleClick}
      sx={{
        position: "fixed",
        zIndex: theme.zIndex.speedDial,
        ...getPositionStyles(),
        ...sx,
      }}
    />
  )
}
