import { OfferMarketListing, OfferSession } from "../../store/offer"
import { Stack } from "@mui/system"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import React, { useMemo } from "react"
import { MarketListingDetails } from "../../components/list/UserDetails"
import { useTranslation } from "react-i18next"
import { completeToSearchResult } from "../market/ItemListings.tsx"
import { ListingRowItem } from "./OfferMarketListingsEditArea.tsx"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';

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
  const theme = useTheme<ExtendedTheme>()
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
            <Stack spacing={theme.layoutSpacing.compact} direction="column">
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
          <Stack spacing={theme.layoutSpacing.compact}>
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
