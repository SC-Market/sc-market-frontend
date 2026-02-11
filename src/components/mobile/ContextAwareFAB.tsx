/**
 * ContextAwareFAB Component
 * Floating Action Button that changes based on current page
 * Long-press to show all available actions
 */

import React, { useState, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { haptic } from "../../util/haptics"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/BoxProps';
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
import { FabProps } from '@mui/material/FabProps';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
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

interface Action {
  icon: React.ReactNode
  name: string
  onClick: () => void
}

export function ContextAwareFAB() {
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const bottomNavHeight = useBottomNavHeight()
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const longPressTimer = useRef<number | undefined>(undefined)

  if (!isMobile) return null

  const allActions: Action[] = [
    {
      icon: <StoreRounded />,
      name: "Create Listing",
      onClick: () => {
        navigate("/market/manage")
      },
    },
    {
      icon: <MessageRounded />,
      name: "New Message",
      onClick: () => {
        navigate("/messages")
      },
    },
    {
      icon: <DesignServicesRounded />,
      name: "Create Service",
      onClick: () => {
        navigate("/market/services")
      },
    },
    {
      icon: <InventoryRounded />,
      name: "Manage Stock",
      onClick: () => {
        navigate("/market/stock")
      },
    },
    {
      icon: <DescriptionRounded />,
      name: "View Contracts",
      onClick: () => {
        navigate("/contracts")
      },
    },
  ]

  const getPrimaryAction = (): Action | null => {
    const path = location.pathname
    if (path.includes("/market/manage")) {
      return allActions[0] // Create Listing
    }
    if (path === "/messages") {
      return allActions[1] // New Message
    }
    // Don't show on individual message pages
    if (path.includes("/messages/")) {
      return null
    }
    if (path.includes("/order/services")) {
      return allActions[2] // Create Service
    }
    if (path.includes("/market/stock")) {
      return allActions[3] // Manage Stock
    }
    // Don't show on /contracts page - it has its own FiltersFAB
    if (path === "/contracts" || path.startsWith("/contracts/public")) {
      return null
    }
    if (path.includes("/contracts")) {
      return allActions[4] // View Contracts
    }
    return null
  }

  const primaryAction = getPrimaryAction()

  // Don't show FAB if no primary action for current page
  if (!primaryAction && !speedDialOpen) return null

  const handleTouchStart = () => {
    longPressTimer.current = window.setTimeout(() => {
      setSpeedDialOpen(true)
      haptic.medium()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
    }
  }

  const handleClick = () => {
    if (primaryAction && !speedDialOpen) {
      haptic.light()
      primaryAction.onClick()
    }
  }

  return (
    <>
      {speedDialOpen ? (
        <SpeedDial
          ariaLabel="Quick actions"
          sx={{
            position: "fixed",
            bottom: bottomNavHeight + 16,
            right: 16,
            "& .MuiSpeedDial-fab": {
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            },
          }}
          icon={<AddRounded />}
          onClose={() => setSpeedDialOpen(false)}
          open={speedDialOpen}
        >
          {allActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                haptic.light()
                action.onClick()
                setSpeedDialOpen(false)
              }}
            />
          ))}
        </SpeedDial>
      ) : (
        <Fab
          color="primary"
          aria-label={primaryAction?.name}
          sx={{
            position: "fixed",
            bottom: bottomNavHeight + 16,
            right: 16,
          }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          {primaryAction?.icon}
        </Fab>
      )}
    </>
  )
}
