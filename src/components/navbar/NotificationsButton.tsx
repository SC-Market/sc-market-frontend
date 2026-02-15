import {
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  MenuItem,
  Popover,
  Select,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Notification } from "../../hooks/login/UserProfile"
import { ClearAllRounded, MarkEmailReadRounded } from "@mui/icons-material"
import {
  useGetNotificationsQuery,
  useNotificationBulkUpdateMutation,
  useNotificationBulkDeleteMutation,
} from "../../store/notification"
import { useGetCurrentUserProfileQuery } from "../../store/api/profile"
import { useGetUserOrganizationsQuery } from "../../store/organizations"
import { useNotificationPollingInterval } from "../../hooks/notifications/useNotificationPolling"
import { useTranslation } from "react-i18next"
import { useBadgeAPI } from "../../hooks/pwa/useBadgeAPI"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { Link } from "react-router-dom"
import { NotificationEntry } from "../../features/notifications"
import { haptic } from "../../util/haptics"
import { HapticIconButton, HapticTablePagination } from "../haptic"

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

  const { data: currentUser } = useGetCurrentUserProfileQuery()
  const isLoggedIn = !!currentUser

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
      skip: !isLoggedIn,
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
