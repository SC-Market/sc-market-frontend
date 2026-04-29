import React from "react"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { Link } from "react-router-dom"
import type { StandingBuyOrder } from "../../../../store/api/v2/market"

interface BuyOrderAggregate {
  item_id: string
  item_name: string
  orders: StandingBuyOrder[]
}

export function BuyOrdersTableV2({ aggregates }: { aggregates: BuyOrderAggregate[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Item</TableCell>
          <TableCell align="right">Price Range</TableCell>
          <TableCell align="right">Total Qty</TableCell>
          <TableCell align="right">Orders</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {aggregates.map((agg) => {
          const prices = agg.orders.map((o) => o.price_per_unit)
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          const totalQty = agg.orders.reduce((sum, o) => sum + o.quantity, 0)
          return (
            <TableRow key={agg.item_id} hover>
              <TableCell>
                <Link to={`/market/aggregate/${agg.item_id}`} style={{ color: "inherit" }}>
                  {agg.item_name}
                </Link>
              </TableCell>
              <TableCell align="right">
                {min === max
                  ? `${min.toLocaleString()} aUEC`
                  : `${min.toLocaleString()} – ${max.toLocaleString()} aUEC`}
              </TableCell>
              <TableCell align="right">{totalQty.toLocaleString()}</TableCell>
              <TableCell align="right">{agg.orders.length}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
