import React from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useAddWatchlistItemMutation,
  useRemoveWatchlistItemMutation,
  useUpdateWatchlistItemMutation,
  type WatchlistItem,
} from "../../../store/api/v2/market"
import { getErrorMessage } from "../../../util/errorHandling"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { formatAuec, parseTargetPrice } from "../domain/price"

export interface WatchPriceDialogProps {
  open: boolean
  onClose: () => void
  /** The game item to watch (add mode). */
  gameItemId: string
  itemName: string
  /** Current lowest price, shown as a hint and used to prefill a new watch. */
  currentPrice?: number | null
  /** The existing watch for this item: the dialog edits or removes it. */
  existing?: WatchlistItem
}

/**
 * Set (or change) the target price of a watched game item. A watch alerts
 * when a public listing of the item is at or below the target price.
 */
export function WatchPriceDialog({
  open,
  onClose,
  gameItemId,
  itemName,
  currentPrice,
  existing,
}: WatchPriceDialogProps) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const initial =
    existing?.max_price ??
    (currentPrice && currentPrice > 1 ? currentPrice : null)
  const [value, setValue] = React.useState(
    initial != null ? String(initial) : "",
  )

  React.useEffect(() => {
    if (open) setValue(initial != null ? String(initial) : "")
    // Reset the field each time the dialog opens.
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const [add, addState] = useAddWatchlistItemMutation()
  const [update, updateState] = useUpdateWatchlistItemMutation()
  const [remove, removeState] = useRemoveWatchlistItemMutation()
  const busy =
    addState.isLoading || updateState.isLoading || removeState.isLoading
  const failure = addState.error || updateState.error || removeState.error

  const price = parseTargetPrice(value)
  const invalid = value !== "" && price == null

  const save = async () => {
    if (price == null) return
    try {
      if (existing) {
        await update({
          watchlistId: existing.id,
          updateWatchlistItemRequest: { max_price: price },
        }).unwrap()
      } else {
        await add({
          addWatchlistItemRequest: {
            game_item_id: gameItemId,
            max_price: price,
          },
        }).unwrap()
      }
      issueAlert({
        message: t(
          "priceAlerts.watch.saved",
          "Watching {{name}} at ≤ {{price}}",
          {
            name: itemName,
            price: formatAuec(price),
          },
        ),
        severity: "success",
      })
      onClose()
    } catch {
      // Shown in the dialog.
    }
  }

  const stop = async () => {
    if (!existing) return
    try {
      await remove({ watchlistId: existing.id }).unwrap()
      issueAlert({
        message: t("priceAlerts.watch.removed", "Stopped watching {{name}}", {
          name: itemName,
        }),
        severity: "success",
      })
      onClose()
    } catch {
      // Shown in the dialog.
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="watch-price-dialog-title"
    >
      <DialogTitle id="watch-price-dialog-title">
        {existing
          ? t("priceAlerts.watch.editTitle", "Edit price alert")
          : t("priceAlerts.watch.title", "Watch price")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t(
              "priceAlerts.watch.explainer",
              "Get an alert when {{name}} is listed at or below your target price.",
              { name: itemName },
            )}
          </Typography>
          <TextField
            autoFocus
            label={t("priceAlerts.watch.targetPrice", "Target price")}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save()
            }}
            inputProps={{ inputMode: "numeric" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">aUEC</InputAdornment>
              ),
            }}
            error={invalid}
            helperText={
              invalid
                ? t(
                    "priceAlerts.watch.invalidPrice",
                    "Enter a whole number above 1 aUEC.",
                  )
                : currentPrice
                  ? t(
                      "priceAlerts.watch.currentLowest",
                      "Current lowest: {{price}}",
                      {
                        price: formatAuec(currentPrice),
                      },
                    )
                  : t(
                      "priceAlerts.watch.noListings",
                      "No public listings right now.",
                    )
            }
          />
          {failure && (
            <Alert severity="error">
              {getErrorMessage(failure) ??
                t("priceAlerts.watch.error", "Couldn't save your price alert.")}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {existing && (
          <Button
            color="error"
            onClick={stop}
            disabled={busy}
            sx={{ mr: "auto" }}
          >
            {t("priceAlerts.watch.stop", "Stop watching")}
          </Button>
        )}
        <Button onClick={onClose} disabled={busy}>
          {t("ui.cancel", "Cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={busy || price == null}
        >
          {existing
            ? t("ui.save", "Save")
            : t("priceAlerts.watch.add", "Watch price")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
