import { useMemo, useCallback } from "react"
import { useLocation, matchPath } from "react-router-dom"
import { useGetUserProfileQuery } from "../../../store/profile"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetContractorBySpectrumIDQuery } from "../../../store/contractor"
import { CURRENT_CUSTOM_ORG } from "../../../hooks/contractor/CustomDomain"
import SCMarketLogo from "../../../assets/scmarket-logo.png"
import { SidebarItemProps } from "../types"
import { createItemFilter } from "../utils/sidebarFilters"
import { resolveOrgRoute } from "../utils/sidebarRouting"

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
 * Hook for managing sidebar items with filtering and route resolution
 */
export function useSidebarItems() {
  const location = useLocation()
  const { data: profile, error: profileError } = useGetUserProfileQuery()
  const [currentOrgObj] = useCurrentOrg()

  const orgRouteContractorId = useMemo(() => {
    const m = matchPath("/org/:contractor_id/*", location.pathname)
    return (m?.params as { contractor_id?: string; "*"?: string })?.[
      "contractor_id"
    ]
  }, [location.pathname])

  const effectiveOrgId = orgRouteContractorId ?? currentOrgObj?.spectrum_id

  const { data: customOrgData } = useGetContractorBySpectrumIDQuery(
    CURRENT_CUSTOM_ORG!,
    { skip: !CURRENT_CUSTOM_ORG },
  )

  const avatar = useMemo(() => {
    if (CURRENT_CUSTOM_ORG) {
      return customOrgData?.avatar || SCMarketLogo
    }
    return SCMarketLogo
  }, [customOrgData])

  const filterItems = useCallback(
    createItemFilter(profile, profileError, currentOrgObj),
    [currentOrgObj, profile, profileError],
  )

  const resolveItem = useCallback(
    (item: SidebarItemProps) =>
      resolveOrgRoute(item, currentOrgObj?.spectrum_id, effectiveOrgId),
    [currentOrgObj?.spectrum_id, effectiveOrgId],
  )

  return {
    profile,
    profileError,
    currentOrgObj,
    effectiveOrgId,
    avatar,
    filterItems,
    resolveItem,
  }
}
