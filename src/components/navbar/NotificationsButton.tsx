import { Badge, Box, Button, Popover, Typography } from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, getNavbarContrastText } from "../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PATHS } from "../../routes/paths"
import {
  NotificationBulkActions,
  NotificationList,
  NotificationScopeFilter,
} from "../../features/notifications"
import { haptic } from "../../util/haptics"
import { HapticIconButton, HapticTablePagination } from "../haptic"
import { EmptyNotifications } from "../empty-states"
import { useNotifications } from "../../features/notifications/hooks/useNotifications"

/**
 * The navbar bell and its popover: the same pieces as the /notifications
 * page (scope tabs, rows, bulk actions, empty state) in a card with the
 * Section header style (paper background, bold h6, outline divider).
 */
export function NotificationsButton() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const iconColor = getNavbarContrastText(theme)

  const {
    shopsData,
    notifications,
    total,
    unreadCount,
    page,
    pageSize,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage,
    scopeFilter,
    setScopeFilter,
    shopIdFilter,
    setShopIdFilter,
    markAllReadCallback,
    deleteAllCallback,
  } = useNotifications()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (notifOpen) haptic.light()
    setAnchorEl(notifOpen ? null : event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  const bellLabel =
    unreadCount > 0
      ? t("navbar.notificationsUnread", {
          count: unreadCount,
          defaultValue: "Notifications, {{count}} unread",
        })
      : t("navbar.notifications", "Notifications")

  return (
    <>
      <HapticIconButton
        aria-label={bellLabel}
        aria-haspopup="dialog"
        aria-expanded={notifOpen ? "true" : undefined}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            variant: "outlined",
            role: "dialog",
            "aria-labelledby": "notifications-popover-title",
            sx: {
              display: "flex",
              flexDirection: "column",
              width: { xs: "calc(100vw - 16px)", sm: 400 },
              maxWidth: { xs: "calc(100vw - 16px)", sm: 400 },
              maxHeight: { xs: "calc(100dvh - 88px)", sm: "80vh" },
            },
          },
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderBottom: 1,
            borderColor: "outline.main",
          }}
        >
          <Typography
            id="notifications-popover-title"
            variant="h6"
            component="h2"
            color="text.secondary"
            sx={{ fontWeight: "bold" }}
          >
            {t("notifications.notifications")}
          </Typography>
          <NotificationBulkActions
            onMarkAllRead={markAllReadCallback}
            onClearAll={deleteAllCallback}
            hasUnread={unreadCount > 0}
            hasAny={total > 0}
          />
        </Box>
        <Box
          sx={{
            px: { xs: 1, sm: 1.5 },
            borderBottom: 1,
            borderColor: "outline.main",
          }}
        >
          <NotificationScopeFilter
            idPrefix="notifications-popover"
            scope={scopeFilter}
            shopId={shopIdFilter}
            shops={shopsData || []}
            onScopeChange={(value) => {
              setScopeFilter(value)
              setShopIdFilter("")
              resetPage()
            }}
            onShopChange={(value) => {
              setShopIdFilter(value)
              resetPage()
            }}
          />
        </Box>
        <Box sx={{ overflowY: "auto", flex: "1 1 auto", minHeight: 0 }}>
          {notifications.length === 0 ? (
            <EmptyNotifications sx={{ minHeight: 0, py: 4 }} />
          ) : (
            <NotificationList notifications={notifications} />
          )}
        </Box>
        <Box sx={{ borderTop: 1, borderColor: "outline.main" }}>
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
          <Button
            component={Link}
            to={PATHS.notifications}
            onClick={handleClose}
            fullWidth
            sx={{ borderRadius: 0, py: 1.25 }}
          >
            {t("notifications.view_all", "View all")}
          </Button>
        </Box>
      </Popover>
    </>
  )
}
