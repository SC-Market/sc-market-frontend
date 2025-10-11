import { OfferMarketListing, OfferSession } from "../../store/offer"
import {
  Autocomplete,
  Button,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { Stack } from "@mui/system"
import { PaginatedTable } from "../../components/table/PaginatedTable"
import React, { useMemo, useState } from "react"
import { MarketListingDetails } from "../../components/list/UserDetails"
import {
  MarketListingSearchResult,
  useSearchMarketQuery,
} from "../../store/market"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import { marketListingHeadCells } from "./OfferMarketListings"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import { TrashCan } from "mdi-material-ui"
import { useTranslation } from "react-i18next"

export function OfferListingRowItemEditable(props: {
  row: ListingRowItem
  index: number
}) {
  const { t } = useTranslation()
  const { row, index } = props
  const [body, setBody] = useCounterOffer()
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
        <TableCell align={"right"}>
          <Stack
            direction={"row"}
            spacing={1}
            justifyContent={"right"}
            alignItems={"center"}
          >
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values, sourceInfo) => {
                setBody({
                  ...body,
                  market_listings: body.market_listings.map((l) => {
                    if (l.listing_id === row.listing_id) {
                      return {
                        ...l,
                        quantity: Math.min(
                          values.floatValue || 1,
                          row.quantity_available,
                        ),
                      }
                    } else {
                      return l
                    }
                  }),
                })
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {t("OfferMarketListingsEditArea.of", {
                      count: row?.quantity_available || 0,
                    })}
                  </InputAdornment>
                ),
                inputMode: "numeric",
              }}
              size="small"
              label={t("OfferMarketListingsEditArea.qty")}
              value={Math.min(row.quantity || 1, row.quantity_available)}
              color={"secondary"}
            />
            <IconButton
              onClick={() => {
                setBody({
                  ...body,
                  market_listings: body.market_listings.filter(
                    (l) => l.listing_id !== row.listing_id,
                  ),
                })
              }}
            >
              <TrashCan color={"error"} />
            </IconButton>
          </Stack>
        </TableCell>
        <TableCell align={"right"}>
          {row.unit_price.toLocaleString()} aUEC
        </TableCell>
        <TableCell align={"right"}>{row.total.toLocaleString()} aUEC</TableCell>
      </TableRow>
    </Fade>
  )
}

export type ListingRowItem = MarketListingSearchResult & {
  title: string
  total: number
  quantity: number
  unit_price: number
}

export function OfferMarketListingsEditArea(props: { offer: OfferSession }) {
  const { t } = useTranslation()
  const { offer: session } = props
  const [body, setBody] = useCounterOffer()

  const { data: searchResults } = useSearchMarketQuery({
    user_seller: !session.contractor
      ? session.assigned_to?.username
      : undefined,
    contractor_seller: session.contractor?.spectrum_id,
    quantityAvailable: 1,
    index: 0,
    page_size: 50,
  })

  const listings: MarketListingSearchResult[] = useMemo(
    () => searchResults?.listings || [],
    [session.assigned_to, searchResults],
  )

  const extendedListings: ListingRowItem[] = useMemo(() => {
    return body.market_listings
      .map((l) => {
        const fullListing =
          listings.find((c) => c.listing_id === l.listing_id) || null

        if (!fullListing) {
          return null
        }

        return {
          total: l.quantity * fullListing.price,
          quantity: l.quantity,
          unit_price: fullListing.price,
          ...fullListing,
        }
      })
      .filter<ListingRowItem>((o) => !!o)
  }, [body.market_listings, listings])

  const [selected, setSelected] = useState<MarketListingSearchResult | null>(
    null,
  )
  const [quantity, setQuantity] = useState(1)

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
              {t("OfferMarketListingsEditArea.associatedMarketListings")}
            </Typography>
            <Paper>
              <PaginatedTable
                rows={extendedListings}
                initialSort={"title"}
                keyAttr={"listing_id"}
                headCells={marketListingHeadCells.map((cell) => ({
                  ...cell,
                  label: t(
                    `OfferMarketListingsEditArea.${cell.label.toLowerCase()}`,
                    cell.label,
                  ),
                }))}
                generateRow={OfferListingRowItemEditable}
                disableSelect
              />
            </Paper>
            <Stack
              direction="row"
              justifyContent={"space-between"}
              alignItems={"flex-end"}
              spacing={1}
            >
              <Stack
                direction={"column"}
                justifyContent={"left"}
                spacing={1}
                sx={{ flexGrow: 1 }}
              >
                <Typography variant={"body2"} color={"text.secondary"}>
                  {t("OfferMarketListingsEditArea.addMarketListing")}
                </Typography>
                <Autocomplete
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={t("OfferMarketListingsEditArea.selectListing")}
                      fullWidth
                      SelectProps={{
                        IconComponent: KeyboardArrowDownRoundedIcon,
                      }}
                    />
                  )}
                  value={selected}
                  onChange={(event, value) => {
                    setSelected(value)
                    setQuantity(
                      Math.min(quantity, value?.quantity_available || 1),
                    )
                  }}
                  options={listings.filter(
                    (o) =>
                      !body.market_listings.find(
                        (l) => l.listing_id === o.listing_id,
                      ),
                  )}
                  getOptionLabel={(option) => option.title}
                />
                <NumericFormat
                  decimalScale={0}
                  allowNegative={false}
                  customInput={TextField}
                  thousandSeparator
                  onValueChange={async (values, sourceInfo) => {
                    setQuantity(
                      Math.min(
                        values.floatValue || 1,
                        selected?.quantity_available || 1,
                      ),
                    )
                  }}
                  value={quantity}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        {t("OfferMarketListingsEditArea.ofAvailable", {
                          count: selected?.quantity_available || 0,
                        })}
                      </InputAdornment>
                    ),
                    inputMode: "numeric",
                  }}
                  size="small"
                  label={t("OfferMarketListingsEditArea.quantity")}
                  color={"secondary"}
                />
                <Button
                  variant={"contained"}
                  size={"small"}
                  disabled={!selected}
                  onClick={() => {
                    if (!selected) {
                      return
                    }
                    console.log(selected)
                    setBody({
                      ...body,
                      market_listings: [
                        ...body.market_listings,
                        { listing_id: selected.listing_id, quantity },
                      ],
                    })
                    setQuantity(1)
                    setSelected(null)
                  }}
                >
                  {t("OfferMarketListingsEditArea.add")}
                </Button>
              </Stack>
              <Table sx={{ maxWidth: 350 }}>
                <TableRow>
                  <TableCell>
                    {t("OfferMarketListingsEditArea.total")}
                  </TableCell>
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
}
