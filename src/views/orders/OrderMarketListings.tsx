import {
  Fade,
  Grid,
  Paper,
  Table,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import { Stack } from "@mui/system"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import React, { useMemo } from "react"
import { MarketListingDetails } from "../../components/list/UserDetails"
import { MarketListingType } from "../../datatypes/MarketListing"
import { Order } from "../../datatypes/Order"
import { ListingRowItem } from "../offers/OfferMarketListings"

export function OrderListingRowItem(props: {
  row: ListingRowItem
  index: number
}) {
  const { row, index } = props
  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <TableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        tabIndex={-1}
        key={index}
      >
        <TableCell component="th" scope="row">
          <MarketListingDetails listing={row.listing} />
        </TableCell>
        <TableCell align={"right"}>{row.quantity.toLocaleString()}</TableCell>
        <TableCell align={"right"}>
          {row.unit_price.toLocaleString()} aUEC
        </TableCell>
        <TableCell align={"right"}>{row.total.toLocaleString()} aUEC</TableCell>
      </TableRow>
    </Fade>
  )
}

export const marketListingHeadCells: readonly HeadCell<ListingRowItem>[] = [
  {
    id: "title",
    numeric: false,
    disablePadding: false,
    label: "Product",
  },
  {
    id: "quantity",
    numeric: true,
    disablePadding: false,
    label: "Qty",
  },
  {
    id: "unit_price",
    numeric: true,
    disablePadding: false,
    label: "Unit Price",
  },
  {
    id: "total",
    numeric: true,
    disablePadding: false,
    label: "Total",
  },
]

export function OrderMarketListings(props: { order: Order }) {
  const { order } = props
  const extendedListings = useMemo(() => {
    return order.market_listings!.map((l) => ({
      ...l,
      title: l.listing.details.title,
      unit_price: l.listing.listing.price,
      total: l.quantity * l.listing.listing.price,
    }))
  }, [order])

  if (order.market_listings!.length > 0) {
    return (
      <>
        <Grid item xs={12} lg={8} md={12}>
          <Paper sx={{ padding: 2 }}>
            <Stack spacing={1} direction="column">
              <Typography
                variant={"h5"}
                sx={{ fontWeight: "bold" }}
                color={"text.secondary"}
              >
                Associated Market Listings
              </Typography>
              <Paper>
                <PaginatedTable
                  rows={extendedListings}
                  initialSort={"quantity"}
                  keyAttr={"listing_id"}
                  headCells={marketListingHeadCells}
                  generateRow={OrderListingRowItem}
                  disableSelect
                />
              </Paper>
              <Stack
                direction="row"
                justifyContent={"right"}
                alignItems={"right"}
              >
                <Table sx={{ maxWidth: 350 }}>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell align={"right"}>
                      {extendedListings
                        .reduce((a, b) => a + b.total, 0)
                        .toLocaleString()}{" "}
                      aUEC
                    </TableCell>
                  </TableRow>
                </Table>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </>
    )
  } else {
    return (
      <Grid item xs={12} lg={8} md={12}>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={1}>
            <Typography
              variant={"h5"}
              sx={{ fontWeight: "bold" }}
              color={"text.secondary"}
            >
              Associated Market Listings
            </Typography>
            <Typography variant={"subtitle2"}>
              No associated listings
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    )
  }
}
