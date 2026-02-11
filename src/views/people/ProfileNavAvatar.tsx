import React, { useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useGetUserProfileQuery } from "../../store/profile"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useLogoutMutation } from "../../store/profile"
import { useDispatch } from "react-redux"
import { serviceApi } from "../../store/service"
import { tokensApi } from "../../features/api-tokens"
import { PreferencesControls } from "../../components/settings/PreferencesControls"
import { haptic } from "../../util/haptics"
import { HapticIconButton } from "../../components/haptic"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import InputAdornment from '@mui/material/InputAdornment';
import AlertTitle from '@mui/material/AlertTitle';
import { GridProps } from '@mui/material/Grid';
import List from '@mui/material/List';
import TablePagination from '@mui/material/TablePagination';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ButtonGroup from '@mui/material/ButtonGroup';
import Rating from '@mui/material/Rating';
import CardActionArea from '@mui/material/CardActionArea';
import FormGroup from '@mui/material/FormGroup';
import { Theme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Popover from '@mui/material/Popover';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Announcement from '@mui/icons-material/Announcement';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import HourglassTop from '@mui/icons-material/HourglassTop';
import Edit from '@mui/icons-material/Edit';
import Close from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import Warning from '@mui/icons-material/Warning';
import PersonRemoveRounded from '@mui/icons-material/PersonRemoveRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import PublishRounded from '@mui/icons-material/PublishRounded';
import CancelRounded from '@mui/icons-material/CancelRounded';
import DoneRounded from '@mui/icons-material/DoneRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import KeyboardArrowRightRounded from '@mui/icons-material/KeyboardArrowRightRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';

export function ProfileNavAvatar() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { data: profile } = useGetUserProfileQuery()
  const { t } = useTranslation()
  const [logout] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (notifOpen) {
      haptic.light()
    }
    setAnchorEl(notifOpen ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    handleClose()

    try {
      // Clear service worker caches
      if ("serviceWorker" in navigator && "caches" in window) {
        try {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map((cacheName) => {
              // Clear API cache and other caches that might contain authenticated data
              if (
                cacheName.includes("api") ||
                cacheName.includes("pages") ||
                cacheName.includes("mutations")
              ) {
                return caches.delete(cacheName)
              }
              return Promise.resolve()
            }),
          )
        } catch (error) {
          console.error("Failed to clear service worker caches:", error)
        }
      }

      // Clear RTK Query cache (also done in mutation's onQueryStarted, but do it here too for immediate effect)
      dispatch(serviceApi.util.resetApiState())
      dispatch(tokensApi.util.resetApiState())

      // Call logout mutation
      await logout().unwrap()

      // Navigate to home page after successful logout
      // Using navigate instead of window.location to avoid full page reload
      navigate("/", { replace: true })
    } catch (error) {
      // Even if logout fails, navigate to home (session might be cleared anyway)
      console.error("Logout error:", error)
      navigate("/", { replace: true })
    }
  }

  return (
    <React.Fragment>
      {/*{redirect && <Navigate to={redirect}/>}*/}
      <HapticIconButton onClick={handleClick}>
        <Avatar src={profile?.avatar} />
      </HapticIconButton>
      <Popover
        open={notifOpen}
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
              maxHeight: 400,
              overflow: "scroll",
            }}
          >
            <Link
              to={`/user/${profile?.username}`}
              style={{ color: "inherit", textDecoration: "none" }}
              onClick={handleClose}
            >
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    transition: "0.3s",
                    fontSize: "0.9em",
                    color: theme.palette.primary.main,
                  }}
                >
                  <PeopleRounded />
                </ListItemIcon>
                <ListItemText sx={{ maxWidth: 300 }}>
                  <Typography noWrap color={"text.secondary"}>
                    {t("profileNavAvatar.profile")}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </Link>
            <Link
              to={"/settings"}
              style={{ color: "inherit", textDecoration: "none" }}
              onClick={handleClose}
            >
              <ListItemButton>
                <ListItemIcon
                  sx={{
                    transition: "0.3s",
                    fontSize: "0.9em",
                    color: theme.palette.primary.main,
                  }}
                >
                  <SettingsRounded />
                </ListItemIcon>
                <ListItemText sx={{ maxWidth: 300 }}>
                  <Typography noWrap color={"text.secondary"}>
                    {t("profileNavAvatar.settings")}
                  </Typography>
                </ListItemText>
              </ListItemButton>
            </Link>
            {isMobile && (
              <>
                <PreferencesControls />
                <Divider />
              </>
            )}
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon
                sx={{
                  transition: "0.3s",
                  fontSize: "0.9em",
                  color: theme.palette.primary.main,
                }}
              >
                <LogoutRounded />
              </ListItemIcon>
              <ListItemText sx={{ maxWidth: 300 }}>
                <Typography noWrap color={"text.secondary"}>
                  {t("profileNavAvatar.logout")}
                </Typography>
              </ListItemText>
            </ListItemButton>
          </List>
        </Box>
      </Popover>
    </React.Fragment>
  )
}
