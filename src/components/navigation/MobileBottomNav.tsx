import React, { useRef, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { useUnreadChatCount } from "../../features/chats"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { usePendingOrderCount } from "../../hooks/orders/usePendingOrderCount"
import { haptic } from "../../util/haptics"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"

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

interface NavTabConfig {
  id: string
  label: string
  icon: React.ReactElement
  route: string
  requiresAuth?: boolean
  badge?: number
}

const DEFAULT_LOGGED_OUT_TABS = [
  "market",
  "services",
  "contracts",
  "recruiting",
]
const DEFAULT_LOGGED_IN_TABS = [
  "market",
  "services",
  "messages",
  "orders",
  "dashboard",
]

/**
 * Mobile bottom navigation bar for quick access to primary pages
 * Only visible on mobile devices (xs and sm breakpoints)
 */
export function MobileBottomNav() {
  const theme = useTheme<ExtendedTheme>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: userProfile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()
  const isLoggedIn = !!userProfile
  const unreadChatCount = useUnreadChatCount()
  const pendingOrderCount = usePendingOrderCount()
  const bottomNavHeight = useBottomNavHeight()

  // Only show on xs devices (not sm) - check this BEFORE hooks to avoid hook order issues
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"))

  // Bottom nav is hidden when keyboard is open (height is 0)
  const isKeyboardOpen = bottomNavHeight === 0 && isMobile

  const navRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number
    width: number
  }>({ left: 0, width: 0 })

  const getTabConfig = (tabId: string): NavTabConfig | null => {
    const configs: Record<string, NavTabConfig> = {
      market: {
        id: "market",
        label: "sidebar.market_short",
        icon: <StoreRounded />,
        route: "/market",
      },
      services: {
        id: "services",
        label: "sidebar.services_short",
        icon: <DesignServicesRounded />,
        route: "/market/services",
      },
      contracts: {
        id: "contracts",
        label: "sidebar.contracts_short",
        icon: <DescriptionRounded />,
        route: "/contracts",
      },
      recruiting: {
        id: "recruiting",
        label: "sidebar.recruiting_short",
        icon: <PersonAddRounded />,
        route: "/recruiting",
      },
      messages: {
        id: "messages",
        label: "sidebar.messaging",
        icon: <ForumRounded />,
        route: "/messages",
        requiresAuth: true,
        badge: unreadChatCount,
      },
      orders: {
        id: "orders",
        label: "sidebar.orders.text",
        icon: <CreateRounded />,
        route: "/orders",
        requiresAuth: true,
        badge: pendingOrderCount,
      },
      dashboard: {
        id: "dashboard",
        label: "sidebar.dashboard.text",
        icon: <DashboardRounded />,
        route: "/dashboard",
        requiresAuth: true,
      },
      contractors: {
        id: "contractors",
        label: "sidebar.contractors_short",
        icon: <BusinessRounded />,
        route: "/contractors",
      },
      availability: {
        id: "availability",
        label: "sidebar.availability_short",
        icon: <CalendarMonthRounded />,
        route: "/availability",
        requiresAuth: true,
      },
      "manage-listings": {
        id: "manage-listings",
        label: "sidebar.listings_short",
        icon: <ListAltRounded />,
        route: "/market/manage?quantityAvailable=0",
        requiresAuth: true,
      },
      "manage-stock": {
        id: "manage-stock",
        label: "sidebar.stock_short",
        icon: <WarehouseRounded />,
        route: "/market/manage-stock",
        requiresAuth: true,
      },
      "manage-services": {
        id: "manage-services",
        label: "sidebar.services_short",
        icon: <DashboardCustomizeRounded />,
        route: "/order/services",
        requiresAuth: true,
      },
      "org-dashboard": {
        id: "org-dashboard",
        label: "sidebar.dashboard.text",
        icon: <AssignmentTurnedInRounded />,
        route: "/dashboard",
        requiresAuth: true,
      },
      "org-public": {
        id: "org-public",
        label: "sidebar.org_public_page",
        icon: <StoreRounded />,
        route: currentOrg
          ? `/contractor/${currentOrg.spectrum_id}`
          : "/contractors",
        requiresAuth: true,
      },
      "org-availability": {
        id: "org-availability",
        label: "sidebar.availability_short",
        icon: <CalendarMonthRounded />,
        route: "/availability",
        requiresAuth: true,
      },
    }
    return configs[tabId] || null
  }

  const getActiveTabs = (): NavTabConfig[] => {
    const defaultTabs = isLoggedIn
      ? DEFAULT_LOGGED_IN_TABS
      : DEFAULT_LOGGED_OUT_TABS

    // Only use saved tabs if logged in
    const saved = isLoggedIn ? localStorage.getItem("mobile_nav_tabs") : null
    const userTabs = saved ? JSON.parse(saved) : null
    const tabIds = userTabs || defaultTabs

    return tabIds
      .map((id: string) => getTabConfig(id))
      .filter((tab: NavTabConfig | null): tab is NavTabConfig => {
        if (!tab) return false
        if (tab.requiresAuth && !isLoggedIn) return false
        return true
      })
      .slice(0, 5)
  }

  const [activeTabs, setActiveTabs] = useState<NavTabConfig[]>(getActiveTabs())

  // Update tabs when login state changes
  useEffect(() => {
    setActiveTabs(getActiveTabs())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  // Listen for settings updates
  useEffect(() => {
    const handleUpdate = () => setActiveTabs(getActiveTabs())
    window.addEventListener("mobile-nav-updated", handleUpdate)
    return () => window.removeEventListener("mobile-nav-updated", handleUpdate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  // Determine current active route
  const getActiveValue = () => {
    const path = location.pathname
    for (const tab of activeTabs) {
      if (path.startsWith(tab.route)) return tab.id
    }
    return ""
  }

  const activeValue = getActiveValue()

  // Update indicator position when active value changes or login state changes
  useEffect(() => {
    if (!isMobile || !navRef.current) return

    const activeButton = navRef.current.querySelector(
      `.MuiBottomNavigationAction-root[data-value="${activeValue}"]`,
    ) as HTMLElement

    if (activeButton) {
      const navRect = navRef.current.getBoundingClientRect()
      const buttonRect = activeButton.getBoundingClientRect()
      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      })
    }
  }, [activeValue, location.pathname, isMobile, isLoggedIn])

  // Early return AFTER all hooks to maintain hook order
  if (!isMobile) {
    return null
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    // Haptic feedback on tab switch
    haptic.selection()

    const tab = activeTabs.find((t) => t.id === newValue)
    if (tab) {
      if (tab.requiresAuth && !isLoggedIn) {
        navigate("/login")
      } else {
        navigate(tab.route)
      }
    }
  }

  return (
    <Paper
      sx={{
        position: "fixed", // Fixed at bottom, like navbar at top
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: `1px solid ${theme.palette.outline.main}`,
        borderRadius: 0,
        display: { xs: isKeyboardOpen ? "none" : "block", sm: "none" }, // Hide when keyboard is open
        // Add padding for safe area on iOS devices
        paddingBottom: "env(safe-area-inset-bottom)",
        transition: "opacity 0.2s ease-in-out, transform 0.2s ease-in-out",
        opacity: isKeyboardOpen ? 0 : 1,
        transform: isKeyboardOpen ? "translateY(100%)" : "translateY(0)",
        zIndex: theme.zIndex.drawer + 1, // Above sidebar but below modals
      }}
      elevation={3}
    >
      <Box sx={{ position: "relative" }}>
        <BottomNavigation
          ref={navRef}
          value={activeValue}
          onChange={handleChange}
          showLabels
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: 64, // Standard bottom nav height
            position: "relative",
            paddingLeft: 0,
            paddingRight: 0,
            "& .MuiBottomNavigationAction-root": {
              color: theme.palette.text.secondary,
              minWidth: 0,
              padding: "6px 0",
              "&.Mui-selected": {
                color: theme.palette.primary.main,
              },
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.75rem",
              marginTop: 0.5,
              "&.Mui-selected": {
                fontSize: "0.75rem",
              },
            },
          }}
        >
          {activeTabs.map((tab) => (
            <BottomNavigationAction
              key={tab.id}
              label={t(tab.label)}
              value={tab.id}
              icon={
                tab.badge ? (
                  <Badge
                    badgeContent={tab.badge}
                    color="primary"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.7rem",
                        minWidth: "18px",
                        height: "18px",
                        padding: "0 6px",
                      },
                    }}
                  >
                    {tab.icon}
                  </Badge>
                ) : (
                  tab.icon
                )
              }
              data-value={tab.id}
            />
          ))}
        </BottomNavigation>
        {/* Animated underline indicator */}
        {activeValue && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 2,
              backgroundColor: theme.palette.primary.main,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              width: indicatorStyle.width,
              transform: `translateX(${indicatorStyle.left}px)`,
            }}
          />
        )}
      </Box>
    </Paper>
  )
}
