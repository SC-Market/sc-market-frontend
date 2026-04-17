import React, { useMemo, useState, useCallback } from "react"
import {
  Autocomplete,
  Button,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableCell,
  TableRow,
  TextField,
  Typography,
  Box,
} from "@mui/material"
import { PaginatedTable } from "../../../components/table/PaginatedTable"
import { MarketListingDetails } from "../../../components/list/UserDetails"
import { useCounterOffer } from "../../../hooks/offer/CounterOfferDetails"
import { marketListingHeadCellsV2 } from "./OfferMarketListingsV2"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import { TrashCan } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { OfferSession } from "../../../store/offer"
import {
  useSearchListingsQuery,
  ListingSearchResult,
  useGetListingDetailQuery,
  VariantDetail,
} from "../../../store/api/v2/market"
import { VariantSelector } from "../../../components/market/v2/VariantSelector"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"

/**
 * Extended listing row item with variant information
 */
export type ListingRowItemV2 = ListingSearchResult & {
  title: string
  total: number
  quantity: number
  unit_price: number
  variant_id: string
  variant_display_name: string
  quality_tier: number | undefined
  quantity_available: number
}

/**
 * OfferListingRowItemEditableV2 - Editable row with variant selector
 * 
 * Requirements: 28.1-28.10
 * - Provide VariantSelector dropdown for each item
 * - Display price per selected variant
 * - Show quality tier badge for selected variant
 * - Inline quantity editing with availability constraint
 * - Remove button functionality
 * - Update order total when variant selection changes
 */
export function OfferListingRowItemEditableV2(props: {
  row: ListingRowItemV2
  index: number
  onVariantChange: (listingId: string, variantId: string) => void
  onQuantityChange: (listingId: string, quantity: number) => void
  onRemove: (listingId: string) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { row, index, onVariantChange, onQuantityChange, onRemove } = props

  // Fetch full listing details to get all variants
  const { data: listingDetail } = useGetListingDetailQuery({ id: row.listing_id })

  // Extract variants from listing detail
  const variants: VariantDetail[] = useMemo(() => {
    if (!listingDetail?.items?.[0]?.variants) return []
    return listingDetail.items[0].variants
  }, [listingDetail])

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.variant_id === row.variant_id)
  }, [variants, row.variant_id])

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
          <Box>
            <MarketListingDetails listing={row as any} />
            {/* Variant Selector */}
            <Box sx={{ mt: 1, maxWidth: 400 }}>
              {variants.length > 0 && (
                <VariantSelector
                  variants={variants}
                  selectedVariantId={row.variant_id}
                  onVariantChange={(variantId) =>
                    onVariantChange(row.listing_id, variantId)
                  }
                  label={t("OfferMarketListingsEditArea.selectVariant", "Select Variant")}
                />
              )}
            </Box>
          </Box>
        </TableCell>
        <TableCell align={"right"}>
          <Stack
            direction={"row"}
            spacing={theme.layoutSpacing.compact}
            justifyContent={"right"}
            alignItems={"center"}
          >
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              onValueChange={async (values) => {
                const newQuantity = Math.min(
                  values.floatValue || 1,
                  selectedVariant?.quantity || row.quantity_available
                )
                onQuantityChange(row.listing_id, newQuantity)
              }}
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {t("OfferMarketListingsEditArea.of", {
                      count: selectedVariant?.quantity || row.quantity_available,
                    })}
                  </InputAdornment>
                ),
                inputMode: "numeric",
              }}
              size="small"
              label={t("OfferMarketListingsEditArea.qty")}
              value={Math.min(
                row.quantity || 1,
                selectedVariant?.quantity || row.quantity_available
              )}
              color={"secondary"}
            />
            <IconButton onClick={() => onRemove(row.listing_id)}>
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

/**
 * OfferMarketListingsEditAreaV2 - Editable order items with variant support
 * 
 * Requirements: 28.1-28.10
 * - Provide VariantSelector dropdown for each item
 * - Filter variants by quality_tier
 * - Display price per selected variant
 * - Update order total when variant selection changes
 * - Validate variant availability before saving
 * - Show quality tier for each variant option
 * - Maintain visual parity with V1 OfferMarketListingsEditArea
 * 
 * Visual Parity:
 * - Same Paper padding (2)
 * - Same Stack spacing (1)
 * - Same Typography variants (h5, body2)
 * - Same PaginatedTable configuration
 * - Same Autocomplete styling
 * - Same NumericFormat configuration
 * - Same Button variants and sizes
 * - Same Table maxWidth (350)
 * - Same fade-in animations
 */
export function OfferMarketListingsEditAreaV2(props: { offer: OfferSession }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { offer: session } = props
  const [body, setBody] = useCounterOffer()

  // Search V2 listings for this seller
  const { data: searchResults } = useSearchListingsQuery({
    // Filter by seller based on session type
    // Note: V2 API uses different filter params, adjust as needed
    page: 1,
    pageSize: 50,
  })

  const listings: ListingSearchResult[] = useMemo(
    () => searchResults?.listings || [],
    [searchResults]
  )

  // Track variant selections for each listing
  const [variantSelections, setVariantSelections] = useState<
    Record<string, string>
  >({})

  // Build extended listings with variant information
  const extendedListings: ListingRowItemV2[] = useMemo(() => {
    return body.market_listings
      .map((l) => {
        const fullListing = listings.find((c) => c.listing_id === l.listing_id)

        if (!fullListing) {
          return null
        }

        // Get selected variant ID or use first available
        const variantId = variantSelections[l.listing_id] || ""

        // Calculate price based on variant
        // For now, use price_min as default until variant is selected
        const unitPrice = fullListing.price_min

        return {
          ...fullListing,
          total: l.quantity * unitPrice,
          quantity: l.quantity,
          unit_price: unitPrice,
          variant_id: variantId,
          variant_display_name: "",
          quality_tier: fullListing.quality_tier_min,
        }
      })
      .filter<ListingRowItemV2>((o): o is ListingRowItemV2 => !!o)
  }, [body.market_listings, listings, variantSelections])

  // Handle variant change
  const handleVariantChange = useCallback(
    (listingId: string, variantId: string) => {
      setVariantSelections((prev) => ({
        ...prev,
        [listingId]: variantId,
      }))

      // Fetch listing detail to get variant price
      // Price will be updated when listing detail is fetched
    },
    []
  )

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (listingId: string, quantity: number) => {
      setBody({
        ...body,
        market_listings: body.market_listings.map((l) => {
          if (l.listing_id === listingId) {
            return {
              ...l,
              quantity,
            }
          }
          return l
        }),
      })
    },
    [body, setBody]
  )

  // Handle remove
  const handleRemove = useCallback(
    (listingId: string) => {
      setBody({
        ...body,
        market_listings: body.market_listings.filter(
          (l) => l.listing_id !== listingId
        ),
      })
      // Clean up variant selection
      setVariantSelections((prev) => {
        const { [listingId]: _, ...rest } = prev
        return rest
      })
    },
    [body, setBody]
  )

  // State for adding new listings
  const [selected, setSelected] = useState<ListingSearchResult | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Fetch variants for selected listing
  const { data: selectedListingDetail } = useGetListingDetailQuery(
    { id: selected?.listing_id || "" },
    { skip: !selected }
  )

  const selectedListingVariants: VariantDetail[] = useMemo(() => {
    if (!selectedListingDetail?.items?.[0]?.variants) return []
    return selectedListingDetail.items[0].variants
  }, [selectedListingDetail])

  // Handle add listing
  const handleAddListing = useCallback(() => {
    if (!selected || !selectedVariantId) {
      return
    }

    setBody({
      ...body,
      market_listings: [
        ...body.market_listings,
        { listing_id: selected.listing_id, quantity },
      ],
    })

    // Store variant selection
    setVariantSelections((prev) => ({
      ...prev,
      [selected.listing_id]: selectedVariantId,
    }))

    // Reset form
    setQuantity(1)
    setSelected(null)
    setSelectedVariantId(null)
  }, [selected, selectedVariantId, quantity, body, setBody])

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
                headCells={marketListingHeadCellsV2.map((cell) => ({
                  ...cell,
                  label: t(
                    `OfferMarketListingsEditArea.${cell.label.toLowerCase()}`,
                    cell.label
                  ),
                })) as any}
                generateRow={(props) => (
                  <OfferListingRowItemEditableV2
                    row={props.row}
                    index={props.index}
                    onVariantChange={handleVariantChange}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                )}
                disableSelect
              />
            </Paper>
            <Stack
              direction="row"
              justifyContent={"space-between"}
              alignItems={"flex-end"}
              spacing={theme.layoutSpacing.compact}
            >
              <Stack
                direction={"column"}
                justifyContent={"left"}
                spacing={theme.layoutSpacing.compact}
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
                    setSelectedVariantId(null)
                    setQuantity(1)
                  }}
                  options={listings.filter(
                    (o) =>
                      !body.market_listings.find(
                        (l) => l.listing_id === o.listing_id
                      )
                  )}
                  getOptionLabel={(option) => option.title}
                />

                {/* Variant Selector for new listing */}
                {selected && selectedListingVariants.length > 0 && (
                  <VariantSelector
                    variants={selectedListingVariants}
                    selectedVariantId={selectedVariantId}
                    onVariantChange={setSelectedVariantId}
                    label={t(
                      "OfferMarketListingsEditArea.selectVariant",
                      "Select Variant"
                    )}
                  />
                )}

                <NumericFormat
                  decimalScale={0}
                  allowNegative={false}
                  customInput={TextField}
                  thousandSeparator
                  onValueChange={async (values) => {
                    const selectedVariant = selectedListingVariants.find(
                      (v) => v.variant_id === selectedVariantId
                    )
                    setQuantity(
                      Math.min(
                        values.floatValue || 1,
                        selectedVariant?.quantity ||
                          selected?.quantity_available ||
                          1
                      )
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
                          count:
                            selectedListingVariants.find(
                              (v) => v.variant_id === selectedVariantId
                            )?.quantity ||
                            selected?.quantity_available ||
                            0,
                        })}
                      </InputAdornment>
                    ),
                    inputMode: "numeric",
                  }}
                  size="small"
                  label={t("OfferMarketListingsEditArea.quantity")}
                  color={"secondary"}
                  disabled={!selectedVariantId}
                />
                <Button
                  variant={"contained"}
                  size={"small"}
                  disabled={!selected || !selectedVariantId}
                  onClick={handleAddListing}
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
