import React from "react"
import { useLocation, matchPath } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { useUnreadChatCount } from "../../../features/chats"
import { SidebarLinkProps } from "../types"
import { haptic } from "../../../util/haptics"

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

export const ORG_ROUTE_REST_TO_CANONICAL: Record<string, string> = {
  dashboard: "/dashboard",
  manage: "/org/manage",
  orders: "/org/orders",
  money: "/org/money",
  fleet: "/org/fleet",
  send: "/org/send",
  members: "/org/members",
  listings: "/market/manage",
  services: "/order/services",
}

function isSidebarPathSelected(pathOnly: string, pathname: string): boolean {
  if (matchPath(pathOnly, pathname)) return true
  if (!pathname.startsWith("/org/")) return false
  const m = matchPath("/org/:contractor_id/*", pathname)
  const rest = (m?.params as { contractor_id?: string; "*"?: string })?.["*"]
  return !!(rest && ORG_ROUTE_REST_TO_CANONICAL[rest] === pathOnly)
}

/**
 * The actual rendered link body with icon, text, badges, and star button
 */
export function SidebarLinkBody(props: SidebarLinkProps) {
  const loc = useLocation()
  const pathOnly = (props.to || "").split("?")[0]
  const selected = isSidebarPathSelected(pathOnly, loc.pathname)
  const { icon, text, chip, isStarred, onToggleStar } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const xs = useMediaQuery(theme.breakpoints.down("sm"))
  const [, setDrawerOpen] = useDrawerOpen()
  const unreadChatCount = useUnreadChatCount()
  const isMessagesLink = props.to === "/messages"

  const contrast = theme.palette.getContrastText(
    theme.palette.background.sidebar || "#000000",
  )

  return (
    <ListItemButton
      color={"primary"}
      sx={{
        padding: xs ? 0.25 : 0.5,
        paddingLeft: xs ? 1 : 2,
        borderRadius: theme.spacing(theme.borderRadius.topLevel),
        marginTop: xs ? 0.25 : 0.5,
        transition: "0.3s",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }}
      selected={selected}
      key={text}
      onClick={() => {
        haptic.light()
        if (xs) {
          setDrawerOpen(false)
        }
      }}
    >
      <ListItemIcon
        sx={{
          color: selected ? theme.palette.primary.main : contrast,
          transition: "0.3s",
          fontSize: xs ? "0.85em" : "0.9em",
          ...(xs && { minWidth: 40 }),
        }}
      >
        {isMessagesLink && unreadChatCount > 0 ? (
          <Badge
            badgeContent={unreadChatCount}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.7rem",
                minWidth: "18px",
                height: "18px",
                padding: "0 6px",
              },
            }}
          >
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </ListItemIcon>
      <ListItemText sx={{ marginLeft: -2 }}>
        <Typography
          color={selected ? "primary" : "inherit"}
          sx={{
            display: "inline-block",
            position: "relative",
            fontWeight: "bold",
            transition: "0.3s",
            color: selected ? theme.palette.primary.main : contrast,
          }}
          variant={"subtitle2"}
        >
          {t(text)}
        </Typography>
      </ListItemText>
      {xs && onToggleStar && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleStar(pathOnly)
          }}
          sx={{
            ml: "auto",
            mr: 0.5,
            color: isStarred ? theme.palette.primary.main : contrast,
          }}
        >
          {isStarred ? (
            <StarRounded fontSize="small" />
          ) : (
            <StarBorderRounded fontSize="small" />
          )}
        </IconButton>
      )}
      {chip ? (
        <Chip
          label={
            <Typography
              sx={{
                textTransform: "uppercase",
                fontSize: "0.9em",
                fontWeight: 700,
              }}
              variant={"button"}
            >
              {chip}
            </Typography>
          }
          color={"primary"}
          size={"small"}
        />
      ) : null}
    </ListItemButton>
  )
}
