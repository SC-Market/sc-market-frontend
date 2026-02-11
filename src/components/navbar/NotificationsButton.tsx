import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Notification } from "../../hooks/login/UserProfile"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../../store/notification"
import { useGetUserOrganizationsQuery } from "../../store/organizations"
import { useNotificationPollingInterval } from "../../hooks/notifications/useNotificationPolling"
import { useTranslation } from "react-i18next"
import { useBadgeAPI } from "../../hooks/pwa/useBadgeAPI"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { Link } from "react-router-dom"
import { NotificationEntry } from "../../features/notifications/components/NotificationEntry"
import { haptic } from "../../util/haptics"
import { HapticIconButton, HapticTablePagination } from "../haptic"

import Box from '@mui/material/Box';
import { BoxProps } from '@mui/material/Box';
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
import { FabProps } from '@mui/material/Fab';
import Drawer from '@mui/material/Drawer';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material/TextField';
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
import { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import Link1 from '@mui/material/Link';
import { TypographyProps } from '@mui/material/Typography';
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

export function NotificationsButton() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [scopeFilter, setScopeFilter] = useState<
    "individual" | "organization" | "all"
  >("all")
  const [contractorIdFilter, setContractorIdFilter] = useState<string>("")

  const iconColor = theme.palette.getContrastText(
    theme.palette.background.navbar,
  )

  const { data: organizationsData } = useGetUserOrganizationsQuery()

  // Calculate optimal polling interval based on push subscription and app visibility
  const pollingInterval = useNotificationPollingInterval()

  const { data: notificationsData, refetch } = useGetNotificationsQuery(
    {
      page,
      pageSize,
      scope: scopeFilter !== "all" ? scopeFilter : undefined,
      contractorId: contractorIdFilter || undefined,
    },
    {
      pollingInterval: pollingInterval > 0 ? pollingInterval : undefined, // Disable polling if interval is 0
      refetchOnMountOrArgChange: true, // Refetch when component mounts or arguments change
    },
  )

  // Explicitly refetch when pagination changes
  useEffect(() => {
    refetch()
  }, [page, pageSize, refetch])

  const notifications = notificationsData?.notifications || []
  const total = notificationsData?.pagination?.total || 0
  const unreadCount = notificationsData?.unread_count || 0

  // Update app icon badge with unread count
  useBadgeAPI(unreadCount)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (notifOpen) {
      haptic.light()
    }
    setAnchorEl(notifOpen ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [bulkUpdate] = useNotificationBulkUpdateMutation()
  const [bulkDelete] = useNotificationBulkDeleteMutation()
  const issueAlert = useAlertHook()

  const markAllReadCallback = useCallback(async () => {
    try {
      const result = await bulkUpdate({ read: true }).unwrap()
      issueAlert({
        severity: "success",
        message: t("notifications.marked_all_read", {
          count: result.affected_count,
        }),
      })
    } catch (error) {
      issueAlert({
        severity: "error",
        message: t("notifications.mark_all_read_failed"),
      })
    }
  }, [bulkUpdate, issueAlert, t])

  const deleteAllCallback = useCallback(async () => {
    try {
      const result = await bulkDelete({}).unwrap()
      issueAlert({
        severity: "success",
        message: t("notifications.cleared_all", {
          count: result.affected_count,
        }),
      })
    } catch (error) {
      issueAlert({
        severity: "error",
        message: t("notifications.clear_all_failed"),
      })
    }
  }, [bulkDelete, issueAlert, t])

  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  return (
    <>
      <HapticIconButton
        sx={{ marginRight: 2, color: iconColor }}
        onClick={handleClick}
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color={"primary"}>
          <NotificationsActiveRoundedIcon />
        </Badge>
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
            maxWidth: { xs: "calc(100vw - 32px)", sm: 400 }, // Responsive maxWidth: full width minus padding on mobile
            width: { xs: "calc(100vw - 32px)", sm: 400 }, // Responsive width
            maxHeight: { xs: "calc(100vh - 100px)", sm: "80vh" }, // Limit height on mobile to fit viewport
          },
        }}
      >
        <Box
          sx={{
            padding: { xs: 1.5, sm: 2 }, // Reduced padding on mobile
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant={"h6"} sx={{ fontWeight: 600 }}>
              {t("notifications.notifications")}
            </Typography>
            <Link
              to="/notifications"
              onClick={handleClose}
              style={{
                textDecoration: "none",
                color: "inherit",
                fontSize: "0.875rem",
                opacity: 0.9,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {t("notifications.view_all", { defaultValue: "View All" })}
              </Typography>
            </Link>
          </Box>
          <Box>
            <Tooltip title={t("notifications.clear_all")}>
              <IconButton onClick={deleteAllCallback}>
                <ClearAllRounded />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("notifications.mark_all_as_read")}>
              <IconButton onClick={markAllReadCallback}>
                <MarkEmailReadRounded />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider light />
        {/* Filter Section */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: `1px solid ${theme.palette.outline.main}`,
          }}
        >
          <Tabs
            value={scopeFilter}
            onChange={(_, newValue) => {
              setScopeFilter(newValue)
              setContractorIdFilter("") // Reset contractor filter when changing scope
              setPage(0) // Reset to first page
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab
              label="All"
              value="all"
              sx={{ minHeight: 40, fontSize: "0.875rem" }}
            />
            <Tab
              label="Individual"
              value="individual"
              sx={{ minHeight: 40, fontSize: "0.875rem" }}
            />
            <Tab
              label="Organizations"
              value="organization"
              sx={{ minHeight: 40, fontSize: "0.875rem" }}
            />
          </Tabs>
          {scopeFilter === "organization" &&
            organizationsData &&
            organizationsData.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="org-filter-label">
                  Filter by Organization
                </InputLabel>
                <Select
                  labelId="org-filter-label"
                  value={contractorIdFilter}
                  label="Filter by Organization"
                  onChange={(e) => {
                    setContractorIdFilter(e.target.value)
                    setPage(0) // Reset to first page
                  }}
                >
                  <MenuItem value="">
                    <em>All Organizations</em>
                  </MenuItem>
                  {organizationsData.map((org) => (
                    <MenuItem key={org.contractor_id} value={org.contractor_id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          {(scopeFilter !== "all" || contractorIdFilter) && (
            <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {scopeFilter !== "all" && (
                <Chip
                  label={
                    scopeFilter === "individual"
                      ? "Individual"
                      : "Organizations"
                  }
                  size="small"
                  onDelete={() => {
                    setScopeFilter("all")
                    setContractorIdFilter("")
                    setPage(0)
                  }}
                />
              )}
              {contractorIdFilter && (
                <Chip
                  label={
                    organizationsData?.find(
                      (o) => o.contractor_id === contractorIdFilter,
                    )?.name || "Organization"
                  }
                  size="small"
                  onDelete={() => {
                    setContractorIdFilter("")
                    setPage(0)
                  }}
                />
              )}
            </Box>
          )}
        </Box>
        <Box>
          <List
            sx={{
              "&>:first-child": {
                borderTop: `1px solid ${theme.palette.outline.main}`,
              },
              "&>:last-child": {
                borderBottom: "none",
              },
              "& > *": {
                borderBottom: `1px solid ${theme.palette.outline.main}`,
              },
              padding: 0,
              maxHeight: { xs: "calc(100vh - 250px)", sm: 400 }, // Responsive maxHeight to fit viewport
              overflow: "auto", // Changed from "scroll" to "auto" for better mobile behavior
              minHeight: 20,
            }}
          >
            {(notifications || []).map((notification, idx) => (
              <NotificationEntry notif={notification} key={idx} />
            ))}
          </List>

          {total > 5 && (
            <HapticTablePagination
              labelRowsPerPage={t("rows_per_page")}
              labelDisplayedRows={({ from, to, count }) =>
                t("displayed_rows", { from, to, count })
              }
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={total}
              rowsPerPage={pageSize}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              color={"primary"}
              nextIconButtonProps={{ color: "primary" }}
              backIconButtonProps={{ color: "primary" }}
              size="small"
            />
          )}
        </Box>
      </Popover>
    </>
  )
}
