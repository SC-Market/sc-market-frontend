import React, { useRef, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material"
import {
  StoreRounded,
  CreateRounded,
  DashboardRounded,
  DesignServicesRounded,
  ForumRounded,
  DescriptionRounded,
  PersonAddRounded,
} from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { useUnreadChatCount } from "../../features/chats"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"
import { usePendingOrderCount } from "../../hooks/orders/usePendingOrderCount"
import { haptic } from "../../util/haptics"
import { useBottomNavTabs, BottomNavTab } from "../../hooks/settings/useBottomNavTabs"

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
  const isLoggedIn = !!userProfile
  const unreadChatCount = useUnreadChatCount()
  const pendingOrderCount = usePendingOrderCount()
  const bottomNavHeight = useBottomNavHeight()
  const { enabledTabs } = useBottomNavTabs(isLoggedIn)

  // Only show on xs devices (not sm) - check this BEFORE hooks to avoid hook order issues
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"))

  // Bottom nav is hidden when keyboard is open (height is 0)
  const isKeyboardOpen = bottomNavHeight === 0 && isMobile

  const navRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number
    width: number
  }>({ left: 0, width: 0 })

  // Determine current active route
  const getActiveValue = () => {
    const path = location.pathname
    if (path.startsWith("/market/services")) return "services"
    if (path.startsWith("/market")) return "market"
    if (path.startsWith("/messages")) return "messages"
    if (path.startsWith("/orders") && !path.startsWith("/org/orders"))
      return "orders"
    if (path.startsWith("/dashboard")) return "dashboard"
    if (path.startsWith("/contracts")) return "contracts"
    if (path.startsWith("/recruiting")) return "recruiting"
    if (path === "/") return "home"
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

    switch (newValue) {
      case "home":
        navigate("/")
        break
      case "market":
        navigate("/market")
        break
      case "services":
        navigate("/market/services")
        break
      case "messages":
        if (isLoggedIn) {
          navigate("/messages")
        } else {
          navigate("/login")
        }
        break
      case "orders":
        if (isLoggedIn) {
          navigate("/orders")
        } else {
          navigate("/login")
        }
        break
      case "dashboard":
        if (isLoggedIn) {
          navigate("/dashboard")
        } else {
          navigate("/login")
        }
        break
      case "contracts":
        navigate("/contracts")
        break
      case "recruiting":
        navigate("/recruiting")
        break
      case "contractors":
        navigate("/contractors")
        break
      case "manage_listings":
        if (isLoggedIn) {
          navigate("/market/manage")
        } else {
          navigate("/login")
        }
        break
      case "manage_stock":
        if (isLoggedIn) {
          navigate("/market/manage-stock")
        } else {
          navigate("/login")
        }
        break
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
          {enabledTabs.map((tabId: BottomNavTab) => {
            const getTabConfig = (id: BottomNavTab) => {
              switch (id) {
                case "market":
                  return {
                    label: t("sidebar.player_market", "Market"),
                    icon: <StoreRounded />,
                  }
                case "services":
                  return {
                    label: t("sidebar.contractor_services", "Services"),
                    icon: <DesignServicesRounded />,
                  }
                case "contracts":
                  return {
                    label: t("sidebar.open_contracts", "Contracts"),
                    icon: <DescriptionRounded />,
                  }
                case "recruiting":
                  return {
                    label: t("sidebar.recruiting", "Recruiting"),
                    icon: <PersonAddRounded />,
                  }
                case "contractors":
                  return {
                    label: t("sidebar.contractors", "Contractors"),
                    icon: <CreateRounded />,
                  }
                case "messages":
                  return {
                    label: t("sidebar.messaging", "Messages"),
                    icon: (
                      <Badge
                        badgeContent={unreadChatCount}
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
                        <ForumRounded />
                      </Badge>
                    ),
                  }
                case "orders":
                  return {
                    label: t("sidebar.orders_ive_placed", "Orders"),
                    icon: (
                      <Badge
                        badgeContent={pendingOrderCount}
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
                        <CreateRounded />
                      </Badge>
                    ),
                  }
                case "dashboard":
                  return {
                    label: t("sidebar.orders_assigned_to_me", "Dashboard"),
                    icon: <DashboardRounded />,
                  }
                case "manage_listings":
                  return {
                    label: t("sidebar.manage_listings", "Listings"),
                    icon: <StoreRounded />,
                  }
                case "manage_stock":
                  return {
                    label: t("sidebar.manage_stock", "Stock"),
                    icon: <StoreRounded />,
                  }
              }
            }

            const config = getTabConfig(tabId)
            return (
              <BottomNavigationAction
                key={tabId}
                label={config.label}
                value={tabId}
                icon={config.icon}
                data-value={tabId}
              />
            )
          })}
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
