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
import type { GameItemAggregate } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

function formatPrice(min: number, max: number) {
  if (min === max) return `${min.toLocaleString()} aUEC`
  return `${min.toLocaleString()} – ${max.toLocaleString()} aUEC`
}

export function BulkItemsTableV2({ items }: { items: GameItemAggregate[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Price Range</TableCell>
            <TableCell align="right">Available</TableCell>
            <TableCell align="right">Sellers</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.game_item_id} hover>
              <TableCell padding="none" sx={{ width: 40, pl: 1 }}>
                <Avatar
                  src={item.image_url || FALLBACK_IMAGE_URL}
                  sx={{ width: 40, height: 40 }}
                  variant="rounded"
                  imgProps={{ loading: "lazy" }}
                />
              </TableCell>
              <TableCell>
                <MuiLink component={RouterLink} to={`/market/aggregate/${item.game_item_id}`} underline="hover" color="text.primary" fontWeight="bold" variant="body2">
                  {item.name}
                </MuiLink>
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">{item.type}</Typography>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Typography variant="body2" color="primary" fontWeight="bold">{formatPrice(item.min_price, item.max_price)}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{item.total_quantity.toLocaleString()}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">{item.seller_count}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
