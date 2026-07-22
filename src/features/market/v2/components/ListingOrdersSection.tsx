/**
 * ListingOrdersSection — shows related orders and pending offers for a listing.
 * Only visible to the listing owner / org members (backend enforces).
 */

import React from "react"
import { Grid, Typography, Chip, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { Link } from "react-router-dom"
import { useGetOrdersByListingQuery, type ListingOrderSummary, type ListingOfferSummary } from "../../../../store/api/v2/market"
import { Section } from "../../../../components/paper/Section"
import { formatPrice } from "../../../../util/formatPrice"
import { ORDER_PATHS } from "../../../../routes/paths"

export function ListingOrdersSection({ listingId }: { listingId: string }) {
  const { data, error } = useGetOrdersByListingQuery({ listingId }, { skip: !listingId })

  if (error || !data) return null
  if (!data.orders.length && !data.offers.length) return null

  return (
    <Section xs={12} title="Orders & Offers">
      {data.offers.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Pending Offers ({data.offers.length})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Buyer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.offers.map((o: ListingOfferSummary) => (
                <TableRow key={o.session_id} hover component={Link} to={ORDER_PATHS.offer(o.session_id)}
                  sx={{ textDecoration: "none", color: "inherit" }}>
                  <TableCell>{o.buyer_name}</TableCell>
                  <TableCell><Chip label={o.status} size="small" sx={{ height: 20, fontSize: "0.65rem" }} /></TableCell>
                  <TableCell align="right">{o.quantity}</TableCell>
                  <TableCell align="right">{formatPrice(o.price_per_unit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      )}

      {data.orders.length > 0 && (
        <Grid item xs={12} sx={{ mt: data.offers.length ? 2 : 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Orders ({data.orders.length})</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Buyer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.orders.map((o: ListingOrderSummary) => (
                <TableRow key={o.order_id} hover component={Link} to={ORDER_PATHS.contract(o.order_id)}
                  sx={{ textDecoration: "none", color: "inherit" }}>
                  <TableCell>{o.buyer_name}</TableCell>
                  <TableCell><Chip label={o.status} size="small" sx={{ height: 20, fontSize: "0.65rem" }} /></TableCell>
                  <TableCell align="right">{o.quantity}</TableCell>
                  <TableCell align="right">{formatPrice(o.price_per_unit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      )}
    </Section>
  )
}
