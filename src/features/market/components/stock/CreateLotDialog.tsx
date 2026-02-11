/**
 * Create Lot Dialog Component
 *
 * Modal form for creating new stock lots with validation.
 *
 * Requirements: 2.2, 2.4, 3.1, 4.1, 8.1, 8.2
 */

import React, { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useCreateLotMutation,
  Location,
} from "../../../../store/api/stockLotsApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "./LocationSelector"
import { OrgMemberSearch } from "../../../../components/search/OrgMemberSearch"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { responsiveFontSizes } from '@mui/material/styles';
import ThemeOptions from '@mui/material/ThemeOptions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import AvatarGroup from '@mui/material/AvatarGroup';
import { PaperProps } from '@mui/material/PaperProps';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Fab from '@mui/material/Fab';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InputAdornment from '@mui/material/InputAdornment';
import TablePagination from '@mui/material/TablePagination';
import TableContainer from '@mui/material/TableContainer';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import ReportIcon from '@mui/icons-material/Report';
import KeyboardArrowLeftRounded from '@mui/icons-material/KeyboardArrowLeftRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Map from '@mui/icons-material/Map';
import VideoLibrary from '@mui/icons-material/VideoLibrary';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import WarningRounded from '@mui/icons-material/WarningRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import SyncProblemRounded from '@mui/icons-material/SyncProblemRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import AddCircleOutlineRounded from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRounded from '@mui/icons-material/RemoveCircleOutlineRounded';

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
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null)
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
    setOwnerUsername(null)
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
      setQuantityError(
        t(
          "CreateLotDialog.quantityRequired",
          "Quantity must be greater than 0",
        ),
      )
      isValid = false
    } else {
      setQuantityError("")
    }

    // Validate notes length
    if (notes.length > 1000) {
      setNotesError(
        t(
          "CreateLotDialog.notesTooLong",
          "Notes must be 1000 characters or less",
        ),
      )
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
        owner_username: ownerUsername,
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
    ownerUsername,
    listed,
    notes,
    issueAlert,
    t,
    handleClose,
  ])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("CreateLotDialog.title", "Create Stock Lot")}
      </DialogTitle>
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
            helperText={
              quantityError ||
              t(
                "CreateLotDialog.quantityHelp",
                "Enter the number of units in this lot",
              )
            }
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

          {/* Owner Selector */}
          <OrgMemberSearch
            onMemberSelect={(member) =>
              setOwnerUsername(member?.username || null)
            }
            label={t("CreateLotDialog.owner", "Owner (Optional)")}
            placeholder={t(
              "CreateLotDialog.ownerPlaceholder",
              "Search org members...",
            )}
            disabled={isLoading}
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
                  {t(
                    "CreateLotDialog.listedHelp",
                    "Listed stock appears in public listings",
                  )}
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
            placeholder={t(
              "CreateLotDialog.notesPlaceholder",
              "Add any notes about this lot...",
            )}
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
