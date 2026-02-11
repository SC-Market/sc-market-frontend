import React from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { User } from "../../datatypes/User"
import { useProfileBlockUserMutation } from "../../store/profile"
import { useBlockUserForOrgMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box';
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
import { FabProps } from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextField';
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
import { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { TypographyProps } from '@mui/material/Typography';
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
import { PaperProps } from '@mui/material/Paper';
import CardActions from '@mui/material/CardActions';
import ListItemButton from '@mui/material/ListItemButton';
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

interface BlockUserButtonProps {
  user: User
  myUsername: string
  onSuccess: () => void
  disabled?: boolean
}

export function BlockUserButton({
  user,
  myUsername,
  onSuccess,
  disabled,
}: BlockUserButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const issueAlert = useAlertHook()

  const [blockUser, { isLoading: blocking }] = useProfileBlockUserMutation()

  const handleBlock = async () => {
    try {
      await blockUser({ username: user.username }).unwrap()
      issueAlert({
        message: t("blockUser.success", { username: user.username }),
        severity: "success",
      })
      onSuccess()
    } catch (error: any) {
      let errorMessage = t("blockUser.error")

      if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error?.message === "string") {
        errorMessage = error.message
      }

      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  return (
    <ListItemButton onClick={handleBlock} disabled={disabled || blocking}>
      <ListItemIcon
        sx={{
          transition: "0.3s",
          fontSize: "0.9em",
          color: theme.palette.primary.main,
        }}
      >
        {blocking ? <CircularProgress size={16} /> : <Person />}
      </ListItemIcon>
      <ListItemText>
        <Box color={"text.secondary"} fontSize="0.9em">
          {t("userActions.blockPersonally", {
            username: user.display_name || user.username,
            myUsername: myUsername,
          })}
        </Box>
      </ListItemText>
    </ListItemButton>
  )
}

interface BlockUserForOrgButtonProps {
  user: User
  orgName: string
  spectrumId: string
  onSuccess: () => void
  disabled?: boolean
}

export function BlockUserForOrgButton({
  user,
  orgName,
  spectrumId,
  onSuccess,
  disabled,
}: BlockUserForOrgButtonProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const issueAlert = useAlertHook()

  const [blockUserForOrg, { isLoading: blockingForOrg }] =
    useBlockUserForOrgMutation()

  const handleBlock = async () => {
    try {
      await blockUserForOrg({
        spectrum_id: spectrumId,
        username: user.username,
      }).unwrap()
      issueAlert({
        message: t("blockUser.success", { username: user.username }),
        severity: "success",
      })
      onSuccess()
    } catch (error: any) {
      let errorMessage = t("blockUser.error")

      if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (typeof error?.message === "string") {
        errorMessage = error.message
      }

      issueAlert({
        message: errorMessage,
        severity: "error",
      })
    }
  }

  return (
    <ListItemButton onClick={handleBlock} disabled={disabled || blockingForOrg}>
      <ListItemIcon
        sx={{
          transition: "0.3s",
          fontSize: "0.9em",
          color: theme.palette.primary.main,
        }}
      >
        {blockingForOrg ? <CircularProgress size={16} /> : <Business />}
      </ListItemIcon>
      <ListItemText>
        <Box color={"text.secondary"} fontSize="0.9em">
          {t("userActions.blockForOrg", {
            username: user.display_name || user.username,
            orgName: orgName,
          })}
        </Box>
      </ListItemText>
    </ListItemButton>
  )
}
