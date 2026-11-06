import React, { useMemo, useState, useCallback } from "react"
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { InventoryRounded } from "@mui/icons-material"
import { useCounterOffer } from "../../../hooks/offer/CounterOfferDetails"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { NumericFormat } from "react-number-format"
import { TrashCan } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import type { GetOfferSessionV2Response } from "../../../store/api/v2/market"
import {
  useSearchListingsQuery,
  useGetListingDetailQuery,
  type ListingSearchResult,
  type VariantDetail,
} from "../../../store/api/v2/market"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { formatCraftedSource, hasDisplayableSource } from "../../../util/variantDisplay"
import { useFormatters } from "../../../util/format"

/** A single variant item in the counteroffer */
interface V2Item {
  listing_id: string
  variant_id: string
  quantity: number
  price_per_unit: number
}

/** Enriched item for display */
interface DisplayItem extends V2Item {
  listing_title: string
  listing_photo?: string
  variant: VariantDetail
}

/**
 * OfferMarketListingsEditAreaV2 — editable V2 market items for counteroffers.
 * Supports multiple variants per listing with rich attribute chips.
 */
export function OfferMarketListingsEditAreaV2(props: { session: GetOfferSessionV2Response }) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const { session } = props
  const [body, setBody] = useCounterOffer()

  // Derive shop slug: prefer the session-level field, fall back to listing detail
  const firstListingId =
    session.offers[0]?.market_listings_v2?.[0]?.listing_id ??
    session.offers[0]?.market_listings?.[0]?.listing_id
  const { data: firstListingDetail } = useGetListingDetailQuery(
    { id: firstListingId || "" },
    { skip: !!session.shop_slug || !firstListingId },
  )
  const sellerShopSlug = session.shop_slug ?? firstListingDetail?.seller?.slug

  // Search listings scoped to this seller's shop
  const { data: searchResults } = useSearchListingsQuery({
    shopSlug: sellerShopSlug ?? undefined,
    quantityMin: 1,
    page: 1,
    pageSize: 50,
  })
  const listings = useMemo(() => searchResults?.listings || [], [searchResults?.listings])

  // Add-item state
  const [selectedListing, setSelectedListing] = useState<ListingSearchResult | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [addQuantity, setAddQuantity] = useState(1)

  // Fetch detail for selected listing (to get variants)
  const { data: selectedDetail } = useGetListingDetailQuery(
    { id: selectedListing?.listing_id || "" },
    { skip: !selectedListing },
  )
  const availableVariants: VariantDetail[] = useMemo(
    () => selectedDetail?.items?.[0]?.variants || [],
    [selectedDetail],
  )

  // Fetch details for all listings in the body (for variant info)

  // Cache variant details from offer data and newly added items
  const [variantCache, setVariantCache] = useState<Record<string, VariantDetail>>(() => {
    const cache: Record<string, VariantDetail> = {}
    for (const ml of session.offers[0]?.market_listings_v2 || []) {
      for (const v of ml.v2_variants) {
        cache[v.variant_id] = {
          variant_id: v.variant_id,
          attributes: v.attributes,
          display_name: v.display_name,
          short_name: v.short_name,
          quantity: v.quantity,
          price: v.price_per_unit,
          locations: [],
        }
      }
    }
    return cache
  })

  // Build display items by enriching v2_variant_items with cached variant data
  const displayItems: DisplayItem[] = useMemo(() => {
    return (body.v2_variant_items || []).map((item) => {
      const listing = listings.find((l) => l.listing_id === item.listing_id)
      const offerListing = session.offers[0]?.market_listings_v2?.find((ml) => ml.listing_id === item.listing_id)
      const cached = variantCache[item.variant_id]

      return {
        ...item,
        listing_title: listing?.title || offerListing?.title || "Unknown",
        listing_photo: listing?.photo,
        variant: cached || {
          variant_id: item.variant_id,
          attributes: {},
          display_name: "Standard",
          short_name: "STD",
          quantity: item.quantity,
          price: item.price_per_unit,
          locations: [],
        },
      }
    })
  }, [body.v2_variant_items, listings, session.offers, variantCache])

  const total = displayItems.reduce((s, i) => s + i.price_per_unit * i.quantity, 0)

  const handleRemove = useCallback((variantId: string) => {
    setBody({
      ...body,
      v2_variant_items: (body.v2_variant_items || []).filter((i) => i.variant_id !== variantId),
    })
  }, [body, setBody])

  const handleQuantityChange = useCallback((variantId: string, quantity: number) => {
    setBody({
      ...body,
      v2_variant_items: (body.v2_variant_items || []).map((i) =>
        i.variant_id === variantId ? { ...i, quantity } : i,
      ),
    })
  }, [body, setBody])

  const handleAdd = useCallback(() => {
    if (!selectedListing || !selectedVariantId) return
    const variant = availableVariants.find((v) => v.variant_id === selectedVariantId)
    if (!variant) return

    // Cache variant details for display
    setVariantCache((prev) => ({ ...prev, [selectedVariantId]: variant }))

    // Merge if same variant already exists, otherwise append
    const existingV2 = (body.v2_variant_items || []).find(
      (i) => i.listing_id === selectedListing.listing_id && i.variant_id === selectedVariantId,
    )

    const updatedV2Items = existingV2
      ? (body.v2_variant_items || []).map((i) =>
          i.listing_id === selectedListing.listing_id && i.variant_id === selectedVariantId
            ? { ...i, quantity: i.quantity + addQuantity }
            : i,
        )
      : [
          ...(body.v2_variant_items || []),
          {
            listing_id: selectedListing.listing_id,
            variant_id: selectedVariantId,
            quantity: addQuantity,
            price_per_unit: variant.price,
          },
        ]

    setBody({
      ...body,
      v2_variant_items: updatedV2Items,
    })

    setSelectedListing(null)
    setSelectedVariantId("")
    setAddQuantity(1)
  }, [selectedListing, selectedVariantId, addQuantity, availableVariants, body, setBody])

  const selectedVariant = availableVariants.find((v) => v.variant_id === selectedVariantId)

  return (
    <Grid item xs={12} lg={8} md={12}>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }} color="text.secondary">
            {t("OfferMarketListingsEditArea.associatedMarketListings")}
          </Typography>

          {/* Items table */}
          {displayItems.length > 0 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("marketV2.item")}</TableCell>
                  <TableCell>{t("marketV2.variant")}</TableCell>
                  <TableCell align="right">{t("marketV2.qty")}</TableCell>
                  <TableCell align="right">{t("marketV2.price")}</TableCell>
                  <TableCell align="right">{t("marketV2.subtotal")}</TableCell>
                  <TableCell width={48} />
                </TableRow>
              </TableHead>
              <TableBody>
                {displayItems.map((item) => (
                  <TableRow key={item.variant_id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ImageAvatar
                          alt=""
                          src={item.listing_photo}
                          variant="rounded"
                          sx={{ width: 32, height: 32, borderRadius: 1 }}
                        >
                          <InventoryRounded fontSize="small" />
                        </ImageAvatar>
                        <Typography variant="body2" fontWeight={600}>
                          {item.listing_title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
                        {item.variant.attributes.quality_tier != null && (
                          <QualityBadge tier={item.variant.attributes.quality_tier} size="small" />
                        )}
                        {hasDisplayableSource(item.variant.attributes.crafted_source) && (
                          <Chip
                            label={formatCraftedSource(String(item.variant.attributes.crafted_source))}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <NumericFormat
                        decimalScale={0}
                        allowNegative={false}
                        customInput={TextField}
                        thousandSeparator
                        value={item.quantity}
                        onValueChange={(values) => {
                          handleQuantityChange(item.variant_id, Math.max(1, values.floatValue || 1))
                        }}
                        size="small"
                        sx={{ width: 100 }}
                        inputProps={{ inputMode: "numeric", style: { textAlign: "right" } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {fmt.price(item.price_per_unit)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {fmt.price(item.price_per_unit * item.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(item.variant_id)}
                        aria-label={t("cart.removeItem", "Remove {{title}} from cart", {
                          title: item.listing_title,
                        })}
                      >
                        <TrashCan fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} align="right">
                    <Typography variant="subtitle2">{t("marketV2.total")}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {fmt.price(total)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}

          {/* Add item section */}
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {t("OfferMarketListingsEditArea.addMarketListing")}
            </Typography>
            <Autocomplete
              value={selectedListing}
              onChange={(_e, value) => {
                setSelectedListing(value)
                setSelectedVariantId("")
                setAddQuantity(1)
              }}
              options={listings}
              getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("OfferMarketListingsEditArea.selectListing")}
                  fullWidth
                  SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
                />
              )}
            />

            {selectedListing && availableVariants.length > 0 && (
              <TextField
                select
                fullWidth
                size="small"
                label={t("marketV2.selectVariant")}
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                SelectProps={{ IconComponent: KeyboardArrowDownRoundedIcon }}
              >
                {availableVariants.map((v) => (
                  <MenuItem key={v.variant_id} value={v.variant_id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      {v.attributes.quality_tier != null && (
                        <QualityBadge tier={v.attributes.quality_tier} size="small" />
                      )}
                      {hasDisplayableSource(v.attributes.crafted_source) && (
                        <Chip
                          label={formatCraftedSource(String(v.attributes.crafted_source))}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Box sx={{ flex: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t("marketV2.qtyColon", { quantity: v.quantity })}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {fmt.price(v.price)}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            )}

            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              value={addQuantity}
              onValueChange={(values) => {
                const max = selectedVariant?.quantity || 1
                setAddQuantity(Math.min(values.floatValue || 1, max))
              }}
              size="small"
              label={t("OfferMarketListingsEditArea.quantity")}
              disabled={!selectedVariantId}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {t("marketV2.ofAvailable", { n: selectedVariant?.quantity || 0 })}
                  </InputAdornment>
                ),
              }}
              inputProps={{ inputMode: "numeric" }}
            />

            <Button
              variant="contained"
              size="small"
              disabled={!selectedListing || !selectedVariantId}
              onClick={handleAdd}
            >
              {t("OfferMarketListingsEditArea.add")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Grid>
  )
}
