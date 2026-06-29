import React, { useState, useCallback } from "react"
import {
  Box,
  Grid,
  Typography,
  List,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material"
import { HapticTablePagination } from "../../components/haptic"
import { ClearAllRounded, MarkEmailReadRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { usePageNotifications } from "../../features/notifications/hooks/usePageNotifications"
import { NotificationEntry } from "../../features/notifications/components/NotificationEntry"
import { EmptyNotifications } from "../../components/empty-states"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import type { NotificationScope } from "../../features/notifications/domain/types"
import type { Notification } from "../../hooks/login/UserProfile"

export function NotificationsPage() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [scopeFilter, setScopeFilter] = useState<NotificationScope>("all")
  const [shopIdFilter, setShopIdFilter] = useState<string>("")

  const pageData = usePageNotifications({
    page,
    pageSize,
    scope: scopeFilter,
    shopId: shopIdFilter,
  })

  const notifications = pageData.data?.notifications || []
  const pagination = pageData.data?.pagination
  const shopsData = pageData.data?.shops || []
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
      const result = await pageData.markAllAsRead()
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
  }, [pageData, issueAlert, t])

  const deleteAllCallback = useCallback(async () => {
    try {
      const result = await pageData.deleteAll()
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
  }, [pageData, issueAlert, t])

  return (
    <StandardPageLayout
      title={t("notifications.notifications")}
      headerTitle={t("notifications.notifications")}
      headerActions={
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
      }
      maxWidth="md"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <Grid item xs={12}>
        <Divider sx={{ mb: 2 }} />
      </Grid>

      {/* Filter Section */}
      <Grid item xs={12}>
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
              setShopIdFilter("")
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
              label="Personal"
              value="personal"
              sx={{ minHeight: 40, fontSize: "0.875rem" }}
            />
            <Tab
              label="Shop"
              value="shop"
              sx={{ minHeight: 40, fontSize: "0.875rem" }}
            />
          </Tabs>
          {scopeFilter === "shop" &&
            shopsData &&
            shopsData.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mt: 1, mb: 1 }}>
                <InputLabel id="shop-filter-label">
                  Filter by Shop
                </InputLabel>
                <Select
                  labelId="shop-filter-label"
                  value={shopIdFilter}
                  label="Filter by Shop"
                  onChange={(e) => {
                    setShopIdFilter(e.target.value)
                    setPage(0)
                  }}
                >
                  <MenuItem value="">
                    <em>All Shops</em>
                  </MenuItem>
                  {shopsData.map((shop) => (
                    <MenuItem key={shop.shop_id} value={shop.shop_id}>
                      {shop.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          {(scopeFilter !== "all" || shopIdFilter) && (
            <Box
              sx={{ mt: 1, mb: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}
            >
              {scopeFilter !== "all" && (
                <Chip
                  label={
                    scopeFilter === "personal"
                      ? "Personal"
                      : "Shop"
                  }
                  size="small"
                  onDelete={() => {
                    setScopeFilter("all")
                    setShopIdFilter("")
                    setPage(0)
                  }}
                />
              )}
              {shopIdFilter && (
                <Chip
                  label={
                    shopsData?.find(
                      (s) => s.shop_id === shopIdFilter,
                    )?.name || "Shop"
                  }
                  size="small"
                  onDelete={() => {
                    setShopIdFilter("")
                    setPage(0)
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </Grid>

      {/* Notifications List */}
      <Grid item xs={12} sx={{ overflow: "hidden", minWidth: 0, maxWidth: "100%" }}>
        {pageData.isLoading ? (
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
      </Grid>

      {/* Pagination */}
      {total > 0 && (
        <Grid item xs={12}>
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
        </Grid>
      )}
    </StandardPageLayout>
  )
}
