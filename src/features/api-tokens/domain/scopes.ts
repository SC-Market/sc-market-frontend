/**
 * Scope categories and their available scopes
 */
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
export const SCOPE_CATEGORIES = {
  profile: {
    label: "Profile",
    scopes: [
      { value: "profile:read", label: "Read Profile" },
      { value: "profile:write", label: "Write Profile" },
    ],
  },
  market: {
    label: "Market",
    scopes: [
      { value: "market:read", label: "Read Market" },
      { value: "market:write", label: "Write Market" },
      { value: "market:purchase", label: "Purchase Items" },
      { value: "market:photos", label: "Manage Photos" },
    ],
  },
  orders: {
    label: "Orders",
    scopes: [
      { value: "orders:read", label: "Read Orders" },
      { value: "orders:write", label: "Write Orders" },
      { value: "orders:reviews", label: "Write Reviews" },
    ],
  },
  contractors: {
    label: "Contractors",
    scopes: [
      { value: "contractors:read", label: "Read Contractors" },
      { value: "contractors:write", label: "Write Contractors" },
      { value: "contractors:members", label: "Manage Members" },
      { value: "contractors:webhooks", label: "Manage Webhooks" },
      { value: "contractors:blocklist", label: "Manage Blocklist" },
    ],
  },
  services: {
    label: "Services",
    scopes: [
      { value: "services:read", label: "Read Services" },
      { value: "services:write", label: "Write Services" },
      { value: "services:photos", label: "Manage Photos" },
    ],
  },
  offers: {
    label: "Offers",
    scopes: [
      { value: "offers:read", label: "Read Offers" },
      { value: "offers:write", label: "Write Offers" },
    ],
  },
  chats: {
    label: "Chats",
    scopes: [
      { value: "chats:read", label: "Read Chats" },
      { value: "chats:write", label: "Write Chats" },
    ],
  },
  notifications: {
    label: "Notifications",
    scopes: [
      { value: "notifications:read", label: "Read Notifications" },
      { value: "notifications:write", label: "Write Notifications" },
    ],
  },
  moderation: {
    label: "Moderation",
    scopes: [
      { value: "moderation:read", label: "Read Reports" },
      { value: "moderation:write", label: "Submit Reports" },
    ],
  },
  admin: {
    label: "Admin",
    scopes: [
      { value: "admin:read", label: "Read Admin Data" },
      { value: "admin:write", label: "Write Admin Data" },
      { value: "admin:spectrum", label: "Spectrum Migration" },
      { value: "admin:stats", label: "View Statistics" },
      { value: "admin", label: "Full Admin Access" },
    ],
  },
  special: {
    label: "Special",
    scopes: [
      { value: "readonly", label: "Read Only (All Read Scopes)" },
      { value: "full", label: "Full Access (All Scopes)" },
    ],
  },
} as const;
