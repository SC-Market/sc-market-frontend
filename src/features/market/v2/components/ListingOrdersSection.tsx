import { useTranslation } from "react-i18next"
/**
 * ListingOrdersSection — shows related orders and pending offers for a listing.
 *
 * Only for viewers who can manage the listing's shop (the shop owner, or a
 * manage_market member of the owning org). That is the rule the backend's
 * GET /orders/by-listing enforces (canManageListing), so the query is only
 * sent when it can succeed:
 * anonymous visitors and other users never request it (it would 401/403).
 */

import React from "react"
import { Grid, Typography, Chip, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { Link } from "react-router-dom"
import { useGetOrdersByListingQuery, type ListingOrderSummary, type ListingOfferSummary } from "../../../../store/api/v2/market"
import { Section } from "../../../../components/paper/Section"
import { ORDER_PATHS } from "../../../../routes/paths"
import { useListingPermissions } from "../../hooks/useListingPermissions"

import { useFormatters } from "../../../../util/format"
export function ListingOrdersSection({ listingId, shopId }: { listingId: string; shopId: string }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { canManage } = useListingPermissions(shopId)
  const { data, error } = useGetOrdersByListingQuery({ listingId }, { skip: !listingId || !canManage })

  if (!canManage || error || !data) return null
  if (!data.orders.length && !data.offers.length) return null

  return (
    <Section xs={12} title={t("marketV2.ordersAndOffers")}>
      {data.offers.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t("marketV2.pendingOffers", { count: data.offers.length })}</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("marketV2.buyer")}</TableCell>
                <TableCell>{t("marketV2.status")}</TableCell>
                <TableCell align="right">{t("marketV2.qty")}</TableCell>
                <TableCell align="right">{t("marketV2.price")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.offers.map((o: ListingOfferSummary) => (
                <TableRow key={o.session_id} hover component={Link} to={ORDER_PATHS.offer(o.session_id)}
                  sx={{ textDecoration: "none", color: "inherit" }}>
                  <TableCell>{o.buyer_name}</TableCell>
                  <TableCell><Chip label={o.status} size="small" sx={{ height: 20, fontSize: "0.65rem" }} /></TableCell>
                  <TableCell align="right">{o.quantity}</TableCell>
                  <TableCell align="right">{fmt.price(o.price_per_unit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      )}

      {data.orders.length > 0 && (
        <Grid item xs={12} sx={{ mt: data.offers.length ? 2 : 0 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t("marketV2.ordersCount", { count: data.orders.length })}</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("marketV2.buyer")}</TableCell>
                <TableCell>{t("marketV2.status")}</TableCell>
                <TableCell align="right">{t("marketV2.qty")}</TableCell>
                <TableCell align="right">{t("marketV2.price")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.orders.map((o: ListingOrderSummary) => (
                <TableRow key={o.order_id} hover component={Link} to={ORDER_PATHS.contract(o.order_id)}
                  sx={{ textDecoration: "none", color: "inherit" }}>
                  <TableCell>{o.buyer_name}</TableCell>
                  <TableCell><Chip label={o.status} size="small" sx={{ height: 20, fontSize: "0.65rem" }} /></TableCell>
                  <TableCell align="right">{o.quantity}</TableCell>
                  <TableCell align="right">{fmt.price(o.price_per_unit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      )}
    </Section>
  )
}
