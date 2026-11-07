import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { GetVariantTypesApiResponse } from "../../../../store/api/v2/market"

/** The lot's variant attributes: quality tier and value, source, blueprint tier, preview. */
export function LotVariantAttributesFields({
  qualityTier,
  setQualityTier,
  qualityValue,
  setQualityValue,
  craftedSource,
  setCraftedSource,
  blueprintTier,
  setBlueprintTier,
  variantPreview,
  variantTypesData,
}: {
  qualityTier: number
  setQualityTier: (value: number) => void
  qualityValue: number | undefined
  setQualityValue: (value: number | undefined) => void
  craftedSource: string | undefined
  setCraftedSource: (value: string | undefined) => void
  blueprintTier: number | undefined
  setBlueprintTier: (value: number | undefined) => void
  variantPreview: string
  variantTypesData: GetVariantTypesApiResponse | undefined
}) {
  const { t } = useTranslation()
  return (
    <>
      {/* Variant Attributes Section */}
      <Typography variant="subtitle2" color="text.secondary">
        {t("CreateLotDialogV2.variantAttributes", "Variant Attributes")}
      </Typography>

      {/* Quality Tier */}
      <FormControl fullWidth required>
        <InputLabel id="create-lot-quality-tier-label">
          {t("CreateLotDialogV2.qualityTier", "Quality Tier")}
        </InputLabel>
        <Select
          labelId="create-lot-quality-tier-label"
          value={qualityTier}
          onChange={(e) => setQualityTier(Number(e.target.value))}
          label={t("CreateLotDialogV2.qualityTier", "Quality Tier")}
        >
          {(() => {
            const qualityTierType = variantTypesData?.variant_types.find(
              (vt) => vt.name === "quality_tier",
            )
            const min = qualityTierType?.min_value ?? 1
            const max = qualityTierType?.max_value ?? 5
            return Array.from({ length: max - min + 1 }, (_, i) => min + i).map(
              (tier) => (
                <MenuItem key={tier} value={tier}>
                  {t("CreateLotDialogV2.tier", "Tier")} {tier}
                </MenuItem>
              ),
            )
          })()}
        </Select>
      </FormControl>

      {/* Quality Value */}
      <TextField
        type="number"
        value={qualityValue || ""}
        onChange={(e) =>
          setQualityValue(
            e.target.value ? parseFloat(e.target.value) : undefined,
          )
        }
        fullWidth
        label={t("CreateLotDialogV2.qualityValue", "Quality Value (%)")}
        helperText={t(
          "CreateLotDialogV2.qualityValueHelper",
          "Optional: Precise quality value (0-1000)",
        )}
        inputProps={{ min: 0, max: 1000, step: 1 }}
      />

      {/* Crafted Source */}
      <FormControl fullWidth>
        <InputLabel id="create-lot-source-label">
          {t("CreateLotDialogV2.craftedSource", "Source")}
        </InputLabel>
        <Select
          labelId="create-lot-source-label"
          value={craftedSource || ""}
          onChange={(e) => setCraftedSource(e.target.value || undefined)}
          label={t("CreateLotDialogV2.craftedSource", "Source")}
        >
          <MenuItem value="">{t("CreateLotDialogV2.none", "None")}</MenuItem>
          {(() => {
            const sourceType = variantTypesData?.variant_types.find(
              (vt) => vt.name === "crafted_source",
            )
            const values = sourceType?.allowed_values ?? [
              "crafted",
              "store",
              "looted",
              "unknown",
            ]
            return values.map((val) => (
              <MenuItem key={val} value={val}>
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </MenuItem>
            ))
          })()}
        </Select>
      </FormControl>

      {/* Blueprint Tier */}
      <TextField
        type="number"
        value={blueprintTier || ""}
        onChange={(e) =>
          setBlueprintTier(
            e.target.value ? parseInt(e.target.value) : undefined,
          )
        }
        fullWidth
        label={t("CreateLotDialogV2.blueprintTier", "Blueprint Tier")}
        helperText={t(
          "CreateLotDialogV2.blueprintTierHelper",
          "Optional: Blueprint quality tier (1-5)",
        )}
        inputProps={{ min: 1, max: 5 }}
      />

      {/* Variant Preview */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: "action.hover",
          borderRadius: 1,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          {t("CreateLotDialogV2.preview", "Variant Preview")}:
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          {variantPreview}
        </Typography>
      </Box>
    </>
  )
}
