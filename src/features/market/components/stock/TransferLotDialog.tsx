/**
 * Transfer Lot Dialog Component
 *
 * Modal for transferring stock between locations.
 *
 * Requirements: 11.1, 11.2, 11.3
 */

import React, { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import {
  useTransferLotMutation,
  StockLot,
  Location,
} from "../../../../store/api/stockLotsApi"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { LocationSelector } from "./LocationSelector"

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MaterialLink from '@mui/material/Link';
import { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { DialogProps } from '@mui/material/DialogProps';
import Menu from '@mui/material/Menu';
import { MenuProps } from '@mui/material/MenuProps';
import { MenuItemProps } from '@mui/material/MenuItemProps';
import Accordion from '@mui/material/Accordion';
import { AccordionProps } from '@mui/material/AccordionProps';
import Switch from '@mui/material/Switch';
import { SwitchProps } from '@mui/material/SwitchProps';
import Tab from '@mui/material/Tab';
import { TabProps } from '@mui/material/TabProps';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TablePagination from '@mui/material/TablePagination';
import { TablePaginationProps } from '@mui/material/TablePaginationProps';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import { GridProps } from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import { DrawerProps } from '@mui/material/DrawerProps';
import Checkbox from '@mui/material/Checkbox';
import { CheckboxProps } from '@mui/material/CheckboxProps';
import IconButton from '@mui/material/IconButton';
import { IconButtonProps } from '@mui/material/IconButtonProps';
import SvgIcon from '@mui/material/SvgIcon';
import ListItemIcon from '@mui/material/ListItemIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import { BoxProps } from '@mui/material/BoxProps';
import Fab from '@mui/material/Fab';
import Skeleton from '@mui/material/Skeleton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import InboxOutlined from '@mui/icons-material/InboxOutlined';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import TransferIcon from '@mui/icons-material/SwapHoriz';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowIcon from '@mui/icons-material/ArrowForward';

export interface TransferLotDialogProps {
  open: boolean
  onClose: () => void
  lot: StockLot
  locations: Location[]
}

/**
 * TransferLotDialog Component
 *
 * Provides a form for transferring stock with:
 * - Source location display
 * - Destination location selector
 * - Quantity input (with validation against available quantity)
 * - Visual indication of transfer direction
 */
export function TransferLotDialog({
  open,
  onClose,
  lot,
  locations,
}: TransferLotDialogProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  // Form state
  const [destinationLocationId, setDestinationLocationId] = useState<
    string | null
  >(null)
  const [quantity, setQuantity] = useState<number>(lot.quantity_total)

  // Validation errors
  const [quantityError, setQuantityError] = useState("")
  const [destinationError, setDestinationError] = useState("")

  const [transferLot, { isLoading }] = useTransferLotMutation()

  // Find location names
  const sourceLocation = locations.find(
    (loc) => loc.location_id === lot.location_id,
  )
  const destinationLocation = locations.find(
    (loc) => loc.location_id === destinationLocationId,
  )

  // Reset form
  const resetForm = useCallback(() => {
    setDestinationLocationId(null)
    setQuantity(lot.quantity_total)
    setQuantityError("")
    setDestinationError("")
  }, [lot.quantity_total])

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

    // Validate destination
    if (!destinationLocationId) {
      setDestinationError(
        t(
          "TransferLotDialog.destinationRequired",
          "Please select a destination location",
        ),
      )
      isValid = false
    } else if (destinationLocationId === lot.location_id) {
      setDestinationError(
        t(
          "TransferLotDialog.sameLocation",
          "Destination must be different from source",
        ),
      )
      isValid = false
    } else {
      setDestinationError("")
    }

    // Validate quantity
    if (quantity <= 0) {
      setQuantityError(
        t(
          "TransferLotDialog.quantityRequired",
          "Quantity must be greater than 0",
        ),
      )
      isValid = false
    } else if (quantity > lot.quantity_total) {
      setQuantityError(
        t(
          "TransferLotDialog.quantityExceeds",
          "Quantity cannot exceed available amount ({max})",
          {
            max: lot.quantity_total,
          },
        ),
      )
      isValid = false
    } else {
      setQuantityError("")
    }

    return isValid
  }, [destinationLocationId, quantity, lot.location_id, lot.quantity_total, t])

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    try {
      await transferLot({
        lot_id: lot.lot_id,
        destination_location_id: destinationLocationId!,
        quantity,
      }).unwrap()

      issueAlert({
        message: t(
          "TransferLotDialog.transferSuccess",
          "Stock transferred successfully",
        ),
        severity: "success",
      })

      handleClose()
    } catch (error) {
      issueAlert({
        message: t(
          "TransferLotDialog.transferError",
          "Failed to transfer stock",
        ),
        severity: "error",
      })
    }
  }, [
    validateForm,
    transferLot,
    lot.lot_id,
    destinationLocationId,
    quantity,
    issueAlert,
    t,
    handleClose,
  ])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("TransferLotDialog.title", "Transfer Stock")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Transfer visualization */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Source */}
              <Box flex={1} sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("TransferLotDialog.from", "From")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {sourceLocation?.name ||
                    t("TransferLotDialog.unspecified", "Unspecified")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lot.quantity_total.toLocaleString()}{" "}
                  {t("TransferLotDialog.available", "available")}
                </Typography>
              </Box>

              {/* Arrow */}
              <ArrowIcon color="action" />

              {/* Destination */}
              <Box flex={1} sx={{ textAlign: "center" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {t("TransferLotDialog.to", "To")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {destinationLocation?.name ||
                    t(
                      "TransferLotDialog.selectDestination",
                      "Select destination",
                    )}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Quantity Input */}
          <TextField
            autoFocus
            label={t("TransferLotDialog.quantity", "Quantity to Transfer")}
            type="number"
            fullWidth
            required
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            error={!!quantityError}
            helperText={
              quantityError ||
              t("TransferLotDialog.quantityHelp", "Max: {max}", {
                max: lot.quantity_total,
              })
            }
            inputProps={{ min: 1, max: lot.quantity_total }}
            disabled={isLoading}
          />

          {/* Destination Location Selector */}
          <Box>
            <LocationSelector
              value={destinationLocationId}
              onChange={setDestinationLocationId}
              locations={locations}
              label={t("TransferLotDialog.destination", "Destination Location")}
              disabled={isLoading}
            />
            {destinationError && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, display: "block" }}
              >
                {destinationError}
              </Typography>
            )}
          </Box>

          {/* Info alert */}
          <Alert severity="info">
            {quantity === lot.quantity_total
              ? t(
                  "TransferLotDialog.fullTransferInfo",
                  "This will move the entire lot to the destination location.",
                )
              : t(
                  "TransferLotDialog.partialTransferInfo",
                  "This will create a new lot at the destination and reduce the source lot quantity.",
                )}
          </Alert>
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
          {t("TransferLotDialog.transfer", "Transfer")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
