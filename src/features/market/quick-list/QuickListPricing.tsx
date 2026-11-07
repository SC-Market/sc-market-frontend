import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { AddRounded, RemoveRounded } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useFormatters } from "../../../util/format"
import { type QuickListForm, type QuickListItem } from "../domain/quickList"
import { TIERS, type QuickListField } from "./quickListFields"
import type { QualityMode } from "../../../util/qualityMode"
import type { MarketPriceHint } from "../domain/quickList"

/** Price and quantity, and the quality tier for items that have tiers. */
export function QuickListPricing({
  form,
  update,
  item,
  perBatch,
  hint,
  qualityMode,
  fieldError,
  clearError,
  setPriceTouched,
}: {
  form: QuickListForm
  update: (patch: Partial<QuickListForm>) => void
  item: QuickListItem | null
  perBatch: boolean
  hint: MarketPriceHint | null
  qualityMode: QualityMode
  fieldError: (field: QuickListField) => string | undefined
  clearError: (field: QuickListField) => void
  setPriceTouched: (touched: boolean) => void
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const isMobile = useIsMobile()
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            isMobile || form.stockMode === "batches" ? "1fr" : "7fr 5fr",
          gap: 2,
        }}
      >
        <NumericFormat
          customInput={TextField}
          id="quick-list-price"
          decimalScale={0}
          allowNegative={false}
          thousandSeparator
          fullWidth
          required={!perBatch}
          disabled={!item || perBatch}
          label={t("quickList.price", "Price per unit")}
          value={form.price || ""}
          onValueChange={(values, source) => {
            if (source.source === "event") setPriceTouched(true)
            clearError("price")
            update({ price: values.floatValue ?? 0 })
          }}
          error={!!fieldError("price")}
          helperText={
            fieldError("price") ??
            (perBatch
              ? t(
                  "quickList.pricePerBatchActive",
                  "Each batch has its own price.",
                )
              : hint
                ? t("quickList.marketHint", {
                    defaultValue:
                      "Market: low {{low}} · median {{median}} · {{listings}}",
                    low: hint.low != null ? fmt.integer(hint.low) : "—",
                    median:
                      hint.median != null ? fmt.integer(hint.median) : "—",
                    listings: t("quickList.listingCount", {
                      count: hint.listings,
                      formatted: fmt.integer(hint.listings),
                    }),
                  })
                : item
                  ? t(
                      "quickList.noMarket",
                      "No market price yet: you set the first one.",
                    )
                  : " ")
          }
          InputProps={{
            endAdornment: <InputAdornment position="end">aUEC</InputAdornment>,
          }}
          inputProps={{ inputMode: "numeric" }}
        />
        {form.stockMode === "simple" && (
          <NumericFormat
            customInput={TextField}
            id="quick-list-quantity"
            decimalScale={0}
            allowNegative={false}
            thousandSeparator
            fullWidth
            required
            label={t("quickList.quantity", "Quantity")}
            value={form.quantity}
            onValueChange={(values) => {
              clearError("quantity")
              update({ quantity: values.floatValue ?? 0 })
            }}
            error={!!fieldError("quantity")}
            helperText={fieldError("quantity") ?? " "}
            inputProps={{
              inputMode: "numeric",
              style: { textAlign: "center" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    size="small"
                    edge="start"
                    aria-label={t("quickList.oneLess", "One less")}
                    disabled={form.quantity <= 1}
                    onClick={() =>
                      update({ quantity: Math.max(1, form.quantity - 1) })
                    }
                  >
                    <RemoveRounded fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label={t("quickList.oneMore", "One more")}
                    onClick={() => {
                      clearError("quantity")
                      update({ quantity: form.quantity + 1 })
                    }}
                  >
                    <AddRounded fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {/* Quality: only for items with tiers */}
      {qualityMode === "tier" && form.stockMode === "simple" && (
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
            sx={{ mb: 0.75 }}
            id="quick-list-quality"
          >
            {t("quickList.quality", "Quality")}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            aria-labelledby="quick-list-quality"
            value={form.qualityTier ?? 0}
            onChange={(_, v: number | null) => {
              if (v !== null) update({ qualityTier: v === 0 ? undefined : v })
            }}
            sx={{ flexWrap: "wrap" }}
          >
            <ToggleButton value={0} sx={{ px: 1.75, textTransform: "none" }}>
              {t("quickList.anyQuality", "Any")}
            </ToggleButton>
            {TIERS.map((tier) => (
              <ToggleButton key={tier} value={tier} sx={{ px: 1.75 }}>
                {t("quickList.tierShort", {
                  defaultValue: "T{{tier}}",
                  tier,
                })}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      )}
    </>
  )
}
