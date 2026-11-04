import React from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import type { StandingBuyOrder } from "../../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../../routes/paths"
import { useTranslation } from "react-i18next"
import { totalRemainingQuantity } from "../../domain/buyOrders"
import { useFormatters } from "../../../../util/format"

interface BuyOrderAggregate {
  item_id: string
  item_name: string
  orders: StandingBuyOrder[]
}

export function BuyOrdersTableV2({
  aggregates,
}: {
  aggregates: BuyOrderAggregate[]
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("marketUi.tables.item")}</TableCell>
            <TableCell>{t("marketUi.tables.priceRange")}</TableCell>
            <TableCell align="right">{t("marketUi.tables.totalQty")}</TableCell>
            <TableCell align="right">{t("marketUi.tables.orders")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregates.map((agg) => {
            const prices = agg.orders.map((o) => o.price_per_unit)
            const min = Math.min(...prices)
            const max = Math.max(...prices)
            const totalQty = totalRemainingQuantity(agg.orders)
            return (
              <TableRow
                key={agg.item_id}
                hover
                data-testid="buy-order-row"
                data-id={agg.item_id}
              >
                <TableCell>
                  <MuiLink
                    component={RouterLink}
                    to={MARKET_PATHS.aggregate(agg.item_id)}
                    underline="hover"
                    color="text.primary"
                    fontWeight="bold"
                    variant="body2"
                  >
                    {agg.item_name}
                  </MuiLink>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {min === max
                      ? `${fmt.number(min)} aUEC`
                      : `${fmt.number(min)} – ${fmt.number(max)} aUEC`}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {fmt.number(totalQty)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{agg.orders.length}</Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
