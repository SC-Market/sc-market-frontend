/**
 * Transfer Lot Dialog V2 Component
 *
 * Modal form for transferring stock lots between locations.
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
  CircularProgress,
  Typography,
  Stack,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  type StockLotDetail,
  type LocationInfo,
} from "../../../../store/api/v2/market"
import { LocationSelector } from "../../components/stock/LocationSelector"
import { useFormatters, useNow } from "../../../../util/format"
import { useTransferLot } from "../../hooks/useStockLotActions"

export interface TransferLotDialogV2Props {
  open: boolean
  onClose: () => void
  lot: StockLotDetail
  locations: LocationInfo[]
}

/**
 * TransferLotDialogV2 Component
 *
 * Simple dialog for transferring a stock lot to a different location.
 */
export function TransferLotDialogV2({
  open,
  onClose,
  lot,
  locations,
}: TransferLotDialogV2Props) {
  const fmt = useFormatters()
  const now = useNow()
  const { t } = useTranslation()

  const [newLocationId, setNewLocationId] = useState<string | null>(
    lot.location?.location_id || null,
  )

  const { transfer, isLoading } = useTransferLot()

  const handleTransfer = useCallback(async () => {
    if (await transfer(lot.lot_id, newLocationId)) onClose()
  }, [lot.lot_id, newLocationId, transfer, onClose])

  // Convert LocationInfo[] to Location[] format
  const locationsForSelector = locations.map((loc) => ({
    location_id: loc.location_id,
    name: loc.name,
    is_preset: loc.is_preset,
    display_order: null,
    created_by: null,
    created_at: new Date(now).toISOString(),
  }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("TransferLotDialogV2.title", "Transfer Stock Lot")}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2" color="text.secondary">
            {t(
              "TransferLotDialogV2.description",
              "Transfer this lot to a different location:",
            )}
          </Typography>

          <Typography variant="body2">
            <strong>{t("TransferLotDialogV2.quantity", "Quantity")}:</strong>{" "}
            {fmt.number(lot.quantity_total)}
          </Typography>

          <Typography variant="body2">
            <strong>{t("TransferLotDialogV2.variant", "Variant")}:</strong>{" "}
            {lot.variant.display_name}
          </Typography>

          <Typography variant="body2">
            <strong>
              {t("TransferLotDialogV2.currentLocation", "Current Location")}:
            </strong>{" "}
            {lot.location?.name ||
              t("TransferLotDialogV2.unspecified", "Unspecified")}
          </Typography>

          <LocationSelector
            value={newLocationId}
            onChange={setNewLocationId}
            locations={locationsForSelector}
            label={t("TransferLotDialogV2.newLocation", "New Location")}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          {t("TransferLotDialogV2.cancel", "Cancel")}
        </Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          disabled={isLoading || newLocationId === lot.location?.location_id}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            t("TransferLotDialogV2.transfer", "Transfer")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
