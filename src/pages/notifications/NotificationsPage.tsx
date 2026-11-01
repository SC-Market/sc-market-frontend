import React, { useState, useCallback } from "react"
import { Box, Grid, Paper, Typography } from "@mui/material"
import { NotificationsNoneOutlined } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { HapticTablePagination } from "../../components/haptic"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { NotificationListSkeleton } from "../../components/skeletons/AccountPageSkeletons"
import { usePageNotifications } from "../../features/notifications/hooks/usePageNotifications"
import { NotificationList } from "../../features/notifications/components/NotificationList"
import { NotificationScopeFilter } from "../../features/notifications/components/NotificationScopeFilter"
import { NotificationBulkActions } from "../../features/notifications/components/NotificationBulkActions"
import { EmptyNotifications, EmptyState } from "../../components/empty-states"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import type { NotificationScope } from "../../features/notifications/domain/types"

/**
 * /notifications: the page title row (title, unread count, bulk actions on
 * one line at every width, like Messages), then one outlined card in the
 * Orders page's pattern: scope tabs on top, the day-grouped list, and the
 * pagination bar at the bottom of the card.
 */
export function NotificationsPage() {
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
  const total = pageData.data?.pagination?.total || 0
  const unreadCount = pageData.data?.unreadCount || 0
  const shops = pageData.data?.shops || []
  const filtered = scopeFilter !== "all" || !!shopIdFilter

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPageSize(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  const markAllRead = useCallback(async () => {
    try {
      const result = await pageData.markAllAsRead()
      issueAlert({
        severity: "success",
        message: t("notifications.marked_all_read", {
          count: result.affected_count,
        }),
      })
    } catch {
      issueAlert({
        severity: "error",
        message: t("notifications.mark_all_read_failed"),
      })
    }
  }, [pageData, issueAlert, t])

  const clearAll = useCallback(async () => {
    try {
      const result = await pageData.deleteAll()
      issueAlert({
        severity: "success",
        message: t("notifications.cleared_all", {
          count: result.affected_count,
        }),
      })
    } catch {
      issueAlert({
        severity: "error",
        message: t("notifications.clear_all_failed"),
      })
    }
  }, [pageData, issueAlert, t])

  const showAll = () => {
    setScopeFilter("all")
    setShopIdFilter("")
    setPage(0)
  }

  return (
    <StandardPageLayout
      title={t("notifications.notifications")}
      maxWidth="md"
      isLoading={pageData.isLoading}
      error={pageData.error}
    >
      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h4"
              component="h1"
              color="text.secondary"
              sx={{ fontWeight: "bold" }}
            >
              {t("notifications.notifications")}
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              aria-live="polite"
              sx={{ mt: 0.5, minHeight: "1.43em" }}
            >
              {pageData.isLoading
                ? ""
                : unreadCount > 0
                  ? t("notifications.unread_count", {
                      count: unreadCount,
                      defaultValue: "{{count}} unread",
                    })
                  : t("notifications.all_caught_up", "You're all caught up")}
            </Typography>
          </Box>
          <NotificationBulkActions
            onMarkAllRead={markAllRead}
            onClearAll={clearAll}
            hasUnread={unreadCount > 0}
            hasAny={total > 0}
          />
        </Box>
      </Grid>

      <Grid item xs={12} sx={{ minWidth: 0 }}>
        <Paper sx={{ overflow: "hidden" }}>
          <Box
            sx={{
              px: { xs: 1, sm: 2 },
              borderBottom: 1,
              borderColor: "outline.main",
            }}
          >
            <NotificationScopeFilter
              idPrefix="notifications-page"
              scope={scopeFilter}
              shopId={shopIdFilter}
              shops={shops}
              onScopeChange={(value) => {
                setScopeFilter(value)
                setShopIdFilter("")
                setPage(0)
              }}
              onShopChange={(value) => {
                setShopIdFilter(value)
                setPage(0)
              }}
            />
          </Box>

          {pageData.isLoading ? (
            <NotificationListSkeleton />
          ) : notifications.length === 0 ? (
            filtered ? (
              <EmptyState
                icon={<NotificationsNoneOutlined />}
                title={t(
                  "notifications.empty_filtered",
                  "Nothing here for this filter",
                )}
                description={t(
                  "notifications.empty_filtered_description",
                  "Try all notifications instead.",
                )}
                action={{
                  label: t("notifications.show_all", "Show all"),
                  onClick: showAll,
                  variant: "outlined",
                }}
                sx={{ minHeight: { xs: 260, sm: 320 } }}
              />
            ) : (
              <EmptyNotifications sx={{ minHeight: { xs: 260, sm: 320 } }} />
            )
          ) : (
            <NotificationList notifications={notifications} grouped />
          )}

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
              sx={{ borderTop: 1, borderColor: "outline.main" }}
            />
          )}
        </Paper>
      </Grid>
    </StandardPageLayout>
  )
}
