import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { User } from "../../datatypes/User"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useProfileGetBlocklistQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { useGetOrgBlocklistQuery } from "../../store/contractor"
import { BlockUserButton, BlockUserForOrgButton } from "./BlockUserButton"
import { UnblockUserButton, UnblockUserForOrgButton } from "./UnblockUserButton"
import { useAdminUnlinkUserAccountMutation } from "../../store/admin"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import LoadingButton from "@mui/lab/LoadingButton"

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
import Link from '@mui/material/Link';
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

interface UserActionsDropdownProps {
  user: User
}

export function UserActionsDropdown({ user }: UserActionsDropdownProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [contractor] = useCurrentOrg()
  const { data: myProfile } = useGetUserProfileQuery()
  const [unlinkAccount, { isLoading: isUnlinking }] =
    useAdminUnlinkUserAccountMutation()
  const issueAlert = useAlertHook()
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)

  // Personal blocklist
  const { data: personalBlocklist = [], isLoading: personalBlocklistLoading } =
    useProfileGetBlocklistQuery()

  // Organization blocklist
  const { data: orgBlocklist = [], isLoading: orgBlocklistLoading } =
    useGetOrgBlocklistQuery(contractor?.spectrum_id || "", {
      skip: !contractor?.spectrum_id,
    })

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleViewRSIPage = () => {
    window.open(
      `https://robertsspaceindustries.com/citizens/${user.username}`,
      "_blank",
    )
    handleClose()
  }

  // Check if user is blocked personally
  const isPersonallyBlocked = personalBlocklist.some(
    (entry) => entry.blocked_user?.username === user.username,
  )

  // Check if user is viewing their own profile
  const isSelf = myProfile?.username === user.username

  // Check if user is blocked by organization
  const isOrgBlocked = orgBlocklist.some(
    (entry) => entry.blocked_user?.username === user.username,
  )

  const handleSuccess = () => {
    handleClose()
  }

  const handleUnlinkClick = () => {
    setUnlinkDialogOpen(true)
    handleClose()
  }

  const handleConfirmUnlink = async () => {
    try {
      await unlinkAccount({ username: user.username }).unwrap()
      issueAlert({
        message: t("userActions.adminUnlinkSuccess", {
          username: user.username,
        }),
        severity: "success",
      })
      setUnlinkDialogOpen(false)
    } catch (err: any) {
      issueAlert(err)
    }
  }

  const handleCancelUnlink = () => {
    setUnlinkDialogOpen(false)
  }

  const isAdmin = myProfile?.role === "admin"

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          ml: 0.5,
          color: "text.secondary",
        }}
        aria-label={t("userActions.menu")}
      >
        <ArrowDropDown />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          variant: "outlined",
          sx: {
            borderRadius: (theme) =>
              theme.spacing((theme as ExtendedTheme).borderRadius.topLevel),
            borderColor: theme.palette.outline.main,
          },
        }}
      >
        <Box>
          <List
            sx={{
              "&>:last-child": {
                borderBottom: "none",
              },
              "& > *": {
                borderBottom: `1px solid ${theme.palette.outline.main}`,
              },
              padding: 0,
              minWidth: 200,
            }}
          >
            <ListItemButton onClick={handleViewRSIPage}>
              <ListItemIcon
                sx={{
                  transition: "0.3s",
                  fontSize: "0.9em",
                  color: theme.palette.primary.main,
                }}
              >
                <LinkIcon />
              </ListItemIcon>
              <ListItemText>
                <Box color={"text.secondary"} fontSize="0.9em">
                  {t("userActions.viewRSIPage")}
                </Box>
              </ListItemText>
            </ListItemButton>

            {!isSelf &&
              (isPersonallyBlocked ? (
                <UnblockUserButton
                  user={user}
                  onSuccess={handleSuccess}
                  disabled={personalBlocklistLoading}
                />
              ) : (
                <BlockUserButton
                  user={user}
                  myUsername={myProfile?.username || ""}
                  onSuccess={handleSuccess}
                  disabled={personalBlocklistLoading}
                />
              ))}

            {contractor &&
              (isOrgBlocked ? (
                <UnblockUserForOrgButton
                  user={user}
                  spectrumId={contractor.spectrum_id}
                  onSuccess={handleSuccess}
                  disabled={orgBlocklistLoading}
                />
              ) : (
                <BlockUserForOrgButton
                  user={user}
                  orgName={contractor.name}
                  spectrumId={contractor.spectrum_id}
                  onSuccess={handleSuccess}
                  disabled={orgBlocklistLoading}
                />
              ))}

            {isAdmin && user.rsi_confirmed && (
              <ListItemButton onClick={handleUnlinkClick}>
                <ListItemIcon
                  sx={{
                    transition: "0.3s",
                    fontSize: "0.9em",
                    color: theme.palette.error.main,
                  }}
                >
                  <LinkOffIcon />
                </ListItemIcon>
                <ListItemText>
                  <Box color={"text.secondary"} fontSize="0.9em">
                    {t("userActions.adminUnlinkAccount")}
                  </Box>
                </ListItemText>
              </ListItemButton>
            )}
          </List>
        </Box>
      </Popover>

      <Dialog
        open={unlinkDialogOpen}
        onClose={handleCancelUnlink}
        aria-labelledby="admin-unlink-dialog-title"
        aria-describedby="admin-unlink-dialog-description"
      >
        <DialogTitle id="admin-unlink-dialog-title">
          {t("userActions.adminUnlinkDialogTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="admin-unlink-dialog-description">
            {t("userActions.adminUnlinkDialogDescription", {
              username: user.username,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUnlink}>
            {t("userActions.adminUnlinkDialogCancel")}
          </Button>
          <LoadingButton
            onClick={handleConfirmUnlink}
            color="error"
            loading={isUnlinking}
            variant="contained"
          >
            {t("userActions.adminUnlinkDialogConfirm")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
