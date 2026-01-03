import React, { useRef, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
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
} from "@mui/icons-material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"

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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Only show on xs devices (not sm) - check this BEFORE hooks to avoid hook order issues
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"))

  // Track keyboard visibility to hide bottom nav
  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      // On mobile, if viewport height is significantly reduced, keyboard is likely open
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const screenHeight = window.screen.height
      // If viewport is less than 75% of screen height, assume keyboard is open
      setIsKeyboardOpen(viewportHeight < screenHeight * 0.75)
    }

    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      return () => {
        window.visualViewport?.removeEventListener("resize", handleResize)
      }
    } else {
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [isMobile])

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
    if (path === "/") return "home"
    return ""
  }

  const activeValue = getActiveValue()

  // Update indicator position when active value changes
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
  }, [activeValue, location.pathname, isMobile])

  // Early return AFTER all hooks to maintain hook order
  if (!isMobile) {
    return null
  }

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
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
    }
  }

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.drawer + 1, // Above sidebar but below modals
        borderTop: `1px solid ${theme.palette.outline.main}`,
        display: { xs: isKeyboardOpen ? "none" : "block", sm: "none" }, // Hide when keyboard is open
        // Add padding for safe area on iOS devices
        paddingBottom: "env(safe-area-inset-bottom)",
        transition: "transform 0.2s ease-in-out",
        transform: isKeyboardOpen ? "translateY(100%)" : "translateY(0)",
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
            "& .MuiBottomNavigationAction-root": {
              color: theme.palette.text.secondary,
              minWidth: 0,
              padding: "6px 12px",
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
          <BottomNavigationAction
            label={t("sidebar.market_short", "Market")}
            value="market"
            icon={<StoreRounded />}
            data-value="market"
          />
          <BottomNavigationAction
            label={t("sidebar.services_short", "Services")}
            value="services"
            icon={<DesignServicesRounded />}
            data-value="services"
          />
          {isLoggedIn && (
            <BottomNavigationAction
              label={t("sidebar.messaging", "Messages")}
              value="messages"
              icon={<ForumRounded />}
              data-value="messages"
            />
          )}
          {isLoggedIn && (
            <BottomNavigationAction
              label={t("sidebar.orders.text", "Orders")}
              value="orders"
              icon={<CreateRounded />}
              data-value="orders"
            />
          )}
          {isLoggedIn && (
            <BottomNavigationAction
              label={t("sidebar.dashboard.text", "Dashboard")}
              value="dashboard"
              icon={<DashboardRounded />}
              data-value="dashboard"
            />
          )}
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
