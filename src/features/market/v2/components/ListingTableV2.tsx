import React from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Avatar,
  Link as MuiLink,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { ListingSearchResult } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

function formatPrice(min: number, max: number) {
  if (min === max) return `${min.toLocaleString()} aUEC`
  return `${min.toLocaleString()} – ${max.toLocaleString()} aUEC`
}

export function ListingTableV2({ listings }: { listings: ListingSearchResult[] }) {
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
                <MuiLink component={RouterLink} to={`/market/${l.listing_id}`} underline="hover" color="text.primary" fontWeight="bold" variant="body2">
                  {l.title}
                </MuiLink>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Typography variant="body2" color="primary" fontWeight="bold">{formatPrice(l.price_min, l.price_max)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{l.quantity_available.toLocaleString()}</Typography>
              </TableCell>
              <TableCell>
                <MuiLink component={RouterLink} to={`/${l.seller_type === "contractor" ? "contractor" : "user"}/${l.seller_slug}`} underline="hover" color="text.secondary" variant="caption">
                  {l.seller_name}
                </MuiLink>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">{l.seller_rating.toFixed(1)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
