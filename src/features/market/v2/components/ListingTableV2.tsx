import React from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Avatar,
  Chip,
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
import { ListingSearchResult } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { formatMarketUrl } from "../../domain/urls"
import { SHOP_PATHS } from "../../../../routes/paths"

function formatPrice(min: number, max: number) {
  if (min === max) return `${min.toLocaleString()} aUEC`
  return `${min.toLocaleString()} – ${max.toLocaleString()} aUEC`
}

export function ListingTableV2({ listings }: { listings: ListingSearchResult[] }) {
  const { t } = useTranslation()
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Title</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listings.map((l) => (
            <TableRow key={l.listing_id} hover>
              <TableCell padding="none" sx={{ width: 40, pl: 1 }}>
                <Avatar
                  src={l.photo || FALLBACK_IMAGE_URL}
                  sx={{ width: 40, height: 40 }}
                  variant="rounded"
                  imgProps={{ loading: "lazy" }}
                />
              </TableCell>
              <TableCell>
                <MuiLink component={RouterLink} to={formatMarketUrl(l)} underline="hover" color="text.primary" fontWeight="bold" variant="body2">
                  {l.title}
                </MuiLink>
                {l.visibility === "private" && (
                  <Chip label={t("market.internalListing")} color="warning" size="small" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem", fontWeight: "bold", textTransform: "uppercase" }} />
                )}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Typography variant="body2" color="primary" fontWeight="bold">{formatPrice(l.price_min, l.price_max)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{l.quantity_available.toLocaleString()}</Typography>
              </TableCell>
              <TableCell>
                <MuiLink component={RouterLink} to={SHOP_PATHS.profile(l.shop_slug)} underline="hover" color="text.secondary" variant="caption">
                  {l.shop_name}
                </MuiLink>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">{l.shop_rating.toFixed(1)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
