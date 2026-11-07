import { type CalculateQualityResponse } from "../../store/api/v2/market"
import { useMemo } from "react"
import {
  Typography,
  Paper,
  TextField,
  IconButton,
  Slider,
  Stack,
} from "@mui/material"
import { DeleteRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useSearchResourcesQuery,
  type QualityBand,
} from "../../store/api/v2/market"
import { QualityBandSelect } from "../../components/game-data/QualityBandSelect"

export interface MaterialInput {
  id: number
  game_item_id: string
  game_item_name: string
  quality_value: number
  quantity: number
}

/**
 * Per-material quality input: shows QualityBandSelect when the resource has
 * discrete quality bands, otherwise falls back to the free-range slider.
 */
function MaterialQualityInput({
  materialName,
  value,
  onChange,
}: {
  materialName: string
  value: number
  onChange: (val: number) => void
}) {
  const { t } = useTranslation()
  const { data: resourceData } = useSearchResourcesQuery(
    { text: materialName, pageSize: 5 },
    { skip: !materialName },
  )

  // Match by exact name (case-insensitive) to get quality bands
  const bands: QualityBand[] = useMemo(() => {
    if (!resourceData?.resources?.length) return []
    const match = resourceData.resources.find(
      (r) => r.resource_name.toLowerCase() === materialName.toLowerCase(),
    )
    return match?.quality_bands ?? []
  }, [resourceData, materialName])

  if (bands.length > 0) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: 50 }}
        >
          {t("crafting.quality")}
        </Typography>
        <QualityBandSelect
          bands={bands}
          value={value}
          onChange={(val) => onChange(val ?? 500)}
          label={t("crafting.quality")}
          allowAny={false}
          size="small"
          fullWidth
        />
      </Stack>
    )
  }

  // Fallback: free-range slider for materials without quality bands
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 50 }}
      >
        {t("crafting.quality")}
      </Typography>
      <Slider
        aria-label={t("crafting.quality")}
        value={value}
        onChange={(_, val) => onChange(val as number)}
        min={0}
        max={1000}
        step={1}
        size="small"
        sx={{ flex: 1 }}
        color={value >= 600 ? "success" : value >= 300 ? "primary" : "warning"}
      />
      <TextField
        size="small"
        type="number"
        value={value}
        sx={{ width: 80 }}
        onChange={(e) =>
          onChange(Math.max(0, Math.min(1000, +e.target.value || 0)))
        }
        inputProps={{ min: 0, max: 1000 }}
      />
    </Stack>
  )
}

/** One material in the calculator: quantity, quality and, after a
 *  calculation, its contribution to the output quality. */
export function MaterialRow({
  mat,
  result,
  onUpdate,
  onRemove,
}: {
  mat: MaterialInput
  result: CalculateQualityResponse | undefined
  onUpdate: (field: keyof MaterialInput, value: string | number) => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  // Find this material's contribution from the result (if calculated)
  const contrib = result?.calculation_breakdown?.quality_contributions?.find(
    (c) => c.material_name === mat.game_item_name,
  )
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {mat.game_item_name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            type="number"
            label={t("crafting.quantity")}
            value={mat.quantity}
            sx={{ width: 65 }}
            onChange={(e) =>
              onUpdate("quantity", Math.max(1, +e.target.value || 1))
            }
            inputProps={{ min: 1 }}
          />
          <IconButton
            size="small"
            onClick={() => onRemove()}
            aria-label={t("craftingUi.removeMaterial")}
          >
            <DeleteRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      {/* Quality input — band select when available, slider fallback */}
      <MaterialQualityInput
        materialName={mat.game_item_name}
        value={mat.quality_value}
        onChange={(val) => onUpdate("quality_value", val)}
      />

      {/* Per-material contribution (shown after calculation) */}
      {contrib && (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t("craftingUi.weight", {
              percent: (contrib.weight * 100).toFixed(0),
            })}
          </Typography>
          <Typography
            variant="caption"
            fontWeight="bold"
            color={
              contrib.quality_value >= result!.output_quality_value
                ? "success.main"
                : "error.main"
            }
          >
            {t("craftingUi.contribution", {
              value: contrib.contribution.toFixed(1),
            })}
            {contrib.quality_value >= result!.output_quality_value
              ? " ↑"
              : " ↓"}
          </Typography>
        </Stack>
      )}
    </Paper>
  )
}
