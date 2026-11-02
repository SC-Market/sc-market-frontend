/**
 * OfferMarketListingsV1Items — displays V1 market listing items in an offer.
 * Simple table with title, quantity, and price. No variant data.
 */

import React from "react"
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { formatPrice } from "../../util/formatPrice"
import { Section } from "../../components/paper/Section"
import type { OfferMarketListingV1 } from "../../store/api/v2/market"

export function OfferMarketListingsV1Items({ items }: { items: OfferMarketListingV1[] }) {
  const { t } = useTranslation()
  if (!items.length) return null

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <Section xs={12} title={t("marketUi.offerItems.title")}>
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("marketUi.offerItems.colItem")}</TableCell>
              <TableCell align="right">{t("marketUi.offerItems.colQty")}</TableCell>
              <TableCell align="right">{t("marketUi.offerItems.colUnitPrice")}</TableCell>
              <TableCell align="right">{t("marketUi.offerItems.colSubtotal")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.listing_id}
                hover
                sx={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
                component={Link}
                to={`/listing/${item.listing_id}`}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {item.title}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">{formatPrice(item.price)}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">
                <Typography variant="subtitle2">{t("marketUi.offerItems.total")}</Typography>
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
