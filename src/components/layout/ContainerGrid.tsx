import React, { ReactElement, useEffect, useRef } from "react"
import { useTheme } from "@mui/material/styles"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { Footer } from "../footer/Footer"
import { MainRefContext } from "../../hooks/layout/MainRef"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useBottomNavHeight } from "../../hooks/layout/useBottomNavHeight"

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
import useTheme1 from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import { FabProps } from '@mui/material/FabProps';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextFieldProps';
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
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbsProps } from '@mui/material/BreadcrumbsProps';
import MaterialLink from '@mui/material/Link';
import { TypographyProps } from '@mui/material/TypographyProps';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { GridProps } from '@mui/material/Grid';
import { PaperProps } from '@mui/material/PaperProps';
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
import DialogContentText from '@mui/material/DialogContentText';
import Snackbar from '@mui/material/Snackbar';
import MuiRating from '@mui/material/Rating';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import { Theme } from '@mui/material/styles';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import { ContainerProps } from '@mui/material/ContainerProps';
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
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import MenuRounded from '@mui/icons-material/MenuRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import Info from '@mui/icons-material/Info';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import GetAppRounded from '@mui/icons-material/GetAppRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import Business from '@mui/icons-material/Business';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import AutoGraphOutlined from '@mui/icons-material/AutoGraphOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import WhatshotRounded from '@mui/icons-material/WhatshotRounded';
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded';
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded';
import BoltRounded from '@mui/icons-material/BoltRounded';
import CalendarTodayRounded from '@mui/icons-material/CalendarTodayRounded';
import RocketLaunchRounded from '@mui/icons-material/RocketLaunchRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';

export function ContainerGrid(
  props: {
    sidebarOpen: boolean
    sidebarWidth?: number // Width of the sidebar in pixels (e.g., marketDrawerWidth)
    noFooter?: boolean
    noSidebar?: boolean
    GridProps?: GridProps
    noTopSpacer?: boolean
    noMobilePadding?: boolean // If true, removes padding on mobile (for market listings)
  } & ContainerProps,
): ReactElement {
  const theme = useTheme<ExtendedTheme>()
  const bottomNavHeight = useBottomNavHeight()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    sidebarWidth = 0,
    noFooter,
    noSidebar,
    GridProps,
    noMobilePadding,
    ...containerProps
  } = props

  useEffect(() => {
    if (noSidebar) {
      setDrawerOpen(!noSidebar)
    }
  }, [setDrawerOpen, props.sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100%", // Use 100% of parent instead of 100vh
          position: "relative",
          marginLeft:
            !isMobile && sidebarOpen && sidebarWidth > 0 ? sidebarWidth : 0,
          transition:
            !isMobile && sidebarWidth > 0
              ? theme.transitions.create("marginLeft", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                })
              : undefined,
        }}
        ref={ref}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            [theme.breakpoints.up("sm")]: {
              width: drawerOpen ? sidebarDrawerWidth : 1,
            },
            [theme.breakpoints.down("sm")]: {
              width: drawerOpen ? "100%" : 1,
            },
            display: props.noTopSpacer
              ? "none"
              : theme.navKind === "outlined"
                ? "block"
                : "none",
          }}
        />
        <Container
          {...containerProps}
          maxWidth={
            containerProps.maxWidth !== undefined
              ? containerProps.maxWidth
              : "lg"
          }
          sx={{
            paddingTop: theme.spacing(4),
            paddingBottom: {
              xs: theme.spacing(2) + bottomNavHeight,
              sm: theme.spacing(2),
            }, // Bottom padding accounts for bottom nav (dynamically adjusts)
            paddingLeft: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            paddingRight: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            // Override maxWidth on mobile to allow full width
            [theme.breakpoints.down("sm")]: {
              maxWidth: "100%",
            },
            ...props.sx,
          }}
        >
          <Grid
            container
            spacing={{
              xs: theme.layoutSpacing.component,
              sm: theme.layoutSpacing.layout,
            }}
            justifyContent={"center"}
            {...GridProps}
          >
            {props.children}
            {!props.noFooter && <Footer />}
          </Grid>
        </Container>
      </main>
    </MainRefContext.Provider>
  )
}

export function OpenGrid(
  props: {
    sidebarOpen: boolean
    noFooter?: boolean
    noSidebar?: boolean
    mainProps?: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >
  } & GridProps,
) {
  const theme = useTheme<ExtendedTheme>()
  const bottomNavHeight = useBottomNavHeight()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    noFooter,
    noSidebar,
    children,
    mainProps,
    ...gridProps
  } = props

  useEffect(() => {
    if (noSidebar) {
      setDrawerOpen(!noSidebar)
    }
  }, [setDrawerOpen, props.sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        {...mainProps}
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100vh",
          position: "relative",
          ...mainProps?.style,
        }}
        ref={ref}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            display: theme.navKind === "outlined" ? "block" : "none",
          }}
        />
        <Grid
          container
          spacing={theme.layoutSpacing.layout * 4}
          justifyContent={"center"}
          sx={{
            paddingBottom: `${bottomNavHeight}px`, // Bottom spacer for mobile bottom nav (dynamically adjusts when keyboard opens)
          }}
          {...gridProps}
        >
          {props.children}
          {!props.noFooter && <Footer />}
        </Grid>
      </main>
    </MainRefContext.Provider>
  )
}

export function OpenLayout(
  props: {
    sidebarOpen: boolean
    noFooter?: boolean
    noSidebar?: boolean
    children: React.ReactNode
    noMobilePadding?: boolean // If true, removes padding on mobile (for market listings)
  } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>,
) {
  const theme: Theme = useTheme()
  const bottomNavHeight = useBottomNavHeight()

  const [drawerOpen, setDrawerOpen] = useDrawerOpen()

  const {
    sidebarOpen,
    noFooter,
    noSidebar,
    children,
    noMobilePadding,
    ...mainProps
  } = props

  useEffect(() => {
    if (noSidebar) {
      setDrawerOpen(!noSidebar)
    }
  }, [setDrawerOpen, sidebarOpen, noSidebar])

  const ref = useRef<HTMLDivElement | null>(null)

  return (
    <MainRefContext.Provider value={ref}>
      <main
        {...mainProps}
        style={{
          flexGrow: 1,
          overflow: "auto",
          height: "100vh",
          position: "relative",
          ...mainProps?.style,
        }}
        ref={ref}
      >
        <Box
          sx={{
            ...theme.mixins.toolbar,
            position: "relative",
            [theme.breakpoints.up("sm")]: {
              width: drawerOpen ? sidebarDrawerWidth : 1,
            },
            [theme.breakpoints.down("sm")]: {
              width: drawerOpen ? "100%" : 1,
            },
            display: theme.navKind === "outlined" ? "block" : "none",
            height: 64,
          }}
        />
        <Box
          sx={{
            paddingLeft: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            paddingRight: {
              xs: noMobilePadding ? 0 : theme.spacing(1),
              sm: theme.spacing(3),
            },
            paddingTop: theme.spacing(2),
            paddingBottom: { xs: theme.spacing(10), sm: theme.spacing(2) }, // Extra bottom padding on mobile for bottom nav
          }}
        >
          {children}
        </Box>
        {!noFooter && <Footer />}
      </main>
    </MainRefContext.Provider>
  )
}
