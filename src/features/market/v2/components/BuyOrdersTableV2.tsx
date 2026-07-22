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

interface BuyOrderAggregate {
  item_id: string
  item_name: string
  orders: StandingBuyOrder[]
}

export function BuyOrdersTableV2({ aggregates }: { aggregates: BuyOrderAggregate[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Price Range</TableCell>
            <TableCell align="right">Total Qty</TableCell>
            <TableCell align="right">Orders</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregates.map((agg) => {
            const prices = agg.orders.map((o) => o.price_per_unit)
            const min = Math.min(...prices)
            const max = Math.max(...prices)
            const totalQty = agg.orders.reduce((sum, o) => sum + (o.quantity - (o.quantity_fulfilled || 0)), 0)
            return (
              <TableRow key={agg.item_id} hover>
                <TableCell>
                  <MuiLink component={RouterLink} to={MARKET_PATHS.aggregate(agg.item_id)} underline="hover" color="text.primary" fontWeight="bold" variant="body2">
                    {agg.item_name}
                  </MuiLink>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {min === max
                      ? `${min.toLocaleString()} aUEC`
                      : `${min.toLocaleString()} – ${max.toLocaleString()} aUEC`}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{totalQty.toLocaleString()}</Typography>
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
