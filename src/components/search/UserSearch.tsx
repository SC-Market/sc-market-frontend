import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { BACKEND_URL } from "../../util/constants"
import { User } from "../../datatypes/User"

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
import { useTheme } from '@mui/material/styles';
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

interface UserSearchProps {
  onUserSelect: (user: User) => void
  placeholder?: string
  disabled?: boolean
}

interface SearchResult {
  username: string
  display_name: string
  avatar: string
  user_id: string
}

export function UserSearch({
  onUserSelect,
  placeholder,
  disabled,
}: UserSearchProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setOptions([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/profile/search/${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          credentials: "include",
        },
      )
      const data = await response.json()
      setOptions(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchUsers(query)
      } else {
        setOptions([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleUserSelect = (user: SearchResult | null) => {
    if (user) {
      // Convert SearchResult to User format
      // Explicitly preserve user_id even though it's not in User type
      const userObj: User & { user_id?: string } = {
        ...user,
        user_id: user.user_id, // Explicitly preserve user_id
        orders: 0,
        spent: 0,
        banner: "",
        contractors: [],
        profile_description: "",
        rating: {
          avg_rating: 0,
          rating_count: 0,
          streak: 0,
          total_orders: 0,
          total_rating: 0,
          total_assignments: 0,
          response_rate: 0,
        },
        market_order_template: "",
        created_at: Date.now(),
        rsi_confirmed: false,
      }
      onUserSelect(userObj as User)
      setQuery("")
      setOptions([])
      setOpen(false)
    }
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => option.display_name || option.username}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Avatar src={option.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {option.display_name || option.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{option.username}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || t("userSearch.placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      onChange={(_, value) => handleUserSelect(value)}
      noOptionsText={
        query.length < 2
          ? t("userSearch.typeToSearch")
          : t("userSearch.noResults")
      }
    />
  )
}
