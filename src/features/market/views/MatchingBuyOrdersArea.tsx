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
import {
  useGetMatchesForSellerQuery,
  type StandingBuyOrder,
} from "../../../store/api/v2/market"

export function MatchingBuyOrdersArea() {
  const { t, i18n } = useTranslation()
  const { data, isLoading } = useGetMatchesForSellerQuery({ page: 1, pageSize: 5 })
  const orders = data?.buy_orders || []

  if (isLoading || orders.length === 0) return null

  return (
    <Section
      title={t("dashboard.matchingBuyOrders", "Buy Orders You Can Fulfill")}
      xs={12}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Buyer</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Qty Remaining</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const remaining = order.quantity - (order.quantity_fulfilled || 0)
              return (
                <TableRow key={order.buy_order_id} hover>
                  <TableCell>
                    <MuiLink
                      component={RouterLink}
                      to={`/buyorder/${order.buy_order_id}`}
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
                      {order.price_per_unit.toLocaleString(i18n.language)} aUEC
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {remaining.toLocaleString(i18n.language)}
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
          <Button component={RouterLink} to="/buyorders" size="small" color="secondary">
            {t("dashboard.viewAll", "View All")} ({data?.total})
          </Button>
        </Box>
      )}
    </Section>
  )
}
