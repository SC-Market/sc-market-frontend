import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { AddRounded, DeleteOutlineRounded } from "@mui/icons-material"
import { NumericFormat } from "react-number-format"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useFormatters } from "../../../util/format"
import { LocationSelector } from "../components/stock/LocationSelector"
import { type QuickListBatch, type QuickListForm } from "../domain/quickList"
import { TIERS, newBatch, type QuickListField } from "./quickListFields"
import type { QualityMode } from "../../../util/qualityMode"

/** Stock: one number, or batches split by location / quality. */
export function QuickListStock({
  form,
  update,
  updateBatch,
  setStockMode,
  fieldError,
  qualityMode,
  perBatch,
  total,
}: {
  form: QuickListForm
  update: (patch: Partial<QuickListForm>) => void
  updateBatch: (key: string, patch: Partial<QuickListBatch>) => void
  setStockMode: (mode: QuickListForm["stockMode"]) => void
  fieldError: (field: QuickListField) => string | undefined
  qualityMode: QualityMode
  perBatch: boolean
  total: number
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const isMobile = useIsMobile()
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        flexWrap="wrap"
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          id="quick-list-stock"
        >
          {t("quickList.stock", "Stock")}
        </Typography>
        <ToggleButtonGroup
          exclusive
          size="small"
          aria-labelledby="quick-list-stock"
          value={form.stockMode}
          onChange={(_, v: QuickListForm["stockMode"] | null) =>
            v && setStockMode(v)
          }
        >
          <ToggleButton value="simple" sx={{ textTransform: "none" }}>
            {t("quickList.stockSimple", "Just a number")}
          </ToggleButton>
          <ToggleButton value="batches" sx={{ textTransform: "none" }}>
            {t("quickList.stockBatches", "By location / quality")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      {form.stockMode === "simple" ? (
        <Typography variant="body2" color="text.primary" sx={{ mt: 0.75 }}>
          {t(
            "quickList.stockSimpleHelp",
            "One number is enough. You can split it by location or quality any time.",
          )}
        </Typography>
      ) : (
        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          {form.batches.map((batch, index) => (
            <Box
              key={batch.key}
              role="group"
              aria-label={t("quickList.batchLabel", {
                defaultValue: "Batch {{index}}",
                index: index + 1,
              })}
              sx={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "88px 1fr"
                  : `96px 1fr ${qualityMode === "none" ? "" : "120px "}${perBatch ? "140px " : ""}40px`,
                gap: 1,
                alignItems: "center",
                p: isMobile ? 1 : 0,
                border: isMobile ? 1 : 0,
                borderColor: "outline.main",
                borderRadius: (theme) =>
                  theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <NumericFormat
                customInput={TextField}
                size="small"
                decimalScale={0}
                allowNegative={false}
                thousandSeparator
                label={t("quickList.batchQuantity", "Qty")}
                value={batch.quantity}
                error={!!fieldError("batches") && !(batch.quantity > 0)}
                onValueChange={(v) =>
                  updateBatch(batch.key, { quantity: v.floatValue ?? 0 })
                }
                inputProps={{ inputMode: "numeric" }}
              />
              <LocationSelector
                size="small"
                fullWidth
                label={t("quickList.location", "Location")}
                value={batch.location_id ?? null}
                onChange={(id) =>
                  updateBatch(batch.key, { location_id: id ?? undefined })
                }
              />
              {qualityMode === "tier" && (
                <TextField
                  select
                  size="small"
                  label={t("quickList.quality", "Quality")}
                  value={batch.quality_tier ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    updateBatch(batch.key, {
                      quality_tier: v === 0 ? undefined : v,
                    })
                  }}
                >
                  <MenuItem value={0}>
                    {t("quickList.anyQuality", "Any")}
                  </MenuItem>
                  {TIERS.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {t("quickList.tierShort", {
                        defaultValue: "T{{tier}}",
                        tier,
                      })}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {qualityMode === "value" && (
                <NumericFormat
                  customInput={TextField}
                  size="small"
                  decimalScale={0}
                  allowNegative={false}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || floatValue <= 1000
                  }
                  label={t("quickList.qualityValue", "Quality (0-1000)")}
                  value={batch.quality_value ?? ""}
                  onValueChange={(v) =>
                    updateBatch(batch.key, {
                      quality_value: v.floatValue,
                    })
                  }
                  inputProps={{ inputMode: "numeric" }}
                />
              )}
              {perBatch && (
                <NumericFormat
                  customInput={TextField}
                  size="small"
                  decimalScale={0}
                  allowNegative={false}
                  thousandSeparator
                  label={t("quickList.batchPrice", "Price")}
                  value={batch.price ?? ""}
                  error={
                    !!fieldError("batches") && !(batch.price && batch.price > 0)
                  }
                  onValueChange={(v) =>
                    updateBatch(batch.key, { price: v.floatValue })
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">aUEC</InputAdornment>
                    ),
                  }}
                  inputProps={{ inputMode: "numeric" }}
                />
              )}
              <IconButton
                aria-label={t("quickList.removeBatch", "Remove batch")}
                disabled={form.batches.length <= 1}
                onClick={() =>
                  update({
                    batches: form.batches.filter((b) => b.key !== batch.key),
                  })
                }
                sx={{ justifySelf: isMobile ? "end" : "center" }}
              >
                <DeleteOutlineRounded />
              </IconButton>
            </Box>
          ))}
          {fieldError("batches") && (
            <Typography variant="caption" color="error">
              {fieldError("batches")}
            </Typography>
          )}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Button
              size="small"
              color="neutral"
              startIcon={<AddRounded />}
              onClick={() => update({ batches: [...form.batches, newBatch()] })}
            >
              {t("quickList.addBatch", "Add batch")}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {t("quickList.total", {
                defaultValue: "Total {{total}}",
                total: fmt.integer(total),
              })}
            </Typography>
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.pricePerBatch}
                onChange={(e) => update({ pricePerBatch: e.target.checked })}
              />
            }
            label={t("quickList.pricePerBatch", "Each batch has its own price")}
          />
        </Stack>
      )}
    </Box>
  )
}
