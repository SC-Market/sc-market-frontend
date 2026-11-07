/**
 * Supplier Dashboard
 * Aggregator-facing view: incoming buy orders, open requisitions,
 * stock snapshot, recent orders, and activity feed.
 * Gated to admin role via SiteAdminRoute in src/routes.ts.
 */

import {
  Box,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  AssignmentRounded,
  CheckCircleOutlineRounded,
  FiberManualRecordRounded,
  PaymentsRounded,
  PersonRounded,
  RefreshRounded,
  ShoppingCartRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useSearchBuyOrdersQuery,
  useGetRequisitionsQuery,
  useGetOrdersQuery,
  useGetMySuppliersQuery,
} from "../../store/api/v2/market"
import { usePageReady } from "../../components/metadata/PageReady"
import { useFormatters } from "../../util/format"
import { formatAuec, StatCard } from "./supplierDashboardShared"
import { BuyOrdersPanel } from "./SupplierBuyOrdersPanel"
import { RequisitionsPanel } from "./SupplierRequisitionsPanel"
import { RecentOrdersPanel } from "./SupplierRecentOrdersPanel"
import { ActivityFeed, buildActivityFeed } from "./SupplierActivityFeed"

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function AdminSupplierDashboard() {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const {
    data: buyOrdersData,
    isLoading: boLoading,
    refetch: boRefetch,
  } = useSearchBuyOrdersQuery({ pageSize: 50 })
  const { data: requisitionsData, isLoading: reqLoading } =
    useGetRequisitionsQuery({ role: "supplier", pageSize: 20 })
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery({
    role: "seller",
    pageSize: 20,
    sortBy: "updated_at",
    sortOrder: "desc",
  })
  const { data: suppliersData } = useGetMySuppliersQuery({})
  usePageReady(boLoading || reqLoading || ordersLoading)

  const buyOrders = buyOrdersData?.buy_orders ?? []
  const reqs = requisitionsData?.requisitions ?? []
  const orders = ordersData?.orders ?? []

  const activeBuyOrders = buyOrders.filter((o) => o.status === "active")
  const pendingReqs = reqs.filter((r) => r.status === "not-started")
  const recentRevenue = orders
    .filter((o) => o.status === "fulfilled")
    .reduce((sum, o) => sum + o.total_price, 0)
  const supplierCount = suppliersData?.total ?? 0

  const activityFeed = buildActivityFeed(
    t,
    activeBuyOrders,
    reqs,
    orders,
    fmt.locale,
  )

  const isLoading = boLoading || reqLoading || ordersLoading

  return (
    <Box sx={{ p: 3, maxWidth: 1400 }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <StorefrontRounded sx={{ color: "primary.main", fontSize: 22 }} />
            <Typography
              variant="h5"
              fontWeight={700}
              fontFamily="'Space Grotesk', sans-serif"
            >
              {t("suppliersUi.dashboard.title")}
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "success.main",
                ml: 0.5,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {t("suppliersUi.dashboard.subtitle")}
          </Typography>
        </Box>
        <Tooltip title={t("suppliersUi.dashboard.refreshAll")}>
          <IconButton onClick={() => boRefetch()} size="small">
            <RefreshRounded />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Stat strip */}
      <Stack direction="row" spacing={2} flexWrap="wrap" mb={3} useFlexGap>
        <StatCard
          icon={<ShoppingCartRounded sx={{ fontSize: 18 }} />}
          label={t("suppliersUi.dashboard.stats.activeBuyOrders")}
          value={activeBuyOrders.length}
          sub={t("suppliersUi.dashboard.stats.targetedAtMe", {
            count: activeBuyOrders.filter((o) => o.visibility === "private")
              .length,
          })}
          accent={activeBuyOrders.some((o) => o.visibility === "private")}
          loading={boLoading}
        />
        <StatCard
          icon={<AssignmentRounded sx={{ fontSize: 18 }} />}
          label={t("suppliersUi.dashboard.stats.openRequisitions")}
          value={
            reqs.filter(
              (r) => r.status !== "fulfilled" && r.status !== "cancelled",
            ).length
          }
          sub={
            pendingReqs.length
              ? t("suppliersUi.dashboard.stats.awaitingResponse", {
                  count: pendingReqs.length,
                })
              : undefined
          }
          accent={pendingReqs.length > 0}
          loading={reqLoading}
        />
        <StatCard
          icon={<PaymentsRounded sx={{ fontSize: 18 }} />}
          label={t("suppliersUi.dashboard.stats.revenue")}
          value={t("suppliersUi.amountAuec", {
            amount: formatAuec(recentRevenue, fmt.locale),
          })}
          sub={t("suppliersUi.dashboard.stats.ordersCompleted", {
            count: orders.filter((o) => o.status === "fulfilled").length,
          })}
          loading={ordersLoading}
        />
        <StatCard
          icon={<CheckCircleOutlineRounded sx={{ fontSize: 18 }} />}
          label={t("suppliersUi.dashboard.stats.fulfilledOrders")}
          value={orders.filter((o) => o.status === "fulfilled").length}
          sub={t("suppliersUi.dashboard.stats.ofTotal", {
            count: orders.length,
          })}
          loading={ordersLoading}
        />
        <StatCard
          icon={<PersonRounded sx={{ fontSize: 18 }} />}
          label={t("suppliersUi.dashboard.stats.rosterSuppliers")}
          value={supplierCount}
          sub={t("suppliersUi.dashboard.stats.inNetwork")}
        />
      </Stack>

      {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* Main grid */}
      <Grid container spacing={2}>
        {/* Left col: Buy Orders + Requisitions */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={2}>
            {boLoading ? (
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: 1 }}
              />
            ) : (
              <BuyOrdersPanel orders={activeBuyOrders} />
            )}
            {reqLoading ? (
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 1 }}
              />
            ) : (
              <RequisitionsPanel
                reqs={reqs.filter(
                  (r) => r.status !== "fulfilled" && r.status !== "cancelled",
                )}
              />
            )}
          </Stack>
        </Grid>

        {/* Right col: Orders + Activity */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {ordersLoading ? (
              <Skeleton
                variant="rectangular"
                height={280}
                sx={{ borderRadius: 1 }}
              />
            ) : (
              <RecentOrdersPanel orders={orders} />
            )}

            {/* Activity feed */}
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <FiberManualRecordRounded
                    sx={{ fontSize: 14, color: "success.main" }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t("suppliersUi.dashboard.activityTitle")}
                  </Typography>
                </Stack>
              </Box>
              <Divider />
              <ActivityFeed items={activityFeed} />
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
