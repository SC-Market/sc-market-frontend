import { OfferMarketListing, OfferSession } from "../../store/offer"
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
import { useTranslation } from "react-i18next"
import { completeToSearchResult } from "../market/ItemListings.tsx"
import { ListingRowItem } from "./OfferMarketListingsEditArea.tsx"

export function OfferListingRowItem(props: {
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
          <MarketListingDetails listing={row} />
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
    label: "OfferMarketListings.product",
  },
  {
    id: "quantity",
    numeric: true,
    disablePadding: false,
    label: "OfferMarketListings.qty",
  },
  {
    id: "unit_price",
    numeric: true,
    disablePadding: false,
    label: "OfferMarketListings.unitPrice",
  },
  {
    id: "total",
    numeric: true,
    disablePadding: false,
    label: "OfferMarketListings.total",
  },
]

export function OfferMarketListings(props: { offer: OfferSession }) {
  const { t } = useTranslation()
  const { offer: session } = props
  const extendedListings: ListingRowItem[] = useMemo(() => {
    return session.offers[0].market_listings.map((l) => ({
      ...completeToSearchResult(l.listing),
      unit_price: l.listing.listing.price,
      total: l.quantity * l.listing.listing.price,
      quantity: l.quantity,
    }))
  }, [session.offers])

  if (session.offers[0].market_listings.length > 0) {
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
                {t("OfferMarketListings.associatedMarketListings")}
              </Typography>
              <Paper>
                <PaginatedTable
                  rows={extendedListings}
                  initialSort={"quantity"}
                  keyAttr={"listing_id"}
                  headCells={marketListingHeadCells.map((cell) => ({
                    ...cell,
                    label: t(cell.label),
                  }))}
                  generateRow={OfferListingRowItem}
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
                    <TableCell>{t("OfferMarketListings.total")}</TableCell>
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
              {t("OfferMarketListings.associatedMarketListings")}
            </Typography>
            <Typography variant={"subtitle2"}>
              {t("OfferMarketListings.noAssociatedListings")}
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    )
  }
}
