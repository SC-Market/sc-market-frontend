/**
 * Create Lot Dialog V2 Component
 *
 * Modal form for creating new stock lots with variant attributes.
 *
 * **Validates: Requirements 21.1-21.12**
 */

import React, { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider,
  Box,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { LocationInfo, VariantAttributes } from "../../../../store/api/v2/market"
import {
  useCreateStockLotMutation,
  useGetListingDetailQuery,
  useGetVariantTypesQuery,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { extractErrorMessage } from "../../../../store/api-utils"
import { LocationSelector } from "../../components/stock/LocationSelector"

export interface CreateLotDialogV2Props {
  open: boolean
  onClose: () => void
  /** The seller's listings the lot can be added to */
  listings: { listing_id: string; title: string }[]
  /** Listing preselected when the dialog opens */
  defaultListingId: string
  locations: LocationInfo[]
}

/**
 * CreateLotDialogV2 Component
 *
 * Form for creating a stock lot (POST /stock-lots) on one of the seller's
 * listings, with variant attribute inputs: quality tier, quality value,
 * crafted source, and blueprint tier. The lot is added to the listing's item
 * (bundles: the item picked in the form).
 */
export function CreateLotDialogV2({
  open,
  onClose,
  listings,
  defaultListingId,
  locations,
}: CreateLotDialogV2Props) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  // Fetch variant type definitions from V2 API
  const { data: variantTypesData } = useGetVariantTypesQuery()

  const [listingId, setListingId] = useState(defaultListingId)
  useEffect(() => setListingId(defaultListingId), [defaultListingId])

  // A lot belongs to a listing item; resolve the chosen listing's items
  const { data: listingDetail, isFetching: listingLoading } = useGetListingDetailQuery(
    { id: listingId },
    { skip: !listingId },
  )
  const listingItems = listingDetail?.items ?? []
  const [itemId, setItemId] = useState("")
  useEffect(() => {
    setItemId(listingItems.length === 1 ? listingItems[0].item_id : "")
  }, [listingDetail]) // eslint-disable-line react-hooks/exhaustive-deps

  const [createStockLot] = useCreateStockLotMutation()

  // Form state
  const [quantity, setQuantity] = useState(0)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [qualityTier, setQualityTier] = useState<number>(3)
  const [qualityValue, setQualityValue] = useState<number | undefined>(
    undefined,
  )
  const [craftedSource, setCraftedSource] = useState<string | undefined>(
    undefined,
  )
  const [blueprintTier, setBlueprintTier] = useState<number | undefined>(
    undefined,
  )
  const [listed, setListed] = useState(true)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset form
  const resetForm = useCallback(() => {
    setQuantity(0)
    setLocationId(null)
    setQualityTier(3)
    setQualityValue(undefined)
    setCraftedSource(undefined)
    setBlueprintTier(undefined)
    setListed(true)
    setNotes("")
  }, [])

  // Handle close
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!itemId) {
      issueAlert({
        message: t(
          "CreateLotDialogV2.itemRequired",
          "Choose the listing (and item) to add this lot to",
        ),
        severity: "error",
      })
      return
    }

    // Validate quantity
    if (quantity <= 0) {
      issueAlert({
        message: t(
          "CreateLotDialogV2.invalidQuantity",
          "Quantity must be greater than 0",
        ),
        severity: "error",
      })
      return
    }

    // Validate notes length
    if (notes.length > 1000) {
      issueAlert({
        message: t(
          "CreateLotDialogV2.notesTooLong",
          "Notes must be 1000 characters or less",
        ),
        severity: "error",
      })
      return
    }

    // Validate quality tier
    if (qualityTier < 1 || qualityTier > 5) {
      issueAlert({
        message: t(
          "CreateLotDialogV2.invalidQualityTier",
          "Quality tier must be between 1 and 5",
        ),
        severity: "error",
      })
      return
    }

    // Validate quality value if provided
    if (
      qualityValue !== undefined &&
      (qualityValue < 0 || qualityValue > 1000)
    ) {
      issueAlert({
        message: t(
          "CreateLotDialogV2.invalidQualityValue",
          "Quality value must be between 0 and 1000",
        ),
        severity: "error",
      })
      return
    }

    setIsLoading(true)

    const variantAttributes: VariantAttributes = { quality_tier: qualityTier }
    if (qualityValue !== undefined) variantAttributes.quality_value = qualityValue
    if (craftedSource) {
      variantAttributes.crafted_source = craftedSource as VariantAttributes["crafted_source"]
    }
    if (blueprintTier !== undefined) variantAttributes.blueprint_tier = blueprintTier

    try {
      await createStockLot({
        createStockLotRequest: {
          item_id: itemId,
          quantity,
          variant_attributes: variantAttributes,
          location_id: locationId ?? undefined,
          listed,
          notes: notes.trim() || undefined,
        },
      }).unwrap()

      issueAlert({
        message: t("CreateLotDialogV2.createSuccess", "Lot created"),
        severity: "success",
      })
      handleClose()
    } catch (error) {
      const reason = extractErrorMessage((error as { data?: unknown })?.data)
      issueAlert({
        message: reason
          ? t("CreateLotDialogV2.createErrorReason", "Failed to create lot: {{reason}}", { reason })
          : t("CreateLotDialogV2.createError", "Failed to create lot"),
        severity: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    quantity,
    locationId,
    qualityTier,
    qualityValue,
    craftedSource,
    blueprintTier,
    listed,
    notes,
    itemId,
    createStockLot,
    issueAlert,
    t,
    handleClose,
  ])

  // Convert LocationInfo[] to Location[] format
  const locationsForSelector = locations.map((loc) => ({
    location_id: loc.location_id,
    name: loc.name,
    is_preset: loc.is_preset,
    display_order: null,
    created_by: null,
    created_at: new Date().toISOString(),
  }))

  // Generate variant preview
  const variantPreview = `Tier ${qualityTier}${qualityValue !== undefined ? ` (${qualityValue.toFixed(1)}%)` : ""}${craftedSource ? ` - ${craftedSource}` : ""}`

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("CreateLotDialogV2.title", "Create Stock Lot")}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* Listing (and item, for bundles) the lot is added to */}
          <TextField
            select
            fullWidth
            required
            label={t("CreateLotDialogV2.listing", "Listing")}
            value={listings.some((l) => l.listing_id === listingId) ? listingId : ""}
            onChange={(e) => setListingId(e.target.value)}
            helperText={
              listingId && !listingLoading && listingItems.length === 0
                ? t("CreateLotDialogV2.noItems", "This listing has no item to add stock to")
                : undefined
            }
          >
            {listings.map((l) => (
              <MenuItem key={l.listing_id} value={l.listing_id}>
                {l.title}
              </MenuItem>
            ))}
          </TextField>
          {listingItems.length > 1 && (
            <TextField
              select
              fullWidth
              required
              label={t("CreateLotDialogV2.item", "Item")}
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              {listingItems.map((item) => (
                <MenuItem key={item.item_id} value={item.item_id}>
                  {item.game_item.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Quantity */}
          <TextField
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            fullWidth
            required
            autoFocus
            label={t("CreateLotDialogV2.quantity", "Quantity")}
            helperText={t(
              "CreateLotDialogV2.quantityHelper",
              "Enter the number of units in this lot",
            )}
            inputProps={{ min: 1 }}
          />

          <Divider />

          {/* Variant Attributes Section */}
          <Typography variant="subtitle2" color="text.secondary">
            {t("CreateLotDialogV2.variantAttributes", "Variant Attributes")}
          </Typography>

          {/* Quality Tier */}
          <FormControl fullWidth required>
            <InputLabel id="create-lot-quality-tier-label">
              {t("CreateLotDialogV2.qualityTier", "Quality Tier")}
            </InputLabel>
            <Select
              labelId="create-lot-quality-tier-label"
              value={qualityTier}
              onChange={(e) => setQualityTier(Number(e.target.value))}
              label={t("CreateLotDialogV2.qualityTier", "Quality Tier")}
            >
              {(() => {
                const qualityTierType = variantTypesData?.variant_types.find(
                  (vt) => vt.name === "quality_tier",
                )
                const min = qualityTierType?.min_value ?? 1
                const max = qualityTierType?.max_value ?? 5
                return Array.from({ length: max - min + 1 }, (_, i) => min + i).map((tier) => (
                  <MenuItem key={tier} value={tier}>
                    {t("CreateLotDialogV2.tier", "Tier")} {tier}
                  </MenuItem>
                ))
              })()}
            </Select>
          </FormControl>

          {/* Quality Value */}
          <TextField
            type="number"
            value={qualityValue || ""}
            onChange={(e) =>
              setQualityValue(
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            fullWidth
            label={t("CreateLotDialogV2.qualityValue", "Quality Value (%)")}
            helperText={t(
              "CreateLotDialogV2.qualityValueHelper",
              "Optional: Precise quality value (0-1000)",
            )}
            inputProps={{ min: 0, max: 1000, step: 1 }}
          />

          {/* Crafted Source */}
          <FormControl fullWidth>
            <InputLabel id="create-lot-source-label">
              {t("CreateLotDialogV2.craftedSource", "Source")}
            </InputLabel>
            <Select
              labelId="create-lot-source-label"
              value={craftedSource || ""}
              onChange={(e) =>
                setCraftedSource(e.target.value || undefined)
              }
              label={t("CreateLotDialogV2.craftedSource", "Source")}
            >
              <MenuItem value="">
                {t("CreateLotDialogV2.none", "None")}
              </MenuItem>
              {(() => {
                const sourceType = variantTypesData?.variant_types.find(
                  (vt) => vt.name === "crafted_source",
                )
                const values = sourceType?.allowed_values ?? ["crafted", "store", "looted", "unknown"]
                return values.map((val) => (
                  <MenuItem key={val} value={val}>
                    {val.charAt(0).toUpperCase() + val.slice(1)}
                  </MenuItem>
                ))
              })()}
            </Select>
          </FormControl>

          {/* Blueprint Tier */}
          <TextField
            type="number"
            value={blueprintTier || ""}
            onChange={(e) =>
              setBlueprintTier(
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
            fullWidth
            label={t("CreateLotDialogV2.blueprintTier", "Blueprint Tier")}
            helperText={t(
              "CreateLotDialogV2.blueprintTierHelper",
              "Optional: Blueprint quality tier (1-5)",
            )}
            inputProps={{ min: 1, max: 5 }}
          />

          {/* Variant Preview */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block">
              {t("CreateLotDialogV2.preview", "Variant Preview")}:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {variantPreview}
            </Typography>
          </Box>

          <Divider />

          {/* Location & Ownership Section */}
          <Typography variant="subtitle2" color="text.secondary">
            {t("CreateLotDialogV2.locationOwnership", "Location & Ownership")}
          </Typography>

          {/* Location */}
          <LocationSelector
            value={locationId}
            onChange={setLocationId}
            locations={locationsForSelector}
            label={t("CreateLotDialogV2.location", "Location (Optional)")}
          />

          {/* Listed Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={listed}
                onChange={(e) => setListed(e.target.checked)}
                size="small"
              />
            }
            label={
              <Stack>
                <Typography variant="body2">
                  {t("CreateLotDialogV2.listed", "Listed")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t(
                    "CreateLotDialogV2.listedHelper",
                    "Listed stock appears in public listings",
                  )}
                </Typography>
              </Stack>
            }
          />

          {/* Notes */}
          <TextField
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            fullWidth
            label={t("CreateLotDialogV2.notes", "Notes (Optional)")}
            placeholder={t(
              "CreateLotDialogV2.notesPlaceholder",
              "Add any notes about this lot...",
            )}
            inputProps={{ maxLength: 1000 }}
            helperText={`${notes.length}/1000`}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("CreateLotDialogV2.cancel", "Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !itemId}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            t("CreateLotDialogV2.create", "Create Lot")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
