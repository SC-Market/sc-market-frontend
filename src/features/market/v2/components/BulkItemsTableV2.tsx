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
import { GameItemAggregate } from "../../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"

export function BulkItemsTableV2({ items }: { items: GameItemAggregate[] }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Image</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Price Range</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>Sellers</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.game_item_id}>
              <TableCell padding="none" sx={{ pl: 2 }}>
                <Avatar
                  src={item.image_url || FALLBACK_IMAGE_URL}
                  alt={item.name}
                  sx={{ width: 40, height: 40 }}
                />
              </TableCell>
              <TableCell>
                <Link to={`/market/aggregate/${item.game_item_id}`}>
                  {item.name}
                </Link>
              </TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>
                {item.min_price.toLocaleString()} -{" "}
                {item.max_price.toLocaleString()} aUEC
              </TableCell>
              <TableCell>{item.total_quantity.toLocaleString()}</TableCell>
              <TableCell>{item.seller_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
