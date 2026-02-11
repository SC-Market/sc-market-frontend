import { useTheme } from "@mui/material/styles"
import React from "react"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { sidebarDrawerWidth, useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useMessagingSidebar } from "../hooks/MessagingSidebar"
import { MessagingSidebarContent } from "./MessagingSidebarContent"
import { useTranslation } from "react-i18next"
import { BottomSheet } from "../../../components/mobile/BottomSheet"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemIcon from '@mui/material/ListItemIcon';
import useTheme1 from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormGroup from '@mui/material/FormGroup';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Badge from '@mui/material/Badge';
import AvatarGroup from '@mui/material/AvatarGroup';
import Autocomplete from '@mui/material/Autocomplete';
import ListItem from '@mui/material/ListItem';
import Drawer from '@mui/material/Drawer';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BusinessIcon from '@mui/icons-material/Business';
import StarRounded from '@mui/icons-material/StarRounded';
import StarBorderRounded from '@mui/icons-material/StarBorderRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';

export const messagingDrawerWidth = 360

// Sidebar with chat list and search/group creation controls
export function MessagingSidebar() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [drawerOpen, setDrawerOpen] = useDrawerOpen()
  const [messagingSidebar, setMessagingSidebar] = useMessagingSidebar()
  const { t } = useTranslation()

  // On mobile, use BottomSheet instead of temporary drawer
  if (isMobile) {
    return (
      <BottomSheet
        open={messagingSidebar ?? false}
        onClose={() => setMessagingSidebar(false)}
        title={t("MessagingSidebar.title", "Messages")}
        maxHeight="90vh"
      >
        <MessagingSidebarContent />
      </BottomSheet>
    )
  }

  // On desktop, use permanent drawer
  return (
    <Drawer
      variant="permanent"
      open={messagingSidebar}
      sx={{
        width: messagingSidebar ? messagingDrawerWidth : 0,
        flexShrink: 0,
        position: "relative",
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: messagingSidebar ? messagingDrawerWidth : 0,
          boxSizing: "border-box",
          position: "fixed",
          top: 65,
          bottom: 0,
          zIndex: theme.zIndex.drawer - 1,
          left: drawerOpen ? sidebarDrawerWidth : 0,
          borderRight: 0,
          borderLeft: 0,
          borderColor: theme.palette.outline.main,
          overflow: "hidden",
          transition: theme.transitions.create(
            ["width", "left", "borderRight"],
            {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            },
          ),
        },
      }}
      container={
        window !== undefined
          ? () => window.document.getElementById("rootarea")
          : undefined
      }
    >
      <MessagingSidebarContent />
    </Drawer>
  )
}
