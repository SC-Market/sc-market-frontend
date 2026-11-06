/**
 * BlueprintDetail — matches scmdb.net layout with inline crafting calculator
 */

import React, { useState, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  TextField,
  Grid,
  Slider,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material"
import {
  useGetBlueprintDetailQuery,
  useGetOrgBlueprintOwnersQuery,
  useAddBlueprintToInventoryMutation,
  useRemoveBlueprintFromInventoryMutation,
  type BlueprintIngredient,
  type SlotModifier,
  type MissionRewardingBlueprint,
} from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { getCommodityColor, getItemCategoryColor } from "../../util/gameIcons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import {
  BlueprintTags,
  blueprintTagsFromDetail,
} from "../../components/game-data/BlueprintTags"
import {
  TrackChangesRounded,
  BuildRounded,
  TimerRounded,
  Bookmark,
  BookmarkBorder,
} from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  propertyLabel,
  isModifierPositive,
  interpolateModifier,
} from "../../util/statDisplay"

/** Format quantity — values are in SCU, may be string from API */
function formatQty(scu: number | string): string {
  const n = typeof scu === "string" ? parseFloat(scu) : scu
  if (isNaN(n)) return "0.00 SCU"
  return `${n.toFixed(2)} SCU`
}

import {
  formatCraftingTime,
  NON_RECLAIMABLE_RESOURCES,
} from "../../constants/crafting"
import { FRONTEND_URL } from "../../util/constants"
import { GAME_DATA_PATHS, USER_PATHS } from "../../routes/paths"
import {
  blueprintItemName,
  blueprintSeoText,
  buildBlueprintHead,
} from "../../seo/gameDataHeads"
import { SeoHead } from "../../seo/SeoHead"

import { useFormatters } from "../../util/format"
import { grey } from "@mui/material/colors"

export function BlueprintDetail() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: slug! },
    { skip: !slug },
  )
  const bp = data?.blueprint
  const outputItem = data?.output_item
  const itemName = blueprintItemName(data)
  const ingredients = useMemo(
    () => data?.ingredients || [],
    [data?.ingredients],
  )
  const slotModifiers = useMemo(
    () => data?.slot_modifiers || [],
    [data?.slot_modifiers],
  )
  const itemAttrs = data?.item_attributes || {}

  const { data: userProfile } = useGetUserProfileQuery()
  const spectrumId = userProfile?.contractors?.[0]?.spectrum_id
  const [tab, setTab] = useState(0)
  const [missionsExpanded, setMissionsExpanded] = useState(false)

  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()
  const handleBookmarkToggle = async () => {
    if (!slug) return
    try {
      if (data?.user_owns)
        await removeFromInventory({ blueprintId: slug }).unwrap()
      else await addToInventory({ blueprintId: slug, body: {} }).unwrap()
    } catch {
      /* not logged in */
    }
  }

  const { data: orgOwners } = useGetOrgBlueprintOwnersQuery(
    { blueprintId: slug!, spectrumId: spectrumId! },
    { skip: !slug || !spectrumId },
  )

  // Group slot modifiers by slot_name
  const modsBySlot = useMemo(() => {
    const map = new Map<string, SlotModifier[]>()
    for (const m of slotModifiers) {
      if (!map.has(m.slot_name)) map.set(m.slot_name, [])
      map.get(m.slot_name)!.push(m)
    }
    return map
  }, [slotModifiers])

  // Quality range per ingredient from slot modifiers
  const qualityRanges = useMemo(() => {
    return ingredients.map((ing: BlueprintIngredient) => {
      const mods = modsBySlot.get(ing.slot_name || ing.game_item?.name) || []
      if (!mods.length) return { min: 0, max: 1000 }
      const min = Math.min(...mods.map((m: SlotModifier) => m.start_quality))
      const max = Math.max(...mods.map((m: SlotModifier) => m.end_quality))
      return { min, max }
    })
  }, [ingredients, modsBySlot])

  // Quality state per ingredient
  const [qualities, setQualities] = useState<number[]>([])
  const [craftQty, setCraftQty] = useState(1)
  React.useEffect(() => {
    if (ingredients.length && qualities.length !== ingredients.length) {
      setQualities(qualityRanges.map((r) => Math.round((r.min + r.max) / 2)))
    }
  }, [ingredients.length, qualities.length, qualityRanges])

  const setQuality = (idx: number, v: number) =>
    setQualities((prev) =>
      prev.map((q, i) => {
        if (i !== idx) return q
        const r = qualityRanges[i] || { min: 0, max: 1000 }
        return Math.max(r.min, Math.min(r.max, v))
      }),
    )

  const setAllQualities = (mode: "min" | "mid" | "max") =>
    setQualities(
      qualityRanges.map((r) =>
        mode === "min"
          ? r.min
          : mode === "max"
            ? r.max
            : Math.round((r.min + r.max) / 2),
      ),
    )

  // Compute combined modifier per property from all slots at current qualities
  const combinedModifiers = useMemo(() => {
    const result = new Map<string, number>()
    for (const mod of slotModifiers) {
      const slotIdx = ingredients.findIndex(
        (ing: BlueprintIngredient) =>
          (ing.slot_name || ing.game_item?.name) === mod.slot_name,
      )
      const qv = qualities[slotIdx] ?? 500
      const factor = interpolateModifier(
        qv,
        mod.start_quality,
        mod.end_quality,
        mod.modifier_at_start,
        mod.modifier_at_end,
      )
      result.set(mod.property, (result.get(mod.property) || 1) * factor)
    }
    return result
  }, [slotModifiers, qualities, ingredients])

  // Estimated output quality
  const outputQuality = useMemo(() => {
    if (!ingredients.length || !qualities.length) return 500
    const total = ingredients.reduce((s, _, i) => s + (qualities[i] ?? 500), 0)
    return Math.round(total / ingredients.length)
  }, [qualities, ingredients])

  const { title: seoTitle, description: seoDescription } =
    blueprintSeoText(data)
  const head =
    data && bp && slug ? buildBlueprintHead(data, slug, FRONTEND_URL) : null

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/blueprints/${slug}`}
      headerTitle={itemName}
      breadcrumbs={[
        {
          label: t("blueprintsUi.detail.breadcrumb"),
          href: GAME_DATA_PATHS.blueprints,
        },
        { label: itemName },
      ]}
      isLoading={isLoading}
      skeleton={<DetailPageSkeleton />}
      error={error || undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {data && bp && (
        <Grid item xs={12}>
          {head && <SeoHead head={head} />}
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <GameItemAvatar
              name={itemName}
              iconUrl={outputItem?.icon_url || bp.icon_url}
              size={48}
              useCommodityColor={false}
              sx={{ bgcolor: getItemCategoryColor(bp.item_category) }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {itemName}
              </Typography>
              <BlueprintTags
                blueprint={blueprintTagsFromDetail(data)}
                size="small"
              />
            </Box>
            <IconButton
              color={data.user_owns ? "primary" : "default"}
              onClick={handleBookmarkToggle}
              title={
                data.user_owns
                  ? t("blueprintsUi.detail.removeFromOwned")
                  : t("blueprintsUi.detail.markAsOwned")
              }
            >
              {data.user_owns ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Stack>

          {/* Missions section */}
          {data.missions_rewarding?.length > 0 &&
            (() => {
              const [expanded] = [missionsExpanded, setMissionsExpanded]
              const missions = expanded
                ? data.missions_rewarding
                : data.missions_rewarding.slice(0, 8)
              return (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    <TrackChangesRounded sx={{ fontSize: 16, mr: 0.5 }} />
                    {t("blueprintsUi.detail.missionsCount", {
                      count: data.missions_rewarding.length,
                    })}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {missions.map((m: MissionRewardingBlueprint) => (
                      <Chip
                        key={m.mission_id}
                        label={m.mission_name}
                        size="small"
                        sx={{ height: 22, cursor: "pointer" }}
                        onClick={() =>
                          navigate(GAME_DATA_PATHS.mission(m.mission_id))
                        }
                      />
                    ))}
                    {data.missions_rewarding.length > 8 && (
                      <Chip
                        label={
                          expanded
                            ? t("blueprintsUi.detail.showLess")
                            : t("blueprintsUi.moreCount", {
                                count: data.missions_rewarding.length - 8,
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
            })()}

          {!data.missions_rewarding?.length && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("blueprintsUi.detail.noMissionSources")}
            </Typography>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* Product Stats — base vs crafted */}
          {Object.keys(itemAttrs).length > 0 && combinedModifiers.size > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("blueprintsUi.detail.productStats")}
              </Typography>
              {Array.from(combinedModifiers.entries()).map(
                ([prop, modifier]) => {
                  const baseKey = Object.keys(itemAttrs).find((k) =>
                    k
                      .toLowerCase()
                      .includes(prop.replace(/^gpp_armor_/, "").toLowerCase()),
                  )
                  const baseVal = baseKey
                    ? parseFloat(itemAttrs[baseKey])
                    : null
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
                      <Typography variant="caption">
                        ×{baseVal.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
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
                },
              )}
            </Box>
          )}

          {/* Tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label={t("blueprintsUi.detail.craft")} />
            <Tab label={t("blueprintsUi.detail.disassemble")} />
            {spectrumId && <Tab label={t("blueprintsUi.detail.orgOwners")} />}
          </Tabs>

          {tab === 0 && (
            <>
              {/* Craft quantity + Quality Presets on same row */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("blueprintsUi.detail.quantity")}
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={craftQty}
                    sx={{ width: 60, display: "block" }}
                    onChange={(e) =>
                      setCraftQty(Math.max(1, +e.target.value || 1))
                    }
                    inputProps={{ min: 1 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("blueprintsUi.detail.qualityPresets")}
                  </Typography>
                  <ButtonGroup
                    size="small"
                    variant="outlined"
                    sx={{ display: "block" }}
                  >
                    <Button onClick={() => setAllQualities("min")}>
                      {t("blueprintsUi.detail.presetMin")}
                    </Button>
                    <Button onClick={() => setAllQualities("mid")}>
                      {t("blueprintsUi.detail.presetBase")}
                    </Button>
                    <Button onClick={() => setAllQualities("max")}>
                      {t("blueprintsUi.detail.presetMax")}
                    </Button>
                  </ButtonGroup>
                </Box>
                <Box sx={{ flex: 1 }} />
                <Chip
                  label={t("blueprintsUi.detail.outputQuality", {
                    quality: outputQuality,
                  })}
                  color={
                    outputQuality >= 800
                      ? "success"
                      : outputQuality >= 400
                        ? "primary"
                        : "default"
                  }
                  size="small"
                />
              </Stack>

              {/* Ingredients with inline sliders */}
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                <BuildRounded sx={{ fontSize: 16, mr: 0.5 }} />
                {t("blueprintsUi.detail.craft")}
              </Typography>

              {/* Scaling attributes summary */}
              {combinedModifiers.size > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1 }}
                >
                  {Array.from(combinedModifiers.entries()).map(
                    ([prop, modifier]) => {
                      const pct = (modifier - 1) * 100
                      return (
                        <Chip
                          key={prop}
                          size="small"
                          label={`${propertyLabel(prop, t)}: ×${modifier.toFixed(3)} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`}
                          color={
                            isModifierPositive(prop, modifier)
                              ? "success"
                              : modifier === 1
                                ? "default"
                                : "error"
                          }
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.7rem" }}
                        />
                      )
                    },
                  )}
                </Stack>
              )}
              <Stack spacing={1} sx={{ mb: 1 }}>
                {ingredients.map((ing: BlueprintIngredient, idx: number) => {
                  const qv =
                    qualities[idx] ??
                    Math.round(
                      (qualityRanges[idx]?.min + qualityRanges[idx]?.max) / 2,
                    )
                  const qr = qualityRanges[idx] || { min: 0, max: 1000 }
                  const color =
                    getCommodityColor(ing.game_item?.sub_type) || grey[700]
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
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            lineHeight={1.2}
                          >
                            {ing.game_item?.name ||
                              t("blueprintsUi.detail.unknown")}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            lineHeight={1}
                          >
                            {formatQty(
                              parseFloat(String(ing.quantity_required)) *
                                craftQty,
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
                          onChange={(e) =>
                            setQuality(idx, +e.target.value || 0)
                          }
                          inputProps={{ min: qr.min, max: qr.max }}
                          sx={{
                            width: 70,
                            "& input": { py: 0.5, fontSize: "0.8rem" },
                          }}
                        />
                      </Stack>

                      {/* Stat effects from slot modifiers */}
                      {(
                        modsBySlot.get(ing.slot_name || ing.game_item?.name) ||
                        []
                      ).map((mod: SlotModifier, mi: number) => {
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
                            <Typography variant="caption" color="text.disabled">
                              {t("blueprintsUi.detail.factorRange", {
                                start: mod.modifier_at_start,
                                end: mod.modifier_at_end,
                              })}
                            </Typography>
                          </Stack>
                        )
                      })}
                    </Box>
                  )
                })}
              </Stack>

              {/* Craft time */}
              {bp.crafting_time_seconds && (
                <Typography variant="body2" color="text.secondary">
                  <TimerRounded
                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
                  />
                  {t("blueprintsUi.detail.craftTime", {
                    time: formatCraftingTime(bp.crafting_time_seconds),
                  })}
                </Typography>
              )}
            </>
          )}

          {/* Disassemble tab */}
          {tab === 1 &&
            (() => {
              const reclaimable = ingredients.filter(
                (ing: BlueprintIngredient) =>
                  !NON_RECLAIMABLE_RESOURCES.has(ing.game_item?.name),
              )
              const lost = ingredients.filter((ing: BlueprintIngredient) =>
                NON_RECLAIMABLE_RESOURCES.has(ing.game_item?.name),
              )
              return (
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("blueprintsUi.detail.efficiency")}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        50%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("blueprintsUi.detail.timePerItem")}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        <TimerRounded
                          sx={{
                            fontSize: 16,
                            mr: 0.5,
                            verticalAlign: "text-bottom",
                          }}
                        />
                        {t("blueprintsUi.detail.secondsShort", { seconds: 15 })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t("blueprintsUi.detail.quantity")}
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={craftQty}
                        sx={{
                          width: 60,
                          "& input": { py: 0.5, fontSize: "0.8rem" },
                        }}
                        onChange={(e) =>
                          setCraftQty(Math.max(1, +e.target.value || 1))
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Box>
                    {craftQty > 1 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t("blueprintsUi.detail.totalTime")}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatCraftingTime(15 * craftQty)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                  <Divider />
                  <Typography variant="subtitle2">
                    {craftQty > 1
                      ? t("blueprintsUi.detail.recoveredMaterialsTimes", {
                          qty: craftQty,
                        })
                      : t("blueprintsUi.detail.recoveredMaterials")}
                  </Typography>
                  <Stack spacing={0.75}>
                    {reclaimable.map((ing: BlueprintIngredient, i: number) => {
                      const recovered =
                        parseFloat(String(ing.quantity_required)) *
                        0.5 *
                        craftQty
                      return (
                        <Stack
                          key={i}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <GameItemAvatar
                            name={ing.game_item?.name}
                            iconUrl={ing.game_item?.icon_url}
                            subType={ing.game_item?.sub_type}
                            itemType={ing.game_item?.type}
                            size={28}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {ing.game_item?.name ||
                              t("blueprintsUi.detail.unknown")}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {recovered.toFixed(2)} SCU
                          </Typography>
                        </Stack>
                      )
                    })}
                    {reclaimable.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {t("blueprintsUi.detail.noRecoverable")}
                      </Typography>
                    )}
                  </Stack>
                  {lost.length > 0 && (
                    <>
                      <Divider />
                      <Typography variant="subtitle2" color="text.secondary">
                        {t("blueprintsUi.detail.notRecovered")}
                      </Typography>
                      <Stack spacing={0.75}>
                        {lost.map((ing: BlueprintIngredient, i: number) => (
                          <Stack
                            key={i}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ opacity: 0.6 }}
                          >
                            <GameItemAvatar
                              name={ing.game_item?.name}
                              iconUrl={ing.game_item?.icon_url}
                              subType={ing.game_item?.sub_type}
                              itemType={ing.game_item?.type}
                              size={28}
                            />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {ing.game_item?.name ||
                                t("blueprintsUi.detail.unknown")}
                            </Typography>
                            <Typography variant="body2" color="error.main">
                              {t("blueprintsUi.detail.lost")}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </>
                  )}
                </Stack>
              )
            })()}

          {/* Org Owners tab */}
          {tab === 2 && spectrumId && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("blueprintsUi.detail.orgOwnersTitle")}
              </Typography>
              {orgOwners?.members.length ? (
                <Stack spacing={0.75}>
                  {orgOwners.members.map((m) => (
                    <Stack
                      key={m.user_id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(USER_PATHS.profile(m.username))}
                    >
                      <Avatar
                        src={m.avatar}
                        sx={{ width: 32, height: 32, fontSize: "0.65rem" }}
                      >
                        {m.display_name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="primary"
                        >
                          {m.display_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{m.username}
                          {m.acquisition_date &&
                            ` · ${t("blueprintsUi.detail.acquired", { date: fmt.date(m.acquisition_date) })}`}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t("blueprintsUi.detail.noOrgOwners")}
                </Typography>
              )}
            </Box>
          )}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
