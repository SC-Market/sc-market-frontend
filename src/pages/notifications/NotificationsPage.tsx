import React, { useState, useCallback } from "react"
import { HapticTablePagination } from "../../components/haptic"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useNotifications } from "../../features/notifications/hooks/useNotifications"
import { NotificationEntry } from "../../features/notifications/components/NotificationEntry"
import { EmptyNotifications } from "../../components/empty-states"
import { PullToRefresh } from "../../components/gestures"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useGetUserOrganizationsQuery } from "../../store/organizations"
import type { NotificationScope } from "../../features/notifications/domain/types"
import type { Notification } from "../../hooks/login/UserProfile"

import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import ClearAllRounded from '@mui/icons-material/ClearAllRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';

export function NotificationsPage() {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [scopeFilter, setScopeFilter] = useState<NotificationScope>("all")
  const [contractorIdFilter, setContractorIdFilter] = useState<string>("")

  const { data: organizationsData } = useGetUserOrganizationsQuery()

  const {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    refetch,
    markAllAsRead,
    deleteAll,
  } = useNotifications(page, pageSize, scopeFilter, contractorIdFilter)

  const total = pagination?.total || 0

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

  const markAllReadCallback = useCallback(async () => {
    try {
      const result = await markAllAsRead()
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
  }, [markAllAsRead, issueAlert, t])

  const deleteAllCallback = useCallback(async () => {
    try {
      const result = await deleteAll()
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
  }, [deleteAll, issueAlert, t])

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {t("notifications.notifications")}
        </Typography>
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

      <Divider sx={{ mb: 2 }} />

      {/* Filter Section */}
      <Box
        sx={{
          mb: 2,
          borderBottom: `1px solid ${theme.palette.outline.main}`,
        }}
      >
        <Tabs
          value={scopeFilter}
          onChange={(_, newValue) => {
            setScopeFilter(newValue)
            setContractorIdFilter("")
            setPage(0)
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
            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1 }}>
              <InputLabel id="org-filter-label">
                Filter by Organization
              </InputLabel>
              <Select
                labelId="org-filter-label"
                value={contractorIdFilter}
                label="Filter by Organization"
                onChange={(e) => {
                  setContractorIdFilter(e.target.value)
                  setPage(0)
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
          <Box
            sx={{ mt: 1, mb: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}
          >
            {scopeFilter !== "all" && (
              <Chip
                label={
                  scopeFilter === "individual" ? "Individual" : "Organizations"
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

      {/* Notifications List */}
      <PullToRefresh
        onRefresh={async () => {
          await refetch()
        }}
        enabled={isMobile}
      >
        {isLoading ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {t("common.loading", { defaultValue: "Loading..." })}
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <EmptyNotifications sx={{ py: 4 }} />
        ) : (
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
              bgcolor: "background.paper",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {notifications.map((notification: Notification, idx: number) => (
              <NotificationEntry notif={notification} key={idx} />
            ))}
          </List>
        )}
      </PullToRefresh>

      {/* Pagination */}
      {total > 0 && (
        <HapticTablePagination
          labelRowsPerPage={t("rows_per_page")}
          labelDisplayedRows={({ from, to, count }) =>
            t("displayed_rows", { from, to, count })
          }
          rowsPerPageOptions={[10, 20, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          color={"primary"}
          nextIconButtonProps={{ color: "primary" }}
          backIconButtonProps={{ color: "primary" }}
        />
      )}
    </Container>
  )
}
