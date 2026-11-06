import React from "react"
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useFocusOnReveal } from "../../../hooks/accessibility/useFocusOnReveal"
import type { WatchlistItem } from "../../../store/api/v2/market"
import { useWatchPrice } from "../hooks/useWatchlistActions"
import { getErrorMessage } from "../../../util/errorHandling"
import { parseTargetPrice, QUALITY_TIERS } from "../domain/price"

import { useFormatters } from "../../../util/format"
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
  /**
   * Offer a minimum quality: the item comes in quality tiers (crafted items).
   * Always shown when the existing watch already has one.
   */
  qualityRelevant?: boolean
}

/**
 * Set (or change) the target price of a watched game item, and for items
 * that come in quality tiers an optional minimum quality. A watch alerts when
 * a public listing of the item (of at least that quality) is at or below the
 * target price.
 */
export function WatchPriceDialog({
  open,
  onClose,
  gameItemId,
  itemName,
  currentPrice,
  existing,
  qualityRelevant = false,
}: WatchPriceDialogProps) {
  const { t } = useTranslation()
  const focusOnReveal = useFocusOnReveal<HTMLInputElement>()
  const fmt = useFormatters()
  const initial =
    existing?.max_price ??
    (currentPrice && currentPrice > 1 ? currentPrice : null)
  const [value, setValue] = React.useState(
    initial != null ? String(initial) : "",
  )
  const initialTier = existing?.min_quality_tier ?? null
  const [tier, setTier] = React.useState<number | null>(initialTier)
  const showQuality = qualityRelevant || initialTier != null

  // Reset the fields each time the dialog opens (only then: a price update
  // while it is open must not overwrite what the user typed).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setValue(initial != null ? String(initial) : "")
      setTier(initialTier)
    }
  }

  const watch = useWatchPrice({ gameItemId, itemName, existing })
  const { busy, failure } = watch

  const price = parseTargetPrice(value)
  const invalid = value !== "" && price == null

  const save = async () => {
    if (price == null) return
    if (await watch.save(price, tier, showQuality)) onClose()
  }

  const stop = async () => {
    if (await watch.stop()) onClose()
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
            inputRef={focusOnReveal}
            label={t("priceAlerts.watch.targetPrice", "Target price")}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void save()
            }}
            inputProps={{ inputMode: "numeric" }}
            InputLabelProps={{ shrink: true }}
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
                        price: fmt.auec(currentPrice),
                      },
                    )
                  : t(
                      "priceAlerts.watch.noListings",
                      "No public listings right now.",
                    )
            }
          />
          {showQuality && (
            <TextField
              select
              label={t("priceAlerts.watch.quality", "Minimum quality")}
              value={tier ?? ""}
              onChange={(e) =>
                setTier(e.target.value === "" ? null : Number(e.target.value))
              }
              SelectProps={{ displayEmpty: true }}
              InputLabelProps={{ shrink: true }}
              helperText={t(
                "priceAlerts.watch.qualityHint",
                "Only listings with stock of this quality or better alert, at their price.",
              )}
            >
              <MenuItem value="">
                {t("priceAlerts.watch.anyQuality", "Any quality")}
              </MenuItem>
              {QUALITY_TIERS.map((q) => (
                <MenuItem key={q} value={q}>
                  {t(
                    "priceAlerts.watch.tierOrBetter",
                    "Tier {{tier}} or better",
                    {
                      tier: q,
                    },
                  )}
                </MenuItem>
              ))}
            </TextField>
          )}
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
