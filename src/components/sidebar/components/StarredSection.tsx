import React from "react"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { SidebarItem } from "./SidebarItem"
import { SidebarItemProps } from "../types"

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

interface StarredSectionProps {
  starredItems: string[]
  allItems: SidebarItemProps[]
  effectiveOrgId: string | null | undefined
  currentOrgId: string | null | undefined
  onToggleStar: (path: string) => void
  resolveItem: (item: SidebarItemProps) => SidebarItemProps
}

/**
 * Mobile-only section showing starred sidebar items
 */
export function StarredSection({
  starredItems,
  allItems,
  effectiveOrgId,
  currentOrgId,
  onToggleStar,
  resolveItem,
}: StarredSectionProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  if (!xs || starredItems.length === 0) {
    return null
  }

  const starredEntries = allItems
    .filter((entry) => entry.to)
    .filter((entry) => {
      const path =
        entry.orgRouteRest && effectiveOrgId
          ? `/org/${effectiveOrgId}/${entry.orgRouteRest}`
          : entry.to
      return starredItems.includes(path?.split("?")[0] || "")
    })
    .map((entry) => {
      let resolved = entry
      if (entry.toOrgPublic && currentOrgId) {
        resolved = {
          ...entry,
          to: `/contractor/${currentOrgId}`,
        }
      } else if (entry.orgRouteRest && effectiveOrgId) {
        resolved = {
          ...entry,
          to: `/org/${effectiveOrgId}/${entry.orgRouteRest}`,
        }
      }
      return resolved
    })

  return (
    <List
      sx={{ padding: xs ? 0.5 : 1 }}
      subheader={
        <ListSubheader
          sx={{
            marginBottom: xs ? 0 : 0.5,
            backgroundColor: "inherit",
          }}
        >
          <Typography
            sx={{
              bgcolor: "inherit",
              fontWeight: "bold",
              opacity: 0.7,
              textTransform: "uppercase",
              fontSize: xs ? "0.75em" : "0.85em",
              color: theme.palette.getContrastText(
                theme.palette.background.sidebar,
              ),
            }}
            variant={"body2"}
          >
            {t("sidebar.starred", "Starred")}
          </Typography>
        </ListSubheader>
      }
    >
      {starredEntries.map((entry) => (
        <SidebarItem
          {...entry}
          key={entry.text}
          isStarred={true}
          onToggleStar={onToggleStar}
          starredItems={starredItems}
        />
      ))}
    </List>
  )
}
