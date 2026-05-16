/**
 * Lot List Item V2 Component
 *
 * Displays a single stock lot with variant information and inline editing capabilities.
 *
 * **Validates: Requirements 21.4-21.9**
 */

import React, { useState, useCallback } from "react"
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
} from "@mui/material"
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  SwapHoriz as TransferIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useUpdateStockLotMutation,
  type StockLotDetail,
  type LocationInfo,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "../../components/stock/LocationSelector"

export interface LotListItemV2Props {
  lot: StockLotDetail
  locations: LocationInfo[]
  onTransfer: (lot: StockLotDetail) => void
}

/**
 * LotListItemV2 Component
 *
 * Displays lot information with inline editing for quantity, location, listed status, and notes.
 * Shows variant attributes (quality_tier, quality_value, crafted_source) in read-only format.
 */
export function LotListItemV2({
  lot,
  locations,
  onTransfer,
}: LotListItemV2Props) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuantity, setEditedQuantity] = useState(lot.quantity_total)
  const [editedLocationId, setEditedLocationId] = useState<string | null>(
    lot.location?.location_id || null,
  )
  const [editedListed, setEditedListed] = useState(lot.listed)
  const [editedNotes, setEditedNotes] = useState(lot.notes || "")

  // Mutations
  const [updateLot, { isLoading: isUpdating }] = useUpdateStockLotMutation()

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset to original values
    setEditedQuantity(lot.quantity_total)
    setEditedLocationId(lot.location?.location_id || null)
    setEditedListed(lot.listed)
    setEditedNotes(lot.notes || "")
  }

  const handleSaveEdit = useCallback(async () => {
    try {
      if (editedQuantity < 0) {
        issueAlert({
          message: t(
            "LotListItemV2.invalidQuantity",
            "Quantity must be non-negative",
          ),
          severity: "error",
        })
        return
      }

      if (editedNotes.length > 1000) {
        issueAlert({
          message: t(
            "LotListItemV2.notesTooLong",
            "Notes must be 1000 characters or less",
          ),
          severity: "error",
        })
        return
      }

      await updateLot({
        id: lot.lot_id,
        updateStockLotRequest: {
          quantity_total: editedQuantity,
          location_id: editedLocationId,
          listed: editedListed,
          notes: editedNotes || null,
        },
      }).unwrap()

      setIsEditing(false)
      issueAlert({
        message: t("LotListItemV2.updateSuccess", "Lot updated successfully"),
        severity: "success",
      })
    } catch (error: any) {
      const detail = error?.data?.details || error?.data
      if (detail?.code === "INVALID_QUANTITY") {
        issueAlert({
          message: t(
            "LotListItemV2.cannotReduceStock",
            "Cannot reduce stock — units are committed to active orders",
          ),
          severity: "warning",
        })
      } else {
        issueAlert({
          message: t("LotListItemV2.updateError", "Failed to update lot"),
          severity: "error",
        })
      }
      handleCancelEdit()
    }
  }, [
    editedQuantity,
    editedLocationId,
    editedListed,
    editedNotes,
    lot.lot_id,
    updateLot,
    issueAlert,
    t,
  ])

  // Convert LocationInfo[] to Location[] format expected by LocationSelector
  const locationsForSelector = locations.map((loc) => ({
    location_id: loc.location_id,
    name: loc.name,
    is_preset: loc.is_preset,
    display_order: null,
    created_by: null,
    created_at: new Date().toISOString(),
  }))

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: isEditing ? "action.hover" : "background.paper",
        transition: "background-color 0.2s",
      }}
    >
      <Stack spacing={2}>
        {/* Header row with quantity and actions */}
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Quantity */}
          {isEditing ? (
            <TextField
              type="number"
              value={editedQuantity}
              onChange={(e) => setEditedQuantity(parseInt(e.target.value) || 0)}
              size="small"
              sx={{ width: 120 }}
              label={t("LotListItemV2.quantity", "Quantity")}
              inputProps={{ min: 0 }}
            />
          ) : (
            <Box>
              <Typography variant="h6" fontWeight="medium">
                {lot.quantity_total.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("LotListItemV2.units", "units")}
              </Typography>
            </Box>
          )}

          {/* Listed status */}
          {isEditing ? (
            <FormControlLabel
              control={
                <Switch
                  checked={editedListed}
                  onChange={(e) => setEditedListed(e.target.checked)}
                  size="small"
                />
              }
              label={t("LotListItemV2.listed", "Listed")}
            />
          ) : (
            <Chip
              label={
                lot.listed
                  ? t("LotListItemV2.listed", "Listed")
                  : t("LotListItemV2.unlisted", "Unlisted")
              }
              color={lot.listed ? "success" : "default"}
              size="small"
              variant="outlined"
            />
          )}

          {/* Actions */}
          <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
            {isEditing ? (
              <>
                <Tooltip title={t("LotListItemV2.save", "Save")}>
                  <IconButton
                    size="small"
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    color="primary"
                  >
                    {isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("LotListItemV2.cancel", "Cancel")}>
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={t("LotListItemV2.edit", "Edit")}>
                  <IconButton size="small" onClick={handleEditClick}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("LotListItemV2.transfer", "Transfer")}>
                  <IconButton size="small" onClick={() => onTransfer(lot)}>
                    <TransferIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>

        {/* Location */}
        {isEditing ? (
          <LocationSelector
            value={editedLocationId}
            onChange={setEditedLocationId}
            locations={locationsForSelector}
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            <strong>{t("LotListItemV2.location", "Location")}:</strong>{" "}
            {lot.location?.name ||
              t("LotListItemV2.unspecified", "Unspecified")}
          </Typography>
        )}

        {/* Owner (if present) */}
        {lot.owner && (
          <Typography variant="body2" color="text.secondary">
            <strong>{t("LotListItemV2.owner", "Owner")}:</strong>{" "}
            {lot.owner.username}
          </Typography>
        )}

        {/* Variant information (read-only) */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mb={0.5}
          >
            {t("LotListItemV2.variantInfo", "Variant Information")}:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {lot.variant.attributes.quality_tier && (
              <Chip
                label={`${t("LotListItemV2.tier", "Tier")} ${lot.variant.attributes.quality_tier}`}
                size="small"
                color={
                  lot.variant.attributes.quality_tier >= 4
                    ? "success"
                    : lot.variant.attributes.quality_tier >= 3
                      ? "primary"
                      : "default"
                }
                variant="outlined"
              />
            )}
            {lot.variant.attributes.quality_value !== undefined && (
              <Chip
                label={`${lot.variant.attributes.quality_value.toFixed(1)}%`}
                size="small"
                variant="outlined"
              />
            )}
            {lot.variant.attributes.crafted_source && (
              <Chip
                label={lot.variant.attributes.crafted_source}
                size="small"
                variant="outlined"
              />
            )}
            {lot.variant.attributes.blueprint_tier && (
              <Chip
                label={`${t("LotListItemV2.blueprint", "Blueprint")} T${lot.variant.attributes.blueprint_tier}`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {/* Crafted information (if present) */}
        {lot.crafted_by && (
          <Typography variant="body2" color="text.secondary">
            <strong>{t("LotListItemV2.craftedBy", "Crafted By")}:</strong>{" "}
            {lot.crafted_by}
            {lot.crafted_at && (
              <> ({new Date(lot.crafted_at).toLocaleDateString()})</>
            )}
          </Typography>
        )}

        {/* Notes */}
        {isEditing ? (
          <TextField
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            multiline
            rows={2}
            size="small"
            label={t("LotListItemV2.notes", "Notes")}
            placeholder={t(
              "LotListItemV2.notesPlaceholder",
              "Add notes about this lot...",
            )}
            inputProps={{ maxLength: 1000 }}
            helperText={`${editedNotes.length}/1000`}
          />
        ) : (
          lot.notes && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              {lot.notes}
            </Typography>
          )
        )}

        {/* Timestamps */}
        <Typography variant="caption" color="text.secondary">
          {t("LotListItemV2.created", "Created")}:{" "}
          {new Date(lot.created_at).toLocaleString()}
        </Typography>
      </Stack>
    </Box>
  )
}
