/**
 * OfferMarketListingsV2Items — displays V2 market listing items in an offer.
 * Shows listing photo, title, variant details, quantity, and price.
 */

import React from "react"
import {
  Avatar,
  Grid,
  Stack,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { InventoryRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { formatPrice } from "../../util/formatPrice"
import { Section } from "../../components/paper/Section"
import type { OfferMarketListingV2, OrderMarketListingV2 } from "../../store/api/v2/market"

export function OfferMarketListingsV2Items({ items }: { items: (OfferMarketListingV2 | OrderMarketListingV2)[] }) {
  if (!items.length) return null

  const total = items.reduce(
    (s, i) => s + i.v2_variants.reduce((vs, v) => vs + v.price_per_unit * v.quantity, 0),
    0,
  )

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
              item.v2_variants.map((v) => (
                <TableRow
                  key={v.variant_id}
                  hover
                  sx={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                  component={Link}
                  to={`/market/${item.listing_id}`}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={item.photo || undefined}
                        variant="rounded"
                        sx={{ width: 32, height: 32, borderRadius: 1 }}
                      >
                        <InventoryRounded fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>
                        {item.title}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={v.display_name || v.short_name}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                  </TableCell>
                  <TableCell align="right">{v.quantity}</TableCell>
                  <TableCell align="right">{formatPrice(v.price_per_unit)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatPrice(v.price_per_unit * v.quantity)}
                    </Typography>
                  </TableCell>
                </TableRow>
              )),
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
