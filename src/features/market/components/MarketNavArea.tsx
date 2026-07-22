import {
  AppBar,
  Box,
  Button,
  Grid,
  Paper,
  PaperProps,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, navbarShadow } from "../../../hooks/styles/Theme"
import React, { useEffect, useRef, useState } from "react"
import { useOnScreen } from "../../../hooks/useOnScreen"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import { NotificationsButton } from "../../../components/navbar/NotificationsButton"
import { ProfileNavAvatar } from "../../../views/people/ProfileNavAvatar"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { Stack } from "@mui/system"
import { useMarketSidebar } from ".."
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { PATHS } from "../../../routes/paths"

export function MarketNavEntry(
  props: { title: string; children: React.ReactElement } & PaperProps,
) {
  const { title, children, ...paperProps } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  return (
    <Paper
      variant={"outlined"}
      sx={{
        borderColor: theme.palette.outline.main,
        display: "flex",
        padding: 1,
        alignItems: "center",
        justifyContent: "center",
        ...paperProps.sx,
      }}
      {...paperProps}
    >
      <Typography sx={{ marginRight: 1 }}>{t(title)}</Typography>
      {children}
    </Paper>
  )
}

export function HideOnScroll(props: { children: React.ReactNode }) {
  const { children } = props

  const ref = useRef<HTMLDivElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const isVisible = useOnScreen(ref) || !loaded

  const theme = useTheme<ExtendedTheme>()
  const drawerOpen = useDrawerOpen()
  const outline =
    theme.palette.outline?.main ?? theme.palette.divider ?? "currentColor"

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <>
      <AppBar
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          transition: "opacity .25s linear, top .5s ease-in-out",
          top: isVisible ? -64 : 0,
          // iOS safe area inset for notch/camera gap
          paddingTop: `calc(${theme.spacing(2)} + env(safe-area-inset-top))`,
          // visibility: isVisible ? 'hidden' : undefined,
          opacity: isVisible ? "0" : "1",
          // height: isVisible ? undefined : 0,
          // marginLeft: (drawerOpen ? sidebarDrawerWidth : 0),
          // width: `calc(100% - ${(drawerOpen ? sidebarDrawerWidth : 1) - 1}px)`,

          [theme.breakpoints.up("sm")]: {
            marginLeft: drawerOpen ? sidebarDrawerWidth : 0,
            width: `calc(100% - ${
              (drawerOpen ? sidebarDrawerWidth : 1) - 1
            }px)`,
          },
          [theme.breakpoints.down("sm")]: {
            width: drawerOpen ? 0 : "100%",
          },
          [theme.breakpoints.down("md")]: {
            display: "none",
          },

          // transition: theme.transitions.create(['width', 'margin'], {
          //         easing: theme.transitions.easing.easeOut,
          //         duration: '0.3s',
          //     }
          // ),
          background: theme.palette.background.navbar,
          overflow: "visible",
          boxSizing: "border-box",
          ...(theme.navKind === "outlined"
            ? {
                borderBottom: 1,
                borderColor: outline,
                boxShadow: "none",
              }
            : {
                border: "none",
                boxShadow: navbarShadow(theme),
              }),
        }}
      >
        <Toolbar
          sx={{
            paddingRight: 2, // keep right padding when drawer closed
            overflow: "visible",
            background: "transparent",
            paddingLeft: 0,
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Box>
              <MarketNavArea top />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          [theme.breakpoints.down("md")]: {
            display: "none",
          },
        }}
      >
        {children}
      </Box>
      <div ref={ref} />
    </>
  )
}

export function MarketNavArea(props: { top?: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const profile = useGetUserProfileQuery()

  const [searchParams, setSearchParams] = useSearchParams()

  const [drawerOpen] = useDrawerOpen()
  const [open, setOpen] = useMarketSidebar()

  return (
    <>
      <Grid
        container
        justifyContent={"flex-end"}
        spacing={theme.layoutSpacing.compact}
      >
        {props.top && (
          <Grid item sx={{ paddingTop: 1 }}>
            {profile.data ? (
              <Box sx={{ display: "flex" }}>
                <NotificationsButton />
                <ProfileNavAvatar />
              </Box>
            ) : (
              <Stack direction="row" spacing={theme.layoutSpacing.compact}>
                <Button
                  component={RouterLink}
                  to={PATHS.login}
                  variant="outlined"
                  color="primary"
                >
                  {t("auth.signIn", "Sign in")}
                </Button>
                <Button
                  component={RouterLink}
                  to={PATHS.signup}
                  variant="contained"
                  color="primary"
                >
                  {t("auth.signUp", "Sign up")}
                </Button>
              </Stack>
            )}
          </Grid>
        )}
      </Grid>
    </>
  )
}
