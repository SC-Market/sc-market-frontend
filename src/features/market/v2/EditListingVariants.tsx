import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { NumericFormat } from "react-number-format"
import { FormPaper } from "../../../components/paper/FormPaper"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import type {
  GetListingDetailResponse,
  GetStockLotsResponse,
} from "../../../store/api/v2/market"
import { PriceComparisonAlert } from "../components/PriceComparisonAlert"
import {
  LISTING_FIELD_IDS,
  type ListingFormField,
} from "../domain/listingFormErrors"
import { type LotQuantity } from "../domain/lotQuantityUpdates"

/**
 * Variant form data for editing — matches what the listing detail shows
 */
export interface VariantFormData {
  variant_id: string
  /** The variant's listed lots, newest first: a quantity change is applied to them */
  lots: LotQuantity[]
  /** The quantity as loaded: saving sends only the change from it */
  originalQuantity: number
  quantity: number
  quality_tier?: number
  quality_value?: number
  crafted_source?: "crafted" | "store" | "looted" | "unknown" | "duped"
  price?: number // For per_variant pricing mode
  display_name: string
  short_name: string
  locations: string[]
  isModified: boolean
}

/** The form rows for a listing item's variants, each with its listed lots. */
export function variantFormDataFor(
  item: GetListingDetailResponse["items"][number],
  stockLots: GetStockLotsResponse["lots"] | undefined,
): VariantFormData[] {
  // Build variant form data from listing detail variants
  // Each variant's listed lots (newest first, as the API returns them), so
  // a quantity change can be sent as lot_updates on save
  const lotsByVariant = new Map<string, LotQuantity[]>()
  for (const lot of stockLots || []) {
    const lots = lotsByVariant.get(lot.variant.variant_id) ?? []
    lots.push({ lot_id: lot.lot_id, quantity_total: lot.quantity_total })
    lotsByVariant.set(lot.variant.variant_id, lots)
  }

  return item.variants.map((v) => ({
    variant_id: v.variant_id,
    lots: lotsByVariant.get(v.variant_id) ?? [],
    originalQuantity: v.quantity,
    quantity: v.quantity,
    quality_tier: v.attributes.quality_tier,
    quality_value: v.attributes.quality_value,
    crafted_source: v.attributes.crafted_source,
    price: v.price,
    display_name: v.display_name,
    short_name: v.short_name,
    locations: v.locations,
    isModified: false,
  }))
}

/** Each variant's quantity (editable), attributes and per-variant price. */
export function VariantBreakdownSection({
  variants,
  pricingMode,
  canEdit,
  handleUpdateVariant,
}: {
  variants: VariantFormData[]
  pricingMode: "unified" | "per_variant"
  canEdit: boolean
  handleUpdateVariant: (
    variant_id: string,
    field: keyof VariantFormData,
    value: VariantFormData[keyof VariantFormData],
  ) => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <>
      {/* Variant Breakdown Section */}
      {variants.length > 0 && (
        <FormPaper
          title={t("EditListingV2.variants", "Variants")}
          subtitle={t(
            "EditListingV2.variantsSubtitle",
            "Update quantities and prices for each variant",
          )}
        >
          {variants.map((v, index) => (
            <Grid item xs={12} key={v.variant_id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: theme.spacing(
                    theme.borderRadius?.topLevel ?? 0.375,
                  ),
                  position: "relative",
                }}
              >
                {/* Variant Header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {v.display_name || t("marketV2.variantN", { n: index + 1 })}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {v.locations.length > 0 && (
                      <Chip
                        label={v.locations[0]}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {v.isModified && (
                      <Chip
                        label={t("EditListingV2.modified", "Modified")}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>

                <Grid container spacing={2}>
                  {/* Quantity */}
                  <Grid item xs={12} sm={6} md={4}>
                    <NumericFormat
                      decimalScale={0}
                      allowNegative={false}
                      customInput={TextField}
                      thousandSeparator
                      size="small"
                      fullWidth
                      onValueChange={(values) => {
                        handleUpdateVariant(
                          v.variant_id,
                          "quantity",
                          values.floatValue || 0,
                        )
                      }}
                      label={t("EditListingV2.quantity", "Quantity")}
                      value={v.quantity}
                      disabled={!canEdit}
                      required
                      inputProps={{
                        inputMode: "numeric",
                        "aria-label": t(
                          "EditListingV2.quantityAriaLabel",
                          "Enter quantity",
                        ),
                      }}
                    />
                  </Grid>

                  {/* Quality Tier (Read-only) */}
                  {v.quality_tier !== undefined && (
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label={t("EditListingV2.qualityTier", "Quality Tier")}
                        value={`Tier ${v.quality_tier}`}
                        disabled
                      />
                    </Grid>
                  )}

                  {/* Quality Value (Read-only) */}
                  {v.quality_value !== undefined && (
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label={t("EditListingV2.qualityValue", "Quality Value")}
                        value={v.quality_value.toFixed(2)}
                        disabled
                      />
                    </Grid>
                  )}

                  {/* Crafted Source (Read-only) */}
                  {v.crafted_source && (
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label={t("EditListingV2.craftedSource", "Source")}
                        value={v.crafted_source}
                        disabled
                      />
                    </Grid>
                  )}

                  {/* Per-Variant Price */}
                  {pricingMode === "per_variant" && (
                    <Grid item xs={12} sm={6} md={4}>
                      <NumericFormat
                        decimalScale={0}
                        allowNegative={false}
                        customInput={TextField}
                        thousandSeparator
                        size="small"
                        fullWidth
                        onValueChange={(values) => {
                          handleUpdateVariant(
                            v.variant_id,
                            "price",
                            values.floatValue || 0,
                          )
                        }}
                        label={t("EditListingV2.price", "Price")}
                        value={v.price ?? ""}
                        disabled={!canEdit}
                        required
                        InputProps={{
                          endAdornment: <Typography>aUEC</Typography>,
                          inputMode: "numeric",
                        }}
                        inputProps={{
                          "aria-label": t(
                            "EditListingV2.priceAriaLabel",
                            "Enter price for this variant",
                          ),
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Grid>
          ))}
        </FormPaper>
      )}
    </>
  )
}

/** Pricing: the (read-only) pricing mode and the unified base price. */
export function EditPricingSection({
  listingData,
  pricingMode,
  basePrice,
  setBasePrice,
  canEdit,
  fieldError,
  clearError,
}: {
  listingData: GetListingDetailResponse
  pricingMode: "unified" | "per_variant"
  basePrice: number
  setBasePrice: (value: number) => void
  canEdit: boolean
  fieldError: (field: ListingFormField) => string | undefined
  clearError: (field: ListingFormField) => void
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Pricing Section */}
      <FormPaper title={t("EditListingV2.pricing", "Pricing")}>
        {/* Pricing Mode (Read-only) */}
        <Grid item xs={12}>
          <FormControl component="fieldset" disabled>
            <FormLabel component="legend">
              <Typography variant="subtitle2" fontWeight="bold">
                {t("EditListingV2.pricingMode", "Pricing Mode")}
              </Typography>
            </FormLabel>
            <RadioGroup row value={pricingMode}>
              <FormControlLabel
                value="unified"
                control={<Radio />}
                label={t("EditListingV2.unifiedPricing", "Unified Price")}
              />
              <FormControlLabel
                value="per_variant"
                control={<Radio />}
                label={t(
                  "EditListingV2.perVariantPricing",
                  "Per-Variant Pricing",
                )}
              />
            </RadioGroup>
            <Typography variant="caption" color="text.secondary">
              {t(
                "EditListingV2.pricingModeHelp",
                "Pricing mode cannot be changed after creation",
              )}
            </Typography>
          </FormControl>
        </Grid>

        {/* Base Price (Unified Mode) */}
        {pricingMode === "unified" && (
          <Grid item xs={12} md={6}>
            <NumericFormat
              decimalScale={0}
              allowNegative={false}
              customInput={TextField}
              thousandSeparator
              size="small"
              fullWidth
              onValueChange={(values) => {
                clearError("base_price")
                setBasePrice(values.floatValue || 0)
              }}
              id={LISTING_FIELD_IDS.base_price}
              label={t("EditListingV2.basePrice", "Base Price")}
              value={basePrice}
              disabled={!canEdit}
              InputProps={{
                endAdornment: <Typography>aUEC</Typography>,
                inputMode: "numeric",
              }}
              required
              error={!!fieldError("base_price")}
              helperText={fieldError("base_price")}
              inputProps={{
                "aria-label": t(
                  "EditListingV2.basePriceAriaLabel",
                  "Enter base price",
                ),
              }}
            />
            {listingData.items[0]?.game_item?.id && basePrice > 0 && (
              <PriceComparisonAlert
                gameItemId={listingData.items[0].game_item.id}
                currentPrice={basePrice}
              />
            )}
          </Grid>
        )}
      </FormPaper>
    </>
  )
}
