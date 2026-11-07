import {
  Grid,
  Typography,
  Paper,
  Chip,
  Box,
  Stack,
  Divider,
} from "@mui/material"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { useFormatters } from "../../util/format"
import { qualityChipSx, qualityTierColor } from "../../util/qualityColor"
import {
  type CalculateQualityResponse,
  type CraftableBlueprintResult,
} from "../../store/api/v2/market"

/** Calculated output quality, per-material impact and cost breakdown. */
export function CraftingResultPanel({
  result,
}: {
  result: CalculateQualityResponse
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("craftingUi.estimatedOutput")}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: 2 }}
        >
          <Chip
            label={t("craftingUi.tierN", {
              tier: result.output_quality_tier,
            })}
            sx={qualityChipSx(qualityTierColor(result.output_quality_tier))}
          />
          <Typography>
            <Trans
              i18nKey="craftingUi.resultQuality"
              values={{
                quality: result.output_quality_value.toFixed(0),
              }}
              components={{ strong: <strong /> }}
            />
          </Typography>
          {result.output_quantity > 1 && (
            <Typography>
              <Trans
                i18nKey="craftingUi.resultOutput"
                values={{ quantity: result.output_quantity }}
                components={{ strong: <strong /> }}
              />
            </Typography>
          )}
          <Typography>
            <Trans
              i18nKey="craftingUi.resultSuccess"
              values={{
                percent: result.success_probability.toFixed(1),
              }}
              components={{ strong: <strong /> }}
            />
          </Typography>
          {result.critical_success_chance > 0 && (
            <Typography color="warning.main">
              <Trans
                i18nKey="craftingUi.resultCrit"
                values={{
                  percent: result.critical_success_chance.toFixed(1),
                }}
                components={{ strong: <strong /> }}
              />
            </Typography>
          )}
        </Stack>

        {/* Stats impact table — shows when backend provides stat data */}
        {/* TODO: Backend needs to return base_stats and predicted_stats per output item */}
        {/* Example structure:
          Stat          Base    Crafted   Diff
          Fire Rate     650 RPM 689 RPM   +6.00%
          Damage        28      29.4      +5.00%
      */}

        {/* Per-material quality impact */}
        {result.calculation_breakdown?.quality_contributions?.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              {t("craftingUi.qualityImpact")}
            </Typography>
            <Stack spacing={0.5}>
              {result.calculation_breakdown.quality_contributions.map(
                (c, i) => {
                  const avgQuality = result.output_quality_value
                  const delta = c.contribution - avgQuality * c.weight
                  const isPositive = delta >= 0
                  return (
                    <Stack
                      key={i}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        sx={{ flex: 1, minWidth: 100 }}
                        noWrap
                      >
                        {c.material_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("craftingUi.qualityWeight", {
                          quality: c.quality_value.toFixed(0),
                          percent: (c.weight * 100).toFixed(0),
                        })}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={isPositive ? "success.main" : "error.main"}
                      >
                        {isPositive ? "+" : ""}
                        {delta.toFixed(1)}
                      </Typography>
                    </Stack>
                  )
                },
              )}
            </Stack>
          </>
        )}

        {/* Cost breakdown */}
        {result.estimated_cost && result.estimated_cost.total_cost > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Typography variant="body2">
                <Trans
                  i18nKey="craftingUi.costMaterials"
                  values={{
                    amount: fmt.number(result.estimated_cost.material_cost),
                  }}
                  components={{ strong: <strong /> }}
                />
              </Typography>
              {result.estimated_cost.crafting_station_fee ? (
                <Typography variant="body2">
                  <Trans
                    i18nKey="craftingUi.costStationFee"
                    values={{
                      amount: fmt.number(
                        result.estimated_cost.crafting_station_fee,
                      ),
                    }}
                    components={{ strong: <strong /> }}
                  />
                </Typography>
              ) : null}
              <Typography variant="body2" fontWeight="bold">
                {t("craftingUi.costTotal", {
                  amount: fmt.number(result.estimated_cost.total_cost),
                })}
              </Typography>
            </Stack>
          </>
        )}
      </Paper>
    </Grid>
  )
}

/** "What can I craft?" results: blueprints the listed materials can make. */
export function CraftableResultsList({
  craftableResults,
}: {
  craftableResults: CraftableBlueprintResult[]
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("craftingUi.craftableItems", {
            count: craftableResults.length,
          })}
        </Typography>
        <Stack spacing={1}>
          {craftableResults.map((bp) => (
            <Paper
              key={bp.blueprint_id}
              variant="outlined"
              sx={{
                p: 1.5,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() =>
                navigate(GAME_DATA_PATHS.blueprint(bp.blueprint_name))
              }
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {bp.output_item_icon && (
                  <Box
                    component="img"
                    src={bp.output_item_icon}
                    sx={{
                      width: 32,
                      height: 32,
                      objectFit: "contain",
                    }}
                  />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {bp.output_item_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {bp.item_category}
                    {bp.crafting_time_seconds
                      ? ` · ${t("craftingUi.minutesShort", { minutes: Math.round(bp.crafting_time_seconds / 60) })}`
                      : ""}
                  </Typography>
                </Box>
                <Chip
                  label={`×${bp.max_craftable}`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ mt: 0.5 }}
                flexWrap="wrap"
                useFlexGap
              >
                {bp.ingredients.map((ing, i) => (
                  <Chip
                    key={i}
                    size="small"
                    variant="outlined"
                    label={`${ing.name}: ${ing.quantity_required.toFixed(2)} / ${ing.available_quantity.toFixed(2)}`}
                    color={
                      ing.available_quantity >= ing.quantity_required
                        ? "success"
                        : "error"
                    }
                    sx={{ height: 20, fontSize: "0.65rem" }}
                  />
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Grid>
  )
}
