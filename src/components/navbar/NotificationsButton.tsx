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
} from "@mui/material"
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded"
import React from "react"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme, getNavbarContrastText } from "../../hooks/styles/Theme"
import { ClearAllRounded, MarkEmailReadRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PATHS } from "../../routes/paths"
import { NotificationEntry } from "../../features/notifications"
import { haptic } from "../../util/haptics"
import { HapticIconButton, HapticTablePagination } from "../haptic"
import { useNotifications } from "../../features/notifications/hooks/useNotifications"

export function NotificationsButton() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const notifOpen = Boolean(anchorEl)
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const iconColor = getNavbarContrastText(theme)

  const {
    isLoggedIn, shopsData,
    notifications, total, unreadCount,
    page, pageSize, handleChangePage, handleChangeRowsPerPage, resetPage,
    scopeFilter, setScopeFilter,
    shopIdFilter, setShopIdFilter,
    markAllReadCallback, deleteAllCallback,
  } = useNotifications()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (notifOpen) haptic.light()
    setAnchorEl(notifOpen ? null : event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

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
              to={PATHS.notifications}
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
              setShopIdFilter("") // Reset shop filter when changing scope
              resetPage() // Reset to first page
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
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel id="shop-filter-label">
                  Filter by Shop
                </InputLabel>
                <Select
                  labelId="shop-filter-label"
                  value={shopIdFilter}
                  label="Filter by Shop"
                  onChange={(e) => {
                    setShopIdFilter(e.target.value)
                    resetPage() // Reset to first page
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
            <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
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
                    resetPage()
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
                    resetPage()
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
