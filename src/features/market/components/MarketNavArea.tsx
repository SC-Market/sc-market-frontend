import {
  AppBar,
  Box,
  Button,
  Grid,
  Paper,
  PaperProps,
  TextField,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useOnScreen } from "../../../hooks/useOnScreen"
import { SearchRounded } from "@mui/icons-material"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import { NotificationsButton } from "../../../components/navbar/NotificationsButton"
import { ProfileNavAvatar } from "../../../views/people/ProfileNavAvatar"
import { useGetUserProfileQuery } from "../../../store/profile"
import { Stack } from "@mui/system"
import { useMarketSidebar, useMarketSearch } from ".."
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <>
      <AppBar
        variant={"outlined"}
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
          background: theme.palette.background.default,
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
        color={"secondary"}
      >
        <Toolbar
          sx={{
            paddingRight: 2, // keep right padding when drawer closed
            // boxShadow: `0 3px 5px 3px ${theme.palette.primary.main}`,
            overflow: "visible",
            background: "transparent",
            paddingLeft: 0,
            ...(theme.navKind === "outlined"
              ? {}
              : {
                  border: "none",
                  boxShadow:
                    "rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px",
                }),
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

  const [searchState, setMarketSearch] = useMarketSearch()
  const [query, setQuery] = useState<string>(searchState.query || "")

  const [drawerOpen] = useDrawerOpen()
  const [open, setOpen] = useMarketSidebar()

  const handleQueryChange = (event: { target: { value: string } }) => {
    setQuery(event.target.value)
  }

  const searchClickCallback = useCallback(() => {
    setMarketSearch({
      ...searchState,
      query,
    })
  }, [query, setMarketSearch, searchState])

  return (
    <>
      <Grid
        container
        justifyContent={"space-between"}
        spacing={theme.layoutSpacing.compact}
      >
        <Grid item>
          <Grid container spacing={theme.layoutSpacing.compact}>
            <Grid item sx={{ paddingTop: 2 }}>
              <TextField
                fullWidth
                label={t("market.search_query")}
                InputProps={{
                  startAdornment: <SearchRounded />,
                }}
                value={query}
                onChange={handleQueryChange}
                color={"secondary"}
                size={"small"}
              />
            </Grid>

            <Grid item sx={{ paddingTop: 2 }}>
              <Button
                onClick={searchClickCallback}
                startIcon={<SearchRounded />}
                variant={"contained"}
              >
                {t("market.search")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
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
          </Grid>
        )}
      </Grid>
    </>
  )
}
