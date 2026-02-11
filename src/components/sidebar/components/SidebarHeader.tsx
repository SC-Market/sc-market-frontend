import React from "react"
import { NavLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useDrawerOpen } from "../../../hooks/layout/Drawer"
import { SidebarActorSelect } from "../SidebarActorSelect"
import { HapticIconButton } from "../../haptic"

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

interface SidebarHeaderProps {
  avatar: string
  profile: any
  searchQuery: string
  onSearchChange: (value: string) => void
}

/**
 * Sidebar header with logo, org selector, and search
 */
export function SidebarHeader({
  avatar,
  profile,
  searchQuery,
  onSearchChange,
}: SidebarHeaderProps) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [, setDrawerOpen] = useDrawerOpen()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Stack
      direction={"column"}
      spacing={theme.layoutSpacing.compact}
      sx={{
        width: "100%",
        display: "flex",
        padding: 2,
        borderColor: theme.palette.outline.main,
      }}
    >
      <Grid container sx={{ justifyContent: "space-between" }}>
        <Grid item>
          <NavLink
            to={"/"}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Stack
              direction={"row"}
              spacing={theme.layoutSpacing.compact}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Avatar
                src={avatar}
                aria-label={t("ui.aria.currentContractor")}
                variant={"rounded"}
                sx={{
                  maxHeight: theme.spacing(6),
                  maxWidth: theme.spacing(6),
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Typography
                color={theme.palette.getContrastText(
                  theme.palette.background.sidebar,
                )}
                fontWeight={600}
              >
                {t("sidebar.sc_market")}
              </Typography>
            </Stack>
          </NavLink>
        </Grid>

        <HapticIconButton
          color={"secondary"}
          onClick={() => setDrawerOpen(false)}
          sx={{ height: 40, width: 40 }}
        >
          <ChevronLeftRounded />
        </HapticIconButton>
      </Grid>
      {profile && <SidebarActorSelect />}
      {xs && (
        <TextField
          size="small"
          placeholder={t("sidebar.search", "Search...")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            mt: 1,
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.background.paper,
              "& fieldset": {
                borderColor: theme.palette.outline.main,
              },
              "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
              },
            },
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
          }}
        />
      )}
    </Stack>
  )
}
