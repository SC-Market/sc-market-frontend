import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Slider,
  TextField,
} from "@mui/material"
import { TrackChangesRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { readableMissionText } from "../../seo/missionText"
import {
  type BlueprintIngredient,
  type SlotModifier,
  type MissionRewardingBlueprint,
} from "../../features/game-data/api/gameDataApi"
import { getCommodityColor } from "../../util/gameIcons"
import { GameItemAvatar } from "./GameItemAvatar"
import {
  isModifierPositive,
  interpolateModifier,
  formatModifierValue,
  buildPropertyDefMap,
  propertyDisplayName,
} from "../../util/statDisplay"
import { GAME_DATA_PATHS } from "../../routes/paths"
import { grey } from "@mui/material/colors"

import type { BlueprintDetailResponse } from "../../features/game-data/api/gameDataApi"
import type {
  CombinedModifiers,
  QualityRange,
} from "./useBlueprintModalQualities"

function formatQty(scu: number | string): string {
  const n = typeof scu === "string" ? parseFloat(scu) : scu
  if (isNaN(n)) return "0.00 SCU"
  return `${n.toFixed(2)} SCU`
}

/** One row per ingredient: quantity, quality slider and the stat effects of its slot. */
export function BlueprintIngredientSliders({
  ingredients,
  qualities,
  qualityRanges,
  setQuality,
  modsBySlot,
  propDefMap,
  craftQty,
}: {
  ingredients: BlueprintIngredient[]
  qualities: number[]
  qualityRanges: QualityRange[]
  setQuality: (idx: number, v: number) => void
  modsBySlot: Map<string, SlotModifier[]>
  propDefMap: ReturnType<typeof buildPropertyDefMap>
  craftQty: number
}) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1}>
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
                min={qr.min}
                max={qr.max}
                value={qv}
                onChange={(_, v) => setQuality(idx, v as number)}
                aria-label={
                  ing.game_item?.name
                    ? t("blueprintsUi.detail.qualityOf", {
                        name: ing.game_item.name,
                      })
                    : t("blueprintsUi.detail.qualityOfIngredient")
                }
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
            {(modsBySlot.get(ing.slot_name || ing.game_item?.name) || []).map(
              (mod: SlotModifier, mi: number) => {
                const def = propDefMap.get(mod.property)
                const factor = interpolateModifier(
                  qv,
                  mod.start_quality,
                  mod.end_quality,
                  mod.modifier_at_start,
                  mod.modifier_at_end,
                )
                const currentFormatted = formatModifierValue(
                  factor,
                  mod.modifier_type,
                  def,
                )
                const startFormatted = formatModifierValue(
                  mod.modifier_at_start,
                  mod.modifier_type,
                  def,
                )
                const endFormatted = formatModifierValue(
                  mod.modifier_at_end,
                  mod.modifier_type,
                  def,
                )
                // For color: normalize additive to multiplicative-like for isModifierPositive
                const positiveCheck =
                  mod.modifier_type === "additive" ? 1 + factor : factor
                const neutralValue = mod.modifier_type === "additive" ? 0 : 1
                return (
                  <Stack
                    key={mi}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.25 }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 120 }}
                    >
                      {propertyDisplayName(mod.property, def, t)}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={
                        isModifierPositive(mod.property, positiveCheck)
                          ? "success.main"
                          : factor === neutralValue
                            ? "text.secondary"
                            : "error.main"
                      }
                    >
                      {currentFormatted}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {t("blueprintsUi.detail.range", {
                        start: startFormatted,
                        end: endFormatted,
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

/** Missions that reward the blueprint (first 8, then a show-more chip). */
export function BlueprintMissionChips({
  missions,
  expanded,
  setExpanded,
  onClose,
}: {
  missions: MissionRewardingBlueprint[]
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        <TrackChangesRounded sx={{ fontSize: 16, mr: 0.5 }} />
        {t("blueprintsUi.detail.missionsCount", {
          count: missions.length,
        })}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {(expanded ? missions : missions.slice(0, 8)).map(
          (m: MissionRewardingBlueprint) => (
            <Chip
              key={m.mission_id}
              label={readableMissionText(m.mission_name)}
              size="small"
              sx={{ height: 22, cursor: "pointer" }}
              clickable
              component={RouterLink}
              to={GAME_DATA_PATHS.mission(m.mission_id)}
              onClick={() => onClose()}
            />
          ),
        )}
        {missions.length > 8 && (
          <Chip
            label={
              expanded
                ? t("blueprintsUi.detail.showLess")
                : `+${missions.length - 8}`
            }
            size="small"
            variant="outlined"
            sx={{ height: 22, cursor: "pointer" }}
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </Box>
    </Box>
  )
}

/** Base vs crafted values of the item stats the ingredient qualities change. */
export function BlueprintProductStats({
  itemAttrs,
  combinedModifiers,
  propDefMap,
}: {
  itemAttrs: BlueprintDetailResponse["item_attributes"]
  combinedModifiers: CombinedModifiers
  propDefMap: ReturnType<typeof buildPropertyDefMap>
}) {
  const { t } = useTranslation()
  if (!Object.keys(itemAttrs).length || !combinedModifiers.size) return null
  const stats = Array.from(combinedModifiers.entries()).filter(([prop]) => {
    const baseKey = Object.keys(itemAttrs).find((k) =>
      k.toLowerCase().includes(prop.replace(/^gpp_armor_/, "").toLowerCase()),
    )
    return baseKey && !isNaN(parseFloat(itemAttrs[baseKey]))
  })
  if (!stats.length) return null
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {t("blueprintsUi.detail.productStats")}
      </Typography>
      {stats.map(([prop, { value: modifier, modifierType }]) => {
        const def = propDefMap.get(prop)
        const baseKey = Object.keys(itemAttrs).find((k) =>
          k
            .toLowerCase()
            .includes(prop.replace(/^gpp_armor_/, "").toLowerCase()),
        )!
        const baseVal = parseFloat(itemAttrs[baseKey])
        const modified =
          modifierType === "additive" ? baseVal + modifier : baseVal * modifier
        const formattedMod = formatModifierValue(modifier, modifierType, def)
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
              {propertyDisplayName(prop, def, t)}
            </Typography>
            <Typography variant="caption">{baseVal.toFixed(2)}</Typography>
            <Typography variant="caption" color="text.disabled">
              {"→"}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={600}
              color={
                isModifierPositive(
                  prop,
                  modifierType === "additive" ? 1 + modifier : modifier,
                )
                  ? "success.main"
                  : modifier === (modifierType === "additive" ? 0 : 1)
                    ? "text.secondary"
                    : "error.main"
              }
            >
              {modified.toFixed(2)} ({formattedMod})
            </Typography>
          </Stack>
        )
      })}
      <Divider sx={{ mt: 1 }} />
    </Box>
  )
}
