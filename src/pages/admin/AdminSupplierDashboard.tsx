/**
 * Supplier Dashboard
 * Aggregator-facing view: incoming buy orders, open requisitions,
 * stock snapshot, recent orders, and activity feed.
 * Gated to admin role via SiteAdminRoute in src/routes.ts.
 */

import React, { useState } from "react"
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import {
  AssignmentRounded,
  BoltRounded,
  CheckCircleOutlineRounded,
  FiberManualRecordRounded,
  Inventory2Rounded,
  LocalShippingRounded,
  OpenInNewRounded,
  PaymentsRounded,
  PersonRounded,
  RefreshRounded,
  ShoppingCartRounded,
  StorefrontRounded,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import {
  useSearchBuyOrdersQuery,
  useGetRequisitionsQuery,
  useGetOrdersQuery,
  useGetMySuppliersQuery,
} from "../../store/api/v2/market"
import type {
  StandingBuyOrder,
  RequisitionDetail,
  OrderPreview,
} from "../../store/api/v2/market"
import { usePageReady } from "../../components/metadata/PageReady"
import { remainingQuantity } from "../../features/market/domain/buyOrders"
import { formatNumber, useFormatters } from "../../util/format"
import { amber, blue, cyan, deepPurple, red, teal } from "@mui/material/colors"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** An aUEC amount, abbreviated from 1,000 up in the locale's short form ("15K", "1.5M"). */
function formatAuec(value: number, locale: string): string {
  return formatNumber(value, locale, {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  })
}

function timeAgo(t: TFunction, isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60)
    return t("suppliersUi.dashboard.timeAgo.minutes", { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24)
    return t("suppliersUi.dashboard.timeAgo.hours", { count: hours })
  return t("suppliersUi.dashboard.timeAgo.days", {
    count: Math.floor(hours / 24),
  })
}

function initials(name: string): string {
  return name
    .split(/[\s_-]/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
}

function avatarColor(name: string): string {
  const colors = [
    blue[500],
    deepPurple[300],
    cyan[500],
    teal[400],
    amber[700],
    red[500],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffffff
  return colors[Math.abs(h) % colors.length]
}

const VISIBILITY_CHIP: Record<
  string,
  { label: string; color: "primary" | "info" | "default" }
> = {
  private: {
    label: "suppliersUi.dashboard.visibility.targeted",
    color: "primary",
  },
  roster_only: {
    label: "suppliersUi.dashboard.visibility.roster",
    color: "info",
  },
  public: {
    label: "suppliersUi.dashboard.visibility.public",
    color: "default",
  },
}

const ORDER_STATUS_CHIP: Record<
  string,
  { label: string; color: "warning" | "success" | "error" | "default" }
> = {
  "not-started": {
    label: "suppliersUi.dashboard.orderStatus.notStarted",
    color: "warning",
  },
  "in-progress": {
    label: "suppliersUi.dashboard.orderStatus.inProgress",
    color: "warning",
  },
  fulfilled: {
    label: "suppliersUi.dashboard.orderStatus.fulfilled",
    color: "success",
  },
  cancelled: {
    label: "suppliersUi.dashboard.orderStatus.cancelled",
    color: "error",
  },
}

const REQ_STATUS_CHIP: Record<
  string,
  {
    label: string
    color: "warning" | "primary" | "success" | "error" | "default"
  }
> = {
  "not-started": {
    label: "suppliersUi.dashboard.reqStatus.awaiting",
    color: "warning",
  },
  "in-progress": {
    label: "suppliersUi.dashboard.reqStatus.inProgress",
    color: "primary",
  },
  fulfilled: {
    label: "suppliersUi.dashboard.reqStatus.fulfilled",
    color: "success",
  },
  cancelled: {
    label: "suppliersUi.dashboard.reqStatus.cancelled",
    color: "error",
  },
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  accent?: boolean
  loading?: boolean
}

function StatCard({ icon, label, value, sub, accent, loading }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: accent ? "primary.main" : "divider",
        bgcolor: accent ? "rgba(59,130,246,0.06)" : "background.paper",
        flex: 1,
        minWidth: 140,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
        <Box
          sx={{
            color: accent ? "primary.main" : "text.secondary",
            display: "flex",
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton width={60} height={28} />
      ) : (
        <Typography
          variant="h6"
          fontWeight={700}
          fontFamily="'Space Grotesk', sans-serif"
          lineHeight={1.1}
        >
          {value}
        </Typography>
      )}
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Buy Orders Panel
// ---------------------------------------------------------------------------

type BuyOrderTab = "all" | "targeted" | "roster" | "public"

function BuyOrdersPanel({ orders }: { orders: StandingBuyOrder[] }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const [tab, setTab] = useState<BuyOrderTab>("all")
  const navigate = useNavigate()

  const filtered = orders.filter((o) => {
    if (tab === "targeted") return o.visibility === "private"
    if (tab === "roster") return o.visibility === "roster_only"
    if (tab === "public") return o.visibility === "public"
    return true
  })

  const countBy = (v: string) => orders.filter((o) => o.visibility === v).length

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ShoppingCartRounded sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {t("suppliersUi.dashboard.incomingBuyOrders")}
          </Typography>
        </Stack>
        <Chip
          label={t("suppliersUi.dashboard.activeCount", {
            count: orders.length,
          })}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: blue[500] } }}
      >
        <Tab label={t("common.all")} value="all" sx={{ fontSize: 12 }} />
        <Tab
          label={
            countBy("private")
              ? t("suppliersUi.dashboard.tabs.targetedCount", {
                  count: countBy("private"),
                })
              : t("suppliersUi.dashboard.tabs.targeted")
          }
          value="targeted"
          sx={{ fontSize: 12 }}
        />
        <Tab
          label={
            countBy("roster_only")
              ? t("suppliersUi.dashboard.tabs.rosterCount", {
                  count: countBy("roster_only"),
                })
              : t("suppliersUi.dashboard.tabs.roster")
          }
          value="roster"
          sx={{ fontSize: 12 }}
        />
        <Tab
          label={
            countBy("public")
              ? t("suppliersUi.dashboard.tabs.publicCount", {
                  count: countBy("public"),
                })
              : t("suppliersUi.dashboard.tabs.public")
          }
          value="public"
          sx={{ fontSize: 12 }}
        />
      </Tabs>

      {filtered.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("suppliersUi.dashboard.noBuyOrders")}
          </Typography>
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }}>
                {t("suppliersUi.dashboard.columns.item")}
              </TableCell>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }}>
                {t("suppliersUi.dashboard.columns.visibility")}
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "text.secondary", fontSize: 11 }}
              >
                {t("suppliersUi.dashboard.columns.pricePerUnit")}
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "text.secondary", fontSize: 11 }}
              >
                {t("suppliersUi.dashboard.columns.qty")}
              </TableCell>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }}>
                {t("suppliersUi.dashboard.columns.expires")}
              </TableCell>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(0, 10).map((order) => {
              const vis = VISIBILITY_CHIP[order.visibility ?? "public"]
              const isTargeted = order.visibility === "private"
              return (
                <TableRow
                  key={order.buy_order_id}
                  sx={{
                    cursor: "pointer",
                    borderLeft: isTargeted
                      ? `3px solid ${blue[500]}`
                      : "3px solid transparent",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => navigate(`/buy-orders/${order.buy_order_id}`)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Inventory2Rounded
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          noWrap
                          sx={{ maxWidth: 180 }}
                        >
                          {order.game_item_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.buyer_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(vis.label)}
                      size="small"
                      color={vis.color}
                      variant="outlined"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontFamily="'JetBrains Mono', monospace"
                      color="success.main"
                      fontWeight={600}
                    >
                      {t("suppliersUi.amountAuec", {
                        amount: formatAuec(order.price_per_unit, fmt.locale),
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {fmt.number(remainingQuantity(order))}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {order.expires_at ? timeAgo(t, order.expires_at) : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t("suppliersUi.dashboard.viewOrder")}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/buy-orders/${order.buy_order_id}`)
                        }}
                      >
                        <OpenInNewRounded sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Requisitions Panel
// ---------------------------------------------------------------------------

function RequisitionsPanel({ reqs }: { reqs: RequisitionDetail[] }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const urgent = reqs.filter((r) => r.status === "not-started")

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AssignmentRounded sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="subtitle1" fontWeight={600}>
            {t("suppliersUi.dashboard.openRequisitions")}
          </Typography>
        </Stack>
        {urgent.length > 0 && (
          <Chip
            icon={<BoltRounded sx={{ fontSize: 14 }} />}
            label={t("suppliersUi.dashboard.needResponse", {
              count: urgent.length,
            })}
            size="small"
            color="warning"
          />
        )}
      </Box>

      {reqs.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("suppliersUi.dashboard.noOpenRequisitions")}
          </Typography>
        </Box>
      ) : (
        <Stack divider={<Divider />}>
          {reqs.slice(0, 5).map((req) => {
            const sc =
              REQ_STATUS_CHIP[req.status] ?? REQ_STATUS_CHIP["not-started"]
            return (
              <Box
                key={req.order_id}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => navigate(`/requisitions/${req.order_id}`)}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <ImageAvatar
                    alt=""
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 12,
                      bgcolor: avatarColor(req.buyer?.username ?? "?"),
                    }}
                  >
                    {initials(
                      req.buyer?.display_name ?? req.buyer?.username ?? "?",
                    )}
                  </ImageAvatar>
                  <Box flex={1} minWidth={0}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      mb={0.25}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {req.title}
                      </Typography>
                      <Chip
                        label={t(sc.label)}
                        size="small"
                        color={sc.color}
                        variant="outlined"
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {t("suppliersUi.dashboard.fromBuyer", {
                        name: req.buyer?.display_name ?? req.buyer?.username,
                      })}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label={t("suppliersUi.dashboard.openRequisition")}
                  >
                    <OpenInNewRounded sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Recent Orders Panel
// ---------------------------------------------------------------------------

function RecentOrdersPanel({ orders }: { orders: OrderPreview[] }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <LocalShippingRounded
            sx={{ fontSize: 18, color: "text.secondary" }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            {t("recentOrders.title")}
          </Typography>
        </Stack>
        <Chip
          label={t("suppliersUi.dashboard.sellerCount", {
            count: orders.length,
          })}
          size="small"
          variant="outlined"
          sx={{ fontSize: 10 }}
        />
      </Box>

      {orders.length === 0 ? (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t("suppliersUi.dashboard.noRecentOrders")}
          </Typography>
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }}>
                {t("suppliersUi.dashboard.columns.buyer")}
              </TableCell>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }}>
                {t("suppliersUi.dashboard.columns.order")}
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: "text.secondary", fontSize: 11 }}
              >
                {t("suppliersUi.dashboard.columns.total")}
              </TableCell>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }}>
                {t("suppliersUi.dashboard.columns.status")}
              </TableCell>
              <TableCell sx={{ color: "text.secondary", fontSize: 11 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.slice(0, 8).map((order) => {
              const known = ORDER_STATUS_CHIP[order.status]
              const sc = known
                ? { label: t(known.label), color: known.color }
                : { label: order.status, color: "default" as const }
              return (
                <TableRow
                  key={order.order_id}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                  onClick={() => navigate(`/orders/${order.order_id}`)}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ImageAvatar
                        alt=""
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: 10,
                          bgcolor: avatarColor(order.buyer_username),
                        }}
                      >
                        {initials(order.buyer_username)}
                      </ImageAvatar>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                        {order.buyer_username}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                      {order.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      #{order.order_id.slice(0, 8)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontFamily="'JetBrains Mono', monospace"
                      color="success.main"
                      fontWeight={600}
                    >
                      {formatAuec(order.total_price, fmt.locale)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sc.label}
                      size="small"
                      color={sc.color}
                      variant="outlined"
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label={t("suppliersUi.dashboard.openOrder")}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/orders/${order.order_id}`)
                      }}
                    >
                      <OpenInNewRounded sx={{ fontSize: 14 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Paper>
  )
}

// ---------------------------------------------------------------------------
// Activity Feed (derived from available data)
// ---------------------------------------------------------------------------

interface ActivityItem {
  id: string
  icon: React.ReactNode
  text: React.ReactNode
  time: string
}

function buildActivityFeed(
  t: TFunction,
  buyOrders: StandingBuyOrder[],
  reqs: RequisitionDetail[],
  orders: OrderPreview[],
  locale: string,
): ActivityItem[] {
  const items: ActivityItem[] = []

  buyOrders
    .filter((o) => o.visibility === "private")
    .slice(0, 3)
    .forEach((o) => {
      items.push({
        id: `bo-${o.buy_order_id}`,
        icon: (
          <ShoppingCartRounded sx={{ fontSize: 16, color: "primary.main" }} />
        ),
        text: (
          <>
            <Trans
              i18nKey="suppliersUi.dashboard.activity.targetedBuyOrder"
              values={{ buyer: o.buyer_name, item: o.game_item_name }}
              components={{ b: <b /> }}
            />
          </>
        ),
        time: timeAgo(t, o.created_at),
      })
    })

  reqs
    .filter((r) => r.status === "not-started")
    .slice(0, 2)
    .forEach((r) => {
      items.push({
        id: `req-${r.order_id}`,
        icon: (
          <AssignmentRounded sx={{ fontSize: 16, color: "warning.main" }} />
        ),
        text: (
          <>
            <Trans
              i18nKey="suppliersUi.dashboard.activity.newRequisition"
              values={{
                title: r.title,
                buyer: r.buyer?.display_name ?? r.buyer?.username,
              }}
              components={{ b: <b /> }}
            />
          </>
        ),
        time: timeAgo(t, r.created_at),
      })
    })

  orders
    .filter((o) => o.status === "fulfilled")
    .slice(0, 2)
    .forEach((o) => {
      items.push({
        id: `ord-${o.order_id}`,
        icon: <PaymentsRounded sx={{ fontSize: 16, color: "success.main" }} />,
        text: (
          <>
            <Trans
              i18nKey="suppliersUi.dashboard.activity.orderCompleted"
              values={{
                title: o.title,
                amount: formatAuec(o.total_price, locale),
              }}
              components={{ b: <b /> }}
            />
          </>
        ),
        time: timeAgo(t, o.updated_at),
      })
    })

  return items.sort((a, b) => (a.time < b.time ? -1 : 1))
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const { t } = useTranslation()
  if (items.length === 0) {
    return (
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t("suppliersUi.dashboard.noActivity")}
        </Typography>
      </Box>
    )
  }
  return (
    <Stack divider={<Divider />}>
      {items.slice(0, 8).map((item) => (
        <Box key={item.id} sx={{ px: 2, py: 1.25 }}>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box sx={{ mt: 0.25 }}>{item.icon}</Box>
            <Box flex={1}>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                {item.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

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
