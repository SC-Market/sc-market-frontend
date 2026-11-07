/**
 * Create Lot Dialog V2 Component
 *
 * Modal form for creating new stock lots with variant attributes.
 *
 * **Validates: Requirements 21.1-21.12**
 */

import { useState, useCallback, useEffect } from "react"
import {
  Button,
  TextField,
  Stack,
  CircularProgress,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material"
import { LabeledSwitch } from "../../../../components/buttons/LabeledSwitch"
import { useTranslation } from "react-i18next"
import { useFocusOnReveal } from "../../../../hooks/accessibility/useFocusOnReveal"
import type {
  LocationInfo,
  VariantAttributes,
} from "../../../../store/api/v2/market"
import {
  useGetListingDetailQuery,
  useGetVariantTypesQuery,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "../../components/stock/LocationSelector"
import { useCreateLot } from "../../hooks/useStockLotActions"
import { useNow } from "../../../../util/format"
import { ResponsiveDialog } from "../../../../components/dialog/ResponsiveDialog"
import { LotVariantAttributesFields } from "./LotVariantAttributesFields"

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
  const now = useNow()
  const focusOnReveal = useFocusOnReveal<HTMLInputElement>()
  const issueAlert = useAlertHook()

  // Fetch variant type definitions from V2 API
  const { data: variantTypesData } = useGetVariantTypesQuery()

  const [listingId, setListingId] = useState(defaultListingId)
  useEffect(() => setListingId(defaultListingId), [defaultListingId])

  // A lot belongs to a listing item; resolve the chosen listing's items
  const { data: listingDetail, isFetching: listingLoading } =
    useGetListingDetailQuery({ id: listingId }, { skip: !listingId })
  // RTK Query keeps this reference while the data is unchanged, so the reset
  // below runs only when a different listing's items arrive.
  const detailItems = listingDetail?.items
  const listingItems = detailItems ?? []
  const [itemId, setItemId] = useState("")
  useEffect(() => {
    setItemId(detailItems?.length === 1 ? detailItems[0].item_id : "")
  }, [detailItems])

  const createLot = useCreateLot()

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
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

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
    if (qualityValue !== undefined)
      variantAttributes.quality_value = qualityValue
    if (craftedSource) {
      variantAttributes.crafted_source =
        craftedSource as VariantAttributes["crafted_source"]
    }
    if (blueprintTier !== undefined)
      variantAttributes.blueprint_tier = blueprintTier

    const created = await createLot({
      item_id: itemId,
      quantity,
      variant_attributes: variantAttributes,
      location_id: locationId ?? undefined,
      listed,
      notes: notes.trim() || undefined,
    })
    setIsLoading(false)
    if (created) handleClose()
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
    createLot,
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
    created_at: new Date(now).toISOString(),
  }))

  // Generate variant preview
  const variantPreview = `Tier ${qualityTier}${qualityValue !== undefined ? ` (${qualityValue.toFixed(1)}%)` : ""}${craftedSource ? ` - ${craftedSource}` : ""}`

  return (
    <ResponsiveDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      title={t("CreateLotDialogV2.title", "Create Stock Lot")}
      mobile="fullScreen"
      disableClose={isLoading}
      actions={
        <>
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
        </>
      }
    >
      <Stack spacing={2} mt={1}>
        {/* Listing (and item, for bundles) the lot is added to */}
        <TextField
          select
          fullWidth
          required
          label={t("CreateLotDialogV2.listing", "Listing")}
          value={
            listings.some((l) => l.listing_id === listingId) ? listingId : ""
          }
          onChange={(e) => setListingId(e.target.value)}
          helperText={
            listingId && !listingLoading && listingItems.length === 0
              ? t(
                  "CreateLotDialogV2.noItems",
                  "This listing has no item to add stock to",
                )
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
          inputRef={focusOnReveal}
          label={t("CreateLotDialogV2.quantity", "Quantity")}
          helperText={t(
            "CreateLotDialogV2.quantityHelper",
            "Enter the number of units in this lot",
          )}
          inputProps={{ min: 1 }}
        />

        <Divider />

        <LotVariantAttributesFields
          qualityTier={qualityTier}
          setQualityTier={setQualityTier}
          qualityValue={qualityValue}
          setQualityValue={setQualityValue}
          craftedSource={craftedSource}
          setCraftedSource={setCraftedSource}
          blueprintTier={blueprintTier}
          setBlueprintTier={setBlueprintTier}
          variantPreview={variantPreview}
          variantTypesData={variantTypesData}
        />

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
        <LabeledSwitch
          checked={listed}
          onChange={setListed}
          size="small"
          label={
            <Typography variant="body2">
              {t("CreateLotDialogV2.listed", "Listed")}
            </Typography>
          }
          helperText={t(
            "CreateLotDialogV2.listedHelper",
            "Listed stock appears in public listings",
          )}
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
    </ResponsiveDialog>
  )
}
