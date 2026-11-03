import React from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Box,
  Button,
  Grid,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { Section } from "../../../components/paper/Section"
import { MARKET_PATHS } from "../../../routes/paths"
import {
  useGetMatchesForSellerQuery,
  type StandingBuyOrder,
} from "../../../store/api/v2/market"
import { remainingQuantity } from "../domain/buyOrders"
import { useFormatters } from "../../../util/format"

export function MatchingBuyOrdersArea({
  showEmpty,
}: {
  /**
   * When true, render an empty-state card instead of nothing when there are no
   * matches. Used on the customizable dashboard, where a widget shouldn't
   * silently vanish; the legacy dashboard leaves this off to hide the section.
   */
  showEmpty?: boolean
} = {}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { data, isLoading } = useGetMatchesForSellerQuery({ page: 1, pageSize: 5 })
  const orders = data?.buy_orders || []

  if (isLoading) return null
  if (orders.length === 0) {
    if (!showEmpty) return null
    return (
      <Section
        title={t("dashboard.matchingBuyOrders", "Buy Orders You Can Fulfill")}
        xs={12}
      >
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t(
              "dashboard.matchingBuyOrdersEmpty",
              "No open buy orders match your inventory right now.",
            )}
          </Typography>
        </Grid>
      </Section>
    )
  }

  return (
    <Section
      title={t("dashboard.matchingBuyOrders", "Buy Orders You Can Fulfill")}
      xs={12}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("marketUi.tables.item")}</TableCell>
              <TableCell>{t("marketUi.tables.buyer")}</TableCell>
              <TableCell align="right">{t("marketUi.tables.price")}</TableCell>
              <TableCell align="right">{t("marketUi.tables.qtyRemaining")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const remaining = remainingQuantity(order)
              return (
                <TableRow key={order.buy_order_id} hover>
                  <TableCell>
                    <MuiLink
                      component={RouterLink}
                      to={MARKET_PATHS.buyOrder(order.buy_order_id)}
                      underline="hover"
                      color="text.primary"
                      fontWeight="bold"
                      variant="body2"
                    >
                      {order.game_item_name}
                    </MuiLink>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {order.buyer_name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {fmt.number(order.price_per_unit)} aUEC
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {fmt.number(remaining)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {(data?.total || 0) > 5 && (
        <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button component={RouterLink} to={MARKET_PATHS.buyOrders} size="small" color="secondary">
            {t("dashboard.viewAll", "View All")} ({data?.total})
          </Button>
        </Box>
      )}
    </Section>
  )
}
