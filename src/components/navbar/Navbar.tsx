import {
  AppBar,
  Button,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  Badge,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import React from "react"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { useLocation, useNavigate } from "react-router-dom"
import { messagingDrawerWidth } from "../../features/chats"
import { NotificationsButton } from "./NotificationsButton"
import { MenuRounded, ShoppingCartRounded } from "@mui/icons-material"
import { ProfileNavAvatar } from "../../views/people/ProfileNavAvatar"
import { useGetUserProfileQuery } from "../../store/profile"
import { useTranslation } from "react-i18next"
import { Stack } from "@mui/system"
import { Link as RouterLink } from "react-router-dom"
import { useCookies } from "react-cookie"
import { HapticIconButton } from "../haptic"
import { PreferencesIconButton } from "../../views/settings/PreferencesIconButton"

export function Navbar(props: { children?: React.ReactNode }) {
  const theme: ExtendedTheme = useTheme()
  const profile = useGetUserProfileQuery()
  const [cookies] = useCookies(["cart"])
  const navigate = useNavigate()
  const location = useLocation()
  const isMessagingPage = location.pathname.startsWith("/messages")
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const { t } = useTranslation()

  const cartItemCount = cookies.cart?.items?.length || 0

  // Calculate total sidebar width (main sidebar + messaging sidebar if on messaging page)
  // On desktop, messaging sidebar is always open (unless collapsed), so account for it
  const totalSidebarWidth = drawerOpen ? sidebarDrawerWidth : 0
  const messagingSidebarWidth =
    isMessagingPage && !isMobile ? messagingDrawerWidth : 0

  const cartIconColor = theme.palette.getContrastText(
    theme.palette.background.navbar,
  )

  return (
    <AppBar
      elevation={0}
      position="absolute"
      component="nav"
      role="navigation"
      aria-label={t("accessibility.mainNavigation", "Main navigation")}
      sx={{
        zIndex: props.children
          ? theme.zIndex.drawer - 2
          : theme.zIndex.drawer - 1,
        marginLeft: {
          xs: 0,
          md: drawerOpen ? `${sidebarDrawerWidth}px` : 0,
        },
        width: {
          xs: "100%",
          md: `calc(100% - ${drawerOpen ? sidebarDrawerWidth : 0}px)`,
        },
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.easeOut,
          duration: "0.3s",
        }),
        background: theme.palette.background.navbar,
        // background: 'transparent',
        overflow: "hidden",
        borderRadius: 0,
        // borderColor: theme.palette.outline.main,
        // borderBottom: 1,
        // iOS safe area inset for notch/camera gap
        paddingTop: "env(safe-area-inset-top)",
        "& .MuiAppBar-root": {
          backgroundColor: "transparent",
          // backgroundColor: theme.palette.background.default
          overflow: "hidden",
        },
      }}
      // variant={theme.navKind}
    >
      <Toolbar
        sx={{
          paddingRight: 2, // keep right padding when drawer closed
          height: theme.spacing(8),
          // boxShadow: `0 3px 5px 3px ${theme.palette.primary.main}`,
          overflow: "visible",
          background: "transparent",
          paddingLeft: 2,
          ...(theme.navKind === "outlined"
            ? {
                // borderBottom: 1,
                // borderLeft: 1,
                borderColor: theme.palette.outline.main,
                boxShadow: "none",
                boxSizing: "border-box",
              }
            : {
                border: "none",
                boxShadow: `0px 5px 5px 0px ${theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)"}`,
              }),
        }}
      >
        {!drawerOpen && (
          <Tooltip title={t("navbar.toggle_drawer")}>
            <HapticIconButton
              color={"secondary"}
              onClick={() => setDrawerOpen(true)}
              sx={{ marginLeft: 0 }}
              aria-label={t(
                "accessibility.toggleSidebar",
                "Toggle sidebar menu",
              )}
              aria-expanded="false"
              aria-controls="sidebar-drawer"
            >
              <MenuRounded />
            </HapticIconButton>
          </Tooltip>
        )}

        {props.children}

        <Typography sx={{ flexGrow: 1 }}></Typography>

        {profile.data ? (
          <React.Fragment>
            <Tooltip title={t("navbar.cart", "Cart")}>
              <HapticIconButton
                onClick={() => navigate("/market/cart")}
                color="inherit"
                aria-label={t("navbar.cart", "Cart")}
                sx={{ color: cartIconColor }}
              >
                <Badge badgeContent={cartItemCount} color="primary">
                  <ShoppingCartRounded />
                </Badge>
              </HapticIconButton>
            </Tooltip>
            <NotificationsButton />
            <ProfileNavAvatar />
          </React.Fragment>
        ) : isMobile ? (
          <Stack direction="row" spacing={theme.layoutSpacing.compact} alignItems="center">
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="primary"
              size="small"
            >
              {t("auth.signIn", "Sign in")}
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              color="primary"
              size="small"
            >
              {t("auth.signUp", "Sign up")}
            </Button>
            <PreferencesIconButton />
          </Stack>
        ) : (
          <Stack direction="row" spacing={theme.layoutSpacing.compact}>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="primary"
            >
              {t("auth.signIn", "Sign in")}
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              color="primary"
            >
              {t("auth.signUp", "Sign up")}
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}
