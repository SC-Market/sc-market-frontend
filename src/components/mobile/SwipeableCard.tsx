import React, { ReactNode, useRef, useState } from "react"
import { useSwipeable } from "react-swipeable"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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

interface SwipeableCardProps {
  children: ReactNode
  leftActions?: ReactNode
  rightActions?: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number // Distance in pixels to trigger action
  disabled?: boolean
  CardProps?: any
}

export function SwipeableCard({
  children,
  leftActions,
  rightActions,
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  disabled = false,
  CardProps,
}: SwipeableCardProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (disabled || !isMobile) return
      setIsDragging(true)
      setTranslateX(eventData.deltaX)
    },
    onSwiped: (eventData) => {
      if (disabled || !isMobile) return
      setIsDragging(false)

      // Check if swipe distance exceeds threshold
      if (Math.abs(eventData.deltaX) >= threshold) {
        if (eventData.deltaX > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (eventData.deltaX < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      // Reset position
      setTranslateX(0)
    },
    onSwipedLeft: () => {
      if (disabled || !isMobile) return
      setTranslateX(0)
    },
    onSwipedRight: () => {
      if (disabled || !isMobile) return
      setTranslateX(0)
    },
    trackMouse: false, // Only track touch events
    preventScrollOnSwipe: true,
    trackTouch: true,
  })

  // Calculate action width
  const leftActionWidth = leftActions ? 80 : 0
  const rightActionWidth = rightActions ? 80 : 0

  // Clamp translateX to prevent over-swiping
  const clampedTranslateX = Math.max(
    -rightActionWidth,
    Math.min(leftActionWidth, translateX),
  )

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
      ref={cardRef}
    >
      {/* Left Actions (revealed when swiping right) */}
      {leftActions && (
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: leftActionWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            backgroundColor: theme.palette.primary.main,
            zIndex: 1,
            transform: `translateX(${
              clampedTranslateX > 0
                ? clampedTranslateX - leftActionWidth
                : -leftActionWidth
            }px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
            px: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            {leftActions}
          </Stack>
        </Box>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions && (
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: rightActionWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            backgroundColor: theme.palette.error.main,
            zIndex: 1,
            transform: `translateX(${
              clampedTranslateX < 0
                ? -clampedTranslateX - rightActionWidth
                : -rightActionWidth
            }px)`,
            transition: isDragging ? "none" : "transform 0.3s ease-out",
            px: 1,
          }}
        >
          <Stack direction="row" spacing={1}>
            {rightActions}
          </Stack>
        </Box>
      )}

      {/* Main Card */}
      <Card
        {...CardProps}
        {...(isMobile && !disabled ? handlers : {})}
        sx={{
          position: "relative",
          zIndex: 2,
          transform: `translateX(${clampedTranslateX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
          touchAction: "pan-y",
          userSelect: "none",
          ...CardProps?.sx,
        }}
      >
        {children}
      </Card>
    </Box>
  )
}
