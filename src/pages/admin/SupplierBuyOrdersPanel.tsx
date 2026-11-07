import { useState } from "react"
import {
  Box,
  Chip,
  IconButton,
  Paper,
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
import {
  Inventory2Rounded,
  OpenInNewRounded,
  ShoppingCartRounded,
} from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { StandingBuyOrder } from "../../store/api/v2/market"
import { remainingQuantity } from "../../features/market/domain/buyOrders"
import { useFormatters } from "../../util/format"
import { blue } from "@mui/material/colors"
import { formatAuec, timeAgo, VISIBILITY_CHIP } from "./supplierDashboardShared"

// ---------------------------------------------------------------------------
// Buy Orders Panel
// ---------------------------------------------------------------------------

export type BuyOrderTab = "all" | "targeted" | "roster" | "public"

export function BuyOrdersPanel({ orders }: { orders: StandingBuyOrder[] }) {
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
