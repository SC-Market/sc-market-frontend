import { SidebarItemProps } from "../types"
import { has_permission } from "../../../views/contractor/OrgRoles"
import { CURRENT_CUSTOM_ORG } from "../../../hooks/contractor/CustomDomain"

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
import { useTheme } from '@mui/material/styles';
import ListSubheader from '@mui/material/ListSubheader';
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

/**
 * Filter sidebar items based on permissions, org context, and visibility rules
 */
export function createItemFilter(
  profile: any,
  profileError: any,
  currentOrgObj: any,
) {
  return (item: SidebarItemProps): boolean => {
    if (item.hidden) {
      return false
    }

    // Check login requirements
    if (
      (item.logged_in || item.org || item.org_admin || item.site_admin) &&
      (profileError || !profile)
    ) {
      return false
    }

    // Check org context requirements
    if (item.org === false && (currentOrgObj !== null || CURRENT_CUSTOM_ORG)) {
      return false
    }

    if ((item.org || item.org_admin) && !currentOrgObj) {
      return false
    }

    if (item.toOrgPublic && !currentOrgObj) {
      return false
    }

    // Check org admin permissions
    if (item.org_admin) {
      if (
        !(
          [
            "manage_org_details",
            "manage_invites",
            "manage_roles",
            "manage_webhooks",
            "manage_orders",
          ] as const
        ).some((perm) =>
          has_permission(currentOrgObj, profile, perm, profile?.contractors),
        )
      ) {
        return false
      }
    }

    // Check custom org requirements
    if (CURRENT_CUSTOM_ORG && item.custom === false) {
      return false
    }

    if (!CURRENT_CUSTOM_ORG && item.custom) {
      return false
    }

    // Check site admin requirements
    if (item.site_admin && profile?.role !== "admin") {
      return false
    }

    return true
  }
}
