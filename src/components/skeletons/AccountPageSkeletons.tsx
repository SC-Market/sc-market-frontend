/**
 * Route skeletons for the signed-in pages. They show on the first page load
 * while the page chunk loads and while LoggedInRoute waits for the session
 * (that can take seconds), so each one draws its page's real frame: the same
 * layout component, title, breadcrumbs and column structure as the page.
 */
import {
  Box,
  Divider,
  Grid,
  List,
  ListItem,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { StandardPageLayout } from "../layout/StandardPageLayout"
import { DetailPageLayout } from "../layout/DetailPageLayout"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { MARKET_PATHS, PATHS } from "../../routes/paths"
import { OrderDetailSkeleton } from "./OrderDetailSkeleton"

// ── /notifications ─────────────────────────────────────────────────────────

/** Height of one NotificationEntry row (icon, title + chips, time). */
const NOTIFICATION_ROW_HEIGHT = 98

/** The notification list while a page of notifications loads. */
export function NotificationListSkeleton({ rows = 8 }: { rows?: number }) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <List
      sx={{
        "&>:first-of-type": {
          borderTop: `1px solid ${theme.palette.outline.main}`,
        },
        "&>:last-of-type": { borderBottom: "none" },
        "& > *": { borderBottom: `1px solid ${theme.palette.outline.main}` },
        padding: 0,
        bgcolor: "background.paper",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <ListItem
          key={i}
          sx={{ height: NOTIFICATION_ROW_HEIGHT, gap: 2, alignItems: "center" }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Skeleton variant="circular" width={24} height={24} />
        </ListItem>
      ))}
    </List>
  )
}

/** NotificationsPage's scope tab labels. */
const NOTIFICATION_SCOPE_TABS = ["All", "Personal", "Shop"]

export function NotificationsPageSkeleton() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <StandardPageLayout
      noFooter
      title={t("notifications.notifications")}
      headerTitle={t("notifications.notifications")}
      headerActions={
        <Box sx={{ display: "flex" }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      }
      maxWidth="md"
    >
      <Grid item xs={12}>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            mb: 2,
            borderBottom: `1px solid ${theme.palette.outline.main}`,
          }}
        >
          <Tabs value={0} variant="scrollable" sx={{ minHeight: 40 }}>
            {NOTIFICATION_SCOPE_TABS.map((label) => (
              <Tab
                key={label}
                label={label}
                sx={{ minHeight: 40, fontSize: "0.875rem" }}
              />
            ))}
          </Tabs>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <NotificationListSkeleton />
      </Grid>
    </StandardPageLayout>
  )
}

// ── /orders ────────────────────────────────────────────────────────────────

/**
 * One of the /orders page's sections (My Offers, My Orders, …) in its loading
 * state: header row with title and status tabs, the table header, five rows
 * and the pagination bar (~595px at desktop width).
 */
function OrdersSectionSkeleton() {
  return (
    <Grid item xs={12}>
      <Paper sx={{ overflow: "hidden" }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ px: 2, height: 80 }}
        >
          <Skeleton variant="text" width={150} height={40} />
          <Skeleton variant="text" width={90} />
          <Box sx={{ flex: 1 }} />
          <Skeleton variant="text" width="40%" />
        </Stack>
        <Skeleton variant="rectangular" height={28} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Stack
            key={i}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ px: 2, height: 87, borderBottom: 1, borderColor: "divider" }}
          >
            <Skeleton variant="rounded" width={52} height={52} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="45%" />
              <Skeleton variant="text" width="30%" />
            </Box>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width={100} />
            <Skeleton variant="rounded" width={80} height={32} />
          </Stack>
        ))}
        <Box sx={{ height: 52 }} />
      </Paper>
    </Grid>
  )
}

/** /orders (CreateOrder page): title, then My Offers and My Orders. */
export function OrdersPageSkeleton() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      noFooter
      title={t("orders.ordersTitle")}
      headerTitle={t("orders.ordersTitle")}
      maxWidth="md"
      sidebarOpen={true}
    >
      <OrdersSectionSkeleton />
      <OrdersSectionSkeleton />
    </StandardPageLayout>
  )
}

// ── /inventory ─────────────────────────────────────────────────────────────

/** InventoryPage: breadcrumbs, then the card with its header and lot table. */
export function InventoryPageSkeleton() {
  const { t } = useTranslation()
  const headers = [
    t("inventory.item", "Item"),
    t("inventory.variant", "Variant"),
    t("inventory.quantity", "Qty"),
    t("inventory.location", "Location"),
    t("inventory.listing", "Listing"),
    t("inventory.status", "Status"),
    t("inventory.actions", "Actions"),
  ]
  return (
    <StandardPageLayout
      noFooter
      title={t("sidebar.inventory", "My Inventory")}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        { label: t("sidebar.inventory", "My Inventory") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Skeleton variant="text" width={140} height={32} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={200} height={40} />
              <Skeleton variant="rounded" width={110} height={36.5} />
            </Stack>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headers.map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 16 }).map((_, i) => (
                <TableRow key={i}>
                  {headers.map((h) => (
                    <TableCell key={h}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid>
    </StandardPageLayout>
  )
}

// ── /settings ──────────────────────────────────────────────────────────────

/** Items per group of SettingsPage's left nav (Account, Integrations, …). */
const SETTINGS_NAV_GROUPS = [2, 3, 2, 3]

export function SettingsPageSkeleton() {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  const cards = (
    <Stack spacing={2}>
      {[220, 200, 180].map((h, i) => (
        <Skeleton key={i} variant="rounded" height={h} />
      ))}
    </Stack>
  )

  return (
    <StandardPageLayout
      noFooter
      title={t("settings.title")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {isMobile ? (
        <>
          <Grid item xs={12}>
            {/* Scrollable icon tabs */}
            <Skeleton variant="rectangular" height={72} />
          </Grid>
          <Grid item xs={12}>
            {cards}
          </Grid>
        </>
      ) : (
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ width: 220, flexShrink: 0 }}>
              {SETTINGS_NAV_GROUPS.map((items, g) => (
                <Box key={g}>
                  <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
                    <Skeleton variant="text" width={90} height={20} />
                  </Box>
                  {Array.from({ length: items }).map((_, i) => (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mx: 1, px: 2, height: 48 }}
                    >
                      <Skeleton variant="circular" width={24} height={24} />
                      <Skeleton variant="text" width={110} />
                    </Stack>
                  ))}
                </Box>
              ))}
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>{cards}</Box>
          </Box>
        </Grid>
      )}
    </StandardPageLayout>
  )
}

// ── /contract/:id, /order/:id ──────────────────────────────────────────────

/**
 * Body of ViewOrder while the order loads: the tab strip, then the details
 * table (8/12 from lg, 6/12 from md) beside the messages column.
 */
export function OrderPageBodySkeleton() {
  const isMobile = useIsMobile()
  return (
    <>
      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 1 }}>
          <Stack direction="row" spacing={3} sx={{ height: 48, px: 2 }}>
            {[70, 60, 100].map((w, i) => (
              <Skeleton key={i} variant="text" width={w} sx={{ my: "auto" }} />
            ))}
          </Stack>
        </Box>
      </Grid>
      <Grid item xs={12} lg={8} md={6}>
        <OrderDetailSkeleton showContractor showAssigned />
      </Grid>
      {!isMobile && (
        <Grid item xs={12} lg={4} md={6}>
          <Skeleton variant="rounded" width={"100%"} height={400} />
        </Grid>
      )}
    </>
  )
}

/** Route skeleton for an order: ViewOrder's frame as it is before the order loads. */
export function OrderPageSkeleton() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const id = pathname.split("/")[2] ?? ""
  const fallbackTitle = `Order ${id.substring(0, 8).toUpperCase()}`
  return (
    <DetailPageLayout
      noFooter
      title="Order"
      breadcrumbs={[
        { label: t("dashboard.title", "Dashboard"), href: PATHS.dashboard },
        { label: fallbackTitle },
      ]}
      showOrgInBreadcrumbs={true}
      entityTitle={fallbackTitle}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <OrderPageBodySkeleton />
    </DetailPageLayout>
  )
}
