import { useTheme } from "@mui/material/styles"
import React, { useEffect } from "react"

import { ExtendedTheme } from "../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../hooks/layout/Drawer"
import { marketDrawerWidth } from "../../features/market"
import { useServiceSidebar } from "../../hooks/contract/ServiceSidebar"
import { ServiceSearchArea } from "../services/ServiceSearchArea"
import CloseIcon from "@mui/icons-material/Close"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../components/mobile/BottomSheet"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack1 from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Fab from '@mui/material/Fab';
import DialogContentText from '@mui/material/DialogContentText';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import ButtonBase from '@mui/material/ButtonBase';
import useTheme1 from '@mui/material/styles';
import CardMedia from '@mui/material/CardMedia';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ElectricBoltRounded from '@mui/icons-material/ElectricBoltRounded';
import ArchiveRounded from '@mui/icons-material/ArchiveRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';
import AddShoppingCartRounded from '@mui/icons-material/AddShoppingCartRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';

export function ServiceSidebar() {
  const theme: ExtendedTheme = useTheme()
  const { t } = useTranslation()

  // States
  const [open, setOpen] = useServiceSidebar()
  const [drawerOpen] = useDrawerOpen()

  const xs = useMediaQuery(theme.breakpoints.down("lg"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  useEffect(() => {
    setOpen(!xs)
  }, [setOpen, xs])

  // Content component
  const sidebarContent = (
    <Stack justifyContent={"left"} direction={"column"}>
      <ServiceSearchArea />
    </Stack>
  )

  // On mobile, use BottomSheet
  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("service_market.filters", "Filters")}
        snapPoints={["half", "66", "full"]}
        defaultSnap="66"
      >
        {sidebarContent}
      </BottomSheet>
    )
  }

  // On desktop, use permanent drawer
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        zIndex: theme.zIndex.drawer - 3,
        width: open ? marketDrawerWidth : 0,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: open ? marketDrawerWidth : 0,
          boxSizing: "border-box",
          overflow: "scroll",
          left: drawerOpen ? sidebarDrawerWidth : 0,
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create(
            ["width", "borderRight", "borderColor"],
            {
              easing: theme.transitions.easing.easeOut,
              duration: "0.3s",
            },
          ),
          borderRight: open ? 1 : 0,
          borderColor: open ? theme.palette.outline.main : "transparent",
        },
        position: "relative",
        whiteSpace: "nowrap",
        background: "transparent",
        overflow: "scroll",
        borderRight: open ? 1 : 0,
        borderColor: open ? theme.palette.outline.main : "transparent",
      }}
      container={
        window !== undefined
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <Box
        sx={{
          ...theme.mixins.toolbar,
          position: "relative",
          width: "100%",
        }}
      />
      {sidebarContent}
    </Drawer>
  )
}
