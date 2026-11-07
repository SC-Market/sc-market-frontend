import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import { LocalShippingRounded, OpenInNewRounded } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { OrderPreview } from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"
import {
  formatAuec,
  initials,
  avatarColor,
  ORDER_STATUS_CHIP,
} from "./supplierDashboardShared"

// ---------------------------------------------------------------------------
// Recent Orders Panel
// ---------------------------------------------------------------------------

export function RecentOrdersPanel({ orders }: { orders: OrderPreview[] }) {
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
