import { AppBar, IconButton, Toolbar, Tooltip, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import React from "react"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { NotificationsButton } from "./NotificationsButton"
import { MenuRounded } from "@mui/icons-material"
import { ProfileNavAvatar } from "../../views/people/ProfileNavAvatar"
import { useGetUserProfileQuery } from "../../store/profile"
import { DiscordLoginButton } from "../button/DiscordLoginButton"
import { useTranslation } from "react-i18next"

export function Navbar(props: { children?: React.ReactNode }) {
  const theme: ExtendedTheme = useTheme()
  const profile = useGetUserProfileQuery()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const { t } = useTranslation()

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
        // marginLeft: (drawerOpen ? sidebarDrawerWidth : 0),
        // width: `calc(100% - ${(drawerOpen ? sidebarDrawerWidth : 1) - 1}px)`,

        [theme.breakpoints.up("sm")]: {
          marginLeft: drawerOpen ? sidebarDrawerWidth : 0,
          width: `calc(100% - ${(drawerOpen ? sidebarDrawerWidth : 1) - 1}px)`,
        },
        [theme.breakpoints.down("sm")]: {
          width: drawerOpen ? 0 : "100%",
        },

        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.easeOut,
          duration: "0.3s",
        }),
        background: theme.palette.background.navbar,
        // background: 'transparent',
        overflow: "hidden",
        // borderColor: theme.palette.outline.main,
        // borderBottom: 1,
        "& .MuiAppBar-root": {
          backgroundColor: "rgba(0,0,0,0)",
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
          paddingLeft: 0,
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
                boxShadow: "0px 5px 5px 0px rgba(0, 0, 0)",
              }),
        }}
      >
        {!drawerOpen && (
          <Tooltip title={t("navbar.toggle_drawer")}>
            <IconButton
              color={"secondary"}
              onClick={() => setDrawerOpen(true)}
              sx={{ marginLeft: 2 }}
              aria-label={t(
                "accessibility.toggleSidebar",
                "Toggle sidebar menu",
              )}
              aria-expanded="false"
              aria-controls="sidebar-drawer"
            >
              <MenuRounded />
            </IconButton>
          </Tooltip>
        )}

        {props.children}

        <Typography sx={{ flexGrow: 1 }}></Typography>

        {profile.data ? (
          <React.Fragment>
            <NotificationsButton />
            <ProfileNavAvatar />
          </React.Fragment>
        ) : (
          <DiscordLoginButton />
        )}
      </Toolbar>
    </AppBar>
  )
}
