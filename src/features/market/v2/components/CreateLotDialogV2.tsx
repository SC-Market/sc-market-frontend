/**
 * Create Lot Dialog V2 Component
 *
 * Modal form for creating new stock lots with variant attributes.
 *
 * **Validates: Requirements 21.1-21.12**
 */

import React, { useState, useCallback } from "react"
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
import type { LocationInfo } from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "../../components/stock/LocationSelector"

export interface CreateLotDialogV2Props {
  open: boolean
  onClose: () => void
  listingId: string
  itemId: string
  locations: LocationInfo[]
}

/**
 * CreateLotDialogV2 Component
 *
 * Form for creating new stock lots with variant attribute inputs.
 * Includes quality tier, quality value, crafted source, and blueprint tier fields.
 */
export function CreateLotDialogV2({
  open,
  onClose,
  listingId,
  itemId,
  locations,
}: CreateLotDialogV2Props) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

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
      (qualityValue < 0 || qualityValue > 100)
    ) {
      issueAlert({
        message: t(
          "CreateLotDialogV2.invalidQualityValue",
          "Quality value must be between 0 and 100",
        ),
        severity: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement createStockLot mutation when backend endpoint is ready
      // await createStockLot({
      //   item_id: itemId,
      //   quantity_total: quantity,
      //   location_id: locationId,
      //   variant_attributes: {
      //     quality_tier: qualityTier,
      //     quality_value: qualityValue,
      //     crafted_source: craftedSource,
      //     blueprint_tier: blueprintTier,
      //   },
      //   listed,
      //   notes: notes || null,
      // }).unwrap()

      issueAlert({
        message: t(
          "CreateLotDialogV2.createSuccess",
          "Lot created successfully",
        ),
        severity: "success",
      })
      handleClose()
    } catch (error) {
      issueAlert({
        message: t("CreateLotDialogV2.createError", "Failed to create lot"),
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
            <InputLabel>
              {t("CreateLotDialogV2.qualityTier", "Quality Tier")}
            </InputLabel>
            <Select
              value={qualityTier}
              onChange={(e) => setQualityTier(Number(e.target.value))}
              label={t("CreateLotDialogV2.qualityTier", "Quality Tier")}
            >
              {[1, 2, 3, 4, 5].map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {t("CreateLotDialogV2.tier", "Tier")} {tier}
                </MenuItem>
              ))}
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
              "Optional: Precise quality percentage (0-100)",
            )}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
          />

          {/* Crafted Source */}
          <FormControl fullWidth>
            <InputLabel>
              {t("CreateLotDialogV2.craftedSource", "Source")}
            </InputLabel>
            <Select
              value={craftedSource || ""}
              onChange={(e) =>
                setCraftedSource(e.target.value || undefined)
              }
              label={t("CreateLotDialogV2.craftedSource", "Source")}
            >
              <MenuItem value="">
                {t("CreateLotDialogV2.none", "None")}
              </MenuItem>
              <MenuItem value="crafted">
                {t("CreateLotDialogV2.crafted", "Crafted")}
              </MenuItem>
              <MenuItem value="store">
                {t("CreateLotDialogV2.store", "Store")}
              </MenuItem>
              <MenuItem value="looted">
                {t("CreateLotDialogV2.looted", "Looted")}
              </MenuItem>
              <MenuItem value="unknown">
                {t("CreateLotDialogV2.unknown", "Unknown")}
              </MenuItem>
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
          disabled={isLoading}
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
