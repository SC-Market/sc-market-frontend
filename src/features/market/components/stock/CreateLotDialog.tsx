/**
 * Create Lot Dialog Component
 * 
 * Modal form for creating new stock lots with validation.
 * 
 * Requirements: 2.2, 2.4, 3.1, 4.1, 8.1, 8.2
 */

import React, { useState, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useCreateLotMutation,
  Location,
} from "../../../../store/api/stock-lots"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "./LocationSelector"

export interface CreateLotDialogProps {
  open: boolean
  onClose: () => void
  listingId: string
  locations: Location[]
}

/**
 * CreateLotDialog Component
 * 
 * Provides a form for creating new stock lots with:
 * - Quantity input (required, positive integer)
 * - Location selector (searchable dropdown)
 * - Owner selector (optional, org members) - TODO: implement org member selection
 * - Listed toggle (default true)
 * - Notes textarea (max 1000 chars)
 */
export function CreateLotDialog({
  open,
  onClose,
  listingId,
  locations,
}: CreateLotDialogProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  // Form state
  const [quantity, setQuantity] = useState<number>(0)
  const [locationId, setLocationId] = useState<string | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [listed, setListed] = useState(true)
  const [notes, setNotes] = useState("")

  // Validation errors
  const [quantityError, setQuantityError] = useState("")
  const [notesError, setNotesError] = useState("")

  const [createLot, { isLoading }] = useCreateLotMutation()

  // Reset form
  const resetForm = useCallback(() => {
    setQuantity(0)
    setLocationId(null)
    setOwnerId(null)
    setListed(true)
    setNotes("")
    setQuantityError("")
    setNotesError("")
  }, [])

  // Handle close
  const handleClose = useCallback(() => {
    if (!isLoading) {
      resetForm()
      onClose()
    }
  }, [isLoading, resetForm, onClose])

  // Validate form
  const validateForm = useCallback(() => {
    let isValid = true

    // Validate quantity
    if (quantity <= 0) {
      setQuantityError(t("CreateLotDialog.quantityRequired", "Quantity must be greater than 0"))
      isValid = false
    } else {
      setQuantityError("")
    }

    // Validate notes length
    if (notes.length > 1000) {
      setNotesError(t("CreateLotDialog.notesTooLong", "Notes must be 1000 characters or less"))
      isValid = false
    } else {
      setNotesError("")
    }

    return isValid
  }, [quantity, notes, t])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    try {
      await createLot({
        listing_id: listingId,
        quantity,
        location_id: locationId,
        owner_id: ownerId,
        listed,
        notes: notes.trim() || null,
      }).unwrap()

      issueAlert({
        message: t("CreateLotDialog.createSuccess", "Lot created successfully"),
        severity: "success",
      })

      handleClose()
    } catch (error) {
      issueAlert({
        message: t("CreateLotDialog.createError", "Failed to create lot"),
        severity: "error",
      })
    }
  }, [
    validateForm,
    createLot,
    listingId,
    quantity,
    locationId,
    ownerId,
    listed,
    notes,
    issueAlert,
    t,
    handleClose,
  ])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("CreateLotDialog.title", "Create Stock Lot")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Quantity Input */}
          <TextField
            autoFocus
            label={t("CreateLotDialog.quantity", "Quantity")}
            type="number"
            fullWidth
            required
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            error={!!quantityError}
            helperText={quantityError || t("CreateLotDialog.quantityHelp", "Enter the number of units in this lot")}
            inputProps={{ min: 1 }}
            disabled={isLoading}
          />

          {/* Location Selector */}
          <LocationSelector
            value={locationId}
            onChange={setLocationId}
            locations={locations}
            label={t("CreateLotDialog.location", "Location (Optional)")}
            disabled={isLoading}
          />

          {/* Owner Selector - TODO: Implement org member selection */}
          <TextField
            label={t("CreateLotDialog.owner", "Owner (Optional)")}
            fullWidth
            value={ownerId || ""}
            onChange={(e) => setOwnerId(e.target.value || null)}
            helperText={t("CreateLotDialog.ownerHelp", "Leave empty for unassigned")}
            disabled={isLoading}
            placeholder={t("CreateLotDialog.ownerPlaceholder", "Enter owner ID...")}
          />

          {/* Listed Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={listed}
                onChange={(e) => setListed(e.target.checked)}
                disabled={isLoading}
              />
            }
            label={
              <Stack>
                <Typography variant="body2">
                  {t("CreateLotDialog.listed", "Listed")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("CreateLotDialog.listedHelp", "Listed stock appears in public listings")}
                </Typography>
              </Stack>
            }
          />

          {/* Notes Textarea */}
          <TextField
            label={t("CreateLotDialog.notes", "Notes (Optional)")}
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            error={!!notesError}
            helperText={notesError || `${notes.length}/1000`}
            inputProps={{ maxLength: 1000 }}
            disabled={isLoading}
            placeholder={t("CreateLotDialog.notesPlaceholder", "Add any notes about this lot...")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
        >
          {t("CreateLotDialog.create", "Create Lot")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
