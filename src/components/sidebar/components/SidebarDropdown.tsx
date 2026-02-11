import React, { useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { SidebarLink } from "./SidebarLink"
import { SidebarItemWithStarProps } from "../types"
import { isSidebarPathSelected } from "../utils/pathMatching"
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

/**
 * Collapsible dropdown for sidebar items with children
 */
export function SidebarDropdown(props: SidebarItemWithStarProps) {
  const [open, setOpen] = useState(false)
  const { icon, text, chip, children, starredItems, onToggleStar } = props
  const theme = useTheme<ExtendedTheme>()
  const loc = useLocation()
  const { t } = useTranslation()
  const xs = useMediaQuery(theme.breakpoints.down("sm"))

  const anyChild = props.children?.some((child) => {
    const childPath = (child.to || "").split("?")[0]
    return isSidebarPathSelected(childPath, loc.pathname)
  })

  const contrast = theme.palette.getContrastText(
    theme.palette.background.sidebar,
  )

  return (
    <>
      <ListItemButton
        color={"primary"}
        sx={{
          padding: xs ? 0.25 : 1,
          paddingLeft: xs ? 1 : 2,
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          marginBottom: xs ? 0.25 : 0.5,
          transition: "0.3s",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        key={text}
        onClick={() => {
          haptic.selection()
          setOpen((open) => !open)
        }}
      >
        <ListItemIcon
          sx={{
            color: anyChild ? theme.palette.primary.main : contrast,
            transition: "0.3s",
            fontSize: xs ? "0.85em" : "0.9em",
            ...(xs && { minWidth: 40 }),
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText sx={{ marginLeft: -2 }}>
          <Typography
            color={anyChild ? "primary" : contrast}
            sx={{
              display: "inline-block",
              position: "relative",
              fontWeight: "bold",
              transition: "0.3s",
            }}
            variant={"subtitle2"}
          >
            {t(text)}
          </Typography>
        </ListItemText>
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
            size={"small"}
            color={"primary"}
            sx={{
              marginRight: 1,
              height: 20,
            }}
          />
        ) : null}
        {open ? (
          <ExpandLess sx={{ color: contrast }} />
        ) : (
          <ExpandMore sx={{ color: contrast }} />
        )}
      </ListItemButton>
      {children ? (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box
            sx={{
              borderLeft: 1,
              borderColor: theme.palette.outline.main,
              paddingLeft: 1,
            }}
          >
            {children.map((child) => (
              <SidebarLink
                {...child}
                to={child.to || "a"}
                key={child.text}
                isStarred={starredItems?.includes(
                  child.to?.split("?")[0] || "",
                )}
                onToggleStar={onToggleStar}
              />
            ))}
          </Box>
        </Collapse>
      ) : null}
    </>
  )
}
