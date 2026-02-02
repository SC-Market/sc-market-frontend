/**
 * Lot List Item Component
 * 
 * Displays a single stock lot with inline editing capabilities.
 * 
 * Requirements: 2.4, 4.1, 8.5
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
  useUpdateLotMutation,
  useDeleteLotMutation,
  StockLot,
  Location,
} from "../../../../store/api/stock-lots"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "./LocationSelector"

export interface LotListItemProps {
  lot: StockLot
  locations: Location[]
  onTransfer: (lot: StockLot) => void
}

/**
 * LotListItem Component
 * 
 * Displays lot information with inline editing for quantity, location, owner, listed status, and notes.
 */
export function LotListItem({ lot, locations, onTransfer }: LotListItemProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuantity, setEditedQuantity] = useState(lot.quantity_total)
  const [editedLocationId, setEditedLocationId] = useState<string | null>(lot.location_id)
  const [editedListed, setEditedListed] = useState(lot.listed)
  const [editedNotes, setEditedNotes] = useState(lot.notes || "")

  // Mutations
  const [updateLot, { isLoading: isUpdating }] = useUpdateLotMutation()
  const [deleteLot, { isLoading: isDeleting }] = useDeleteLotMutation()

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset to original values
    setEditedQuantity(lot.quantity_total)
    setEditedLocationId(lot.location_id)
    setEditedListed(lot.listed)
    setEditedNotes(lot.notes || "")
  }

  const handleSaveEdit = useCallback(async () => {
    try {
      // Validate quantity
      if (editedQuantity < 0) {
        issueAlert({
          message: t("LotListItem.invalidQuantity", "Quantity must be non-negative"),
          severity: "error",
        })
        return
      }

      // Validate notes length
      if (editedNotes.length > 1000) {
        issueAlert({
          message: t("LotListItem.notesTooLong", "Notes must be 1000 characters or less"),
          severity: "error",
        })
        return
      }

      await updateLot({
        lot_id: lot.lot_id,
        quantity: editedQuantity,
        location_id: editedLocationId,
        listed: editedListed,
        notes: editedNotes || null,
      }).unwrap()

      setIsEditing(false)
      issueAlert({
        message: t("LotListItem.updateSuccess", "Lot updated successfully"),
        severity: "success",
      })
    } catch (error) {
      issueAlert({
        message: t("LotListItem.updateError", "Failed to update lot"),
        severity: "error",
      })
      // Rollback on error
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

  const handleDelete = useCallback(async () => {
    if (!window.confirm(t("LotListItem.confirmDelete", "Are you sure you want to delete this lot?"))) {
      return
    }

    try {
      await deleteLot({ lot_id: lot.lot_id }).unwrap()
      issueAlert({
        message: t("LotListItem.deleteSuccess", "Lot deleted successfully"),
        severity: "success",
      })
    } catch (error) {
      issueAlert({
        message: t("LotListItem.deleteError", "Failed to delete lot"),
        severity: "error",
      })
    }
  }, [lot.lot_id, deleteLot, issueAlert, t])

  // Find location name
  const locationName = locations.find((loc) => loc.location_id === lot.location_id)?.name || 
    t("LotListItem.unspecified", "Unspecified")

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
              label={t("LotListItem.quantity", "Quantity")}
              inputProps={{ min: 0 }}
            />
          ) : (
            <Box>
              <Typography variant="h6" fontWeight="medium">
                {lot.quantity_total.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("LotListItem.units", "units")}
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
              label={t("LotListItem.listed", "Listed")}
            />
          ) : (
            <Chip
              label={lot.listed ? t("LotListItem.listed", "Listed") : t("LotListItem.unlisted", "Unlisted")}
              color={lot.listed ? "success" : "default"}
              size="small"
              variant="outlined"
            />
          )}

          {/* Actions */}
          <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
            {isEditing ? (
              <>
                <Tooltip title={t("LotListItem.save", "Save")}>
                  <IconButton
                    size="small"
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    color="primary"
                  >
                    {isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("LotListItem.cancel", "Cancel")}>
                  <IconButton size="small" onClick={handleCancelEdit} disabled={isUpdating}>
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={t("LotListItem.edit", "Edit")}>
                  <IconButton size="small" onClick={handleEditClick}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("LotListItem.transfer", "Transfer")}>
                  <IconButton size="small" onClick={() => onTransfer(lot)}>
                    <TransferIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("LotListItem.delete", "Delete")}>
                  <IconButton
                    size="small"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    color="error"
                  >
                    {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
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
            locations={locations}
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            <strong>{t("LotListItem.location", "Location")}:</strong> {locationName}
          </Typography>
        )}

        {/* Owner (if present) */}
        {lot.owner_id && (
          <Typography variant="body2" color="text.secondary">
            <strong>{t("LotListItem.owner", "Owner")}:</strong> {lot.owner_id}
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
            label={t("LotListItem.notes", "Notes")}
            placeholder={t("LotListItem.notesPlaceholder", "Add notes about this lot...")}
            inputProps={{ maxLength: 1000 }}
            helperText={`${editedNotes.length}/1000`}
          />
        ) : (
          lot.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {lot.notes}
            </Typography>
          )
        )}

        {/* Timestamps */}
        <Typography variant="caption" color="text.secondary">
          {t("LotListItem.created", "Created")}: {new Date(lot.created_at).toLocaleString()}
        </Typography>
      </Stack>
    </Box>
  )
}
