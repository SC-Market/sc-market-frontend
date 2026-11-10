import { useNavigate } from "react-router-dom"
import { Box, Typography, Chip, Stack, TextField, Slider } from "@mui/material"
import {
  type BlueprintIngredient,
  type SlotModifier,
  type MissionRewardingBlueprint,
} from "../../store/api/v2/market"
import { getCommodityColor } from "../../util/gameIcons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"
import { TrackChangesRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  propertyLabel,
  isModifierPositive,
  interpolateModifier,
} from "../../util/statDisplay"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { grey } from "@mui/material/colors"
import type { BlueprintDetailResponse } from "../../store/api/v2/market"

/** Format quantity — values are in SCU, may be string from API */
function formatQty(scu: number | string): string {
  const n = typeof scu === "string" ? parseFloat(scu) : scu
  if (isNaN(n)) return "0.00 SCU"
  return `${n.toFixed(2)} SCU`
}

/** Missions that reward the blueprint (first 8, then show more). */
export function BlueprintMissionSources({
  missions_rewarding,
  missionsExpanded,
  setMissionsExpanded,
}: {
  missions_rewarding: MissionRewardingBlueprint[]
  missionsExpanded: boolean
  setMissionsExpanded: (expanded: boolean) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [expanded] = [missionsExpanded, setMissionsExpanded]
  const missions = expanded
    ? missions_rewarding
    : missions_rewarding.slice(0, 8)
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        <TrackChangesRounded sx={{ fontSize: 16, mr: 0.5 }} />
        {t("blueprintsUi.detail.missionsCount", {
          count: missions_rewarding.length,
        })}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {missions.map((m: MissionRewardingBlueprint) => (
          <Chip
            key={m.mission_id}
            label={m.mission_name}
            size="small"
            sx={{ height: 22, cursor: "pointer" }}
            onClick={() => navigate(GAME_DATA_PATHS.mission(m.mission_id))}
          />
        ))}
        {missions_rewarding.length > 8 && (
          <Chip
            label={
              expanded
                ? t("blueprintsUi.detail.showLess")
                : t("blueprintsUi.moreCount", {
                    count: missions_rewarding.length - 8,
                  })
            }
            size="small"
            variant="outlined"
            sx={{ height: 22, cursor: "pointer" }}
            onClick={() => setMissionsExpanded(!expanded)}
          />
        )}
      </Box>
    </Box>
  )
}

/** Base vs crafted values of the item stats the ingredient qualities change. */
export function BlueprintProductStatsPanel({
  itemAttrs,
  combinedModifiers,
}: {
  itemAttrs: BlueprintDetailResponse["item_attributes"]
  combinedModifiers: Map<string, number>
}) {
  const { t } = useTranslation()
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t("blueprintsUi.detail.productStats")}
      </Typography>
      {Array.from(combinedModifiers.entries()).map(([prop, modifier]) => {
        const baseKey = Object.keys(itemAttrs).find((k) =>
          k
            .toLowerCase()
            .includes(prop.replace(/^gpp_armor_/, "").toLowerCase()),
        )
        const baseVal = baseKey ? parseFloat(itemAttrs[baseKey]) : null
        if (baseVal === null || isNaN(baseVal)) return null
        const modified = baseVal * modifier
        const pctChange = (modifier - 1) * 100
        return (
          <Stack
            key={prop}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ py: 0.25 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ minWidth: 140 }}
            >
              {propertyLabel(prop, t)}
            </Typography>
            <Typography variant="caption">×{baseVal.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.primary">
              →
            </Typography>
            <Typography
              variant="caption"
              fontWeight={600}
              color={
                isModifierPositive(prop, modifier)
                  ? "success.main"
                  : modifier === 1
                    ? "text.secondary"
                    : "error.main"
              }
            >
              ×{modified.toFixed(2)} ({pctChange >= 0 ? "+" : ""}
              {pctChange.toFixed(1)}%)
            </Typography>
          </Stack>
        )
      })}
    </Box>
  )
}

/** One row per ingredient: quantity, quality slider and the stat effects of its slot. */
export function BlueprintIngredientRows({
  ingredients,
  qualities,
  qualityRanges,
  setQuality,
  modsBySlot,
  craftQty,
}: {
  ingredients: BlueprintIngredient[]
  qualities: number[]
  qualityRanges: { min: number; max: number }[]
  setQuality: (idx: number, v: number) => void
  modsBySlot: Map<string, SlotModifier[]>
  craftQty: number
}) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1} sx={{ mb: 1 }}>
      {ingredients.map((ing: BlueprintIngredient, idx: number) => {
        const qv =
          qualities[idx] ??
          Math.round((qualityRanges[idx]?.min + qualityRanges[idx]?.max) / 2)
        const qr = qualityRanges[idx] || { min: 0, max: 1000 }
        const color = getCommodityColor(ing.game_item?.sub_type) || grey[700]
        return (
          <Box
            key={idx}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              p: 1,
            }}
          >
            {/* Slot name header */}
            {ing.slot_display_name && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ mb: 0.25, display: "block" }}
              >
                {ing.slot_display_name}
              </Typography>
            )}
            {/* Ingredient header + quality slider on same row */}
            <Stack direction="row" spacing={1} alignItems="center">
              <GameItemAvatar
                name={ing.game_item?.name}
                iconUrl={ing.game_item?.icon_url}
                subType={ing.game_item?.sub_type}
                itemType={ing.game_item?.type}
                size={24}
              />
              <Box sx={{ minWidth: 100 }}>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  {ing.game_item?.name || t("blueprintsUi.detail.unknown")}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  lineHeight={1}
                >
                  {formatQty(
                    parseFloat(String(ing.quantity_required)) * craftQty,
                  )}
                  {craftQty > 1 &&
                    ` ${t("blueprintsUi.detail.perEach", { qty: formatQty(ing.quantity_required) })}`}
                  {ing.min_quality_tier
                    ? ` · ${t("blueprintsUi.detail.minTier", { tier: ing.min_quality_tier })}`
                    : ""}
                </Typography>
              </Box>
              <Slider
                size="small"
                aria-label={
                  ing.game_item?.name
                    ? t("blueprintsUi.detail.qualityOf", {
                        name: ing.game_item.name,
                      })
                    : t("blueprintsUi.detail.qualityOfIngredient")
                }
                min={qr.min}
                max={qr.max}
                value={qv}
                onChange={(_, v) => setQuality(idx, v as number)}
                sx={{
                  flex: 1,
                  color,
                  "& .MuiSlider-thumb": { width: 12, height: 12 },
                }}
              />
              <TextField
                size="small"
                type="number"
                value={qv}
                onChange={(e) => setQuality(idx, +e.target.value || 0)}
                inputProps={{ min: qr.min, max: qr.max }}
                sx={{
                  width: 70,
                  "& input": { py: 0.5, fontSize: "0.8rem" },
                }}
              />
            </Stack>

            {/* Stat effects from slot modifiers */}
            {(modsBySlot.get(ing.slot_name || ing.game_item?.name) || []).map(
              (mod: SlotModifier, mi: number) => {
                const factor = interpolateModifier(
                  qv,
                  mod.start_quality,
                  mod.end_quality,
                  mod.modifier_at_start,
                  mod.modifier_at_end,
                )
                const pctChange = (factor - 1) * 100
                return (
                  <Stack
                    key={mi}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 120 }}
                    >
                      {propertyLabel(mod.property, t)}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={
                        isModifierPositive(mod.property, factor)
                          ? "success.main"
                          : factor === 1
                            ? "text.secondary"
                            : "error.main"
                      }
                    >
                      ×{factor.toFixed(3)} {pctChange >= 0 ? "+" : ""}
                      {pctChange.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="text.primary">
                      {t("blueprintsUi.detail.factorRange", {
                        start: mod.modifier_at_start,
                        end: mod.modifier_at_end,
                      })}
                    </Typography>
                  </Stack>
                )
              },
            )}
          </Box>
        )
      })}
    </Stack>
  )
}
