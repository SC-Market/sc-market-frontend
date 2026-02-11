import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import React, { useEffect, useRef, useState } from "react"
import { useOnScreen } from "../../../hooks/useOnScreen"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import { NotificationsButton } from "../../../components/navbar/NotificationsButton"
import { ProfileNavAvatar } from "../../../views/people/ProfileNavAvatar"
import { useGetUserProfileQuery } from "../../../store/profile"
import { Stack } from "@mui/system"
import { useMarketSidebar } from ".."
import { Link as RouterLink, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack1 from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import { PaperProps } from '@mui/material/PaperProps';
import Toolbar from '@mui/material/Toolbar';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';

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
