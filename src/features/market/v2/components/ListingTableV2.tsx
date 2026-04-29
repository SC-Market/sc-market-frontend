import React from "react"
import { Link } from "react-router-dom"
import {
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { ListingSearchResult } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

function formatPrice(min: number, max: number) {
  if (min === max) return `${min.toLocaleString()} aUEC`
  return `${min.toLocaleString()}-${max.toLocaleString()} aUEC`
}

export function ListingTableV2({
  listings,
}: {
  listings: ListingSearchResult[]
}) {
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
            <TableRow key={l.listing_id}>
              <TableCell padding="none" sx={{ width: 40, pl: 1 }}>
                <Avatar
                  src={l.photo || FALLBACK_IMAGE_URL}
                  sx={{ width: 40, height: 40 }}
                  variant="rounded"
                />
              </TableCell>
              <TableCell>
                <Link to={`/market/${l.listing_id}`}>{l.title}</Link>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {formatPrice(l.price_min, l.price_max)}
              </TableCell>
              <TableCell>{l.quantity_available}</TableCell>
              <TableCell>
                <Link
                  to={`/${l.seller_type === "contractor" ? "contractor" : "user"}/${l.seller_slug}`}
                >
                  {l.seller_name}
                </Link>
              </TableCell>
              <TableCell>{l.seller_rating.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
