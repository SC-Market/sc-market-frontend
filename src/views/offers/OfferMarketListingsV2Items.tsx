/**
 * OfferMarketListingsV2Items — displays V2 market listing items in an offer.
 * Shows listing title, quantity, variant details (quality, source), and price.
 */

import React from "react"
import {
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { Link } from "react-router-dom"
import { formatPrice } from "../../util/formatPrice"
import { Section } from "../../components/paper/Section"

interface V2MarketListing {
  listing_id: string
  title: string
  price: number
  quantity: number
  variants: Array<{
    variant_id: string
    quantity: number
    price_per_unit: number
    attributes: Record<string, unknown>
    display_name: string
    short_name: string
  }>
}

export function OfferMarketListingsV2Items({ items }: { items: V2MarketListing[] }) {
  if (!items.length) return null

  const total = items.reduce((s, i) => s + i.variants.reduce((vs, v) => vs + v.price_per_unit * v.quantity, 0), 0)

  return (
    <Section xs={12} title="Order Items">
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Variant</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Price/Unit</TableCell>
              <TableCell align="right">Subtotal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.flatMap((item) =>
              item.variants.map((v) => (
                <TableRow key={v.variant_id} hover sx={{ cursor: "pointer" }}
                  component={Link} to={`/market/${item.listing_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={v.display_name || v.short_name} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                  </TableCell>
                  <TableCell align="right">{v.quantity}</TableCell>
                  <TableCell align="right">{formatPrice(v.price_per_unit)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatPrice(v.price_per_unit * v.quantity)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography variant="subtitle2">Total</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatPrice(total)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
    </Section>
  )
}
