/**
 * BlueprintDetail — matches scmdb.net layout with inline crafting calculator
 */

import React, { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  TextField,
  Grid,
  Button,
  ButtonGroup,
  Tabs,
  Tab,
} from "@mui/material"
import {
  useGetBlueprintDetailQuery,
  useGetOrgBlueprintOwnersQuery,
  useAddBlueprintToInventoryMutation,
  useRemoveBlueprintFromInventoryMutation,
  type BlueprintIngredient,
  type SlotModifier,
} from "../../store/api/v2/market"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { getItemCategoryColor } from "../../util/gameIcons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import {
  BlueprintTags,
  blueprintTagsFromDetail,
} from "../../components/game-data/BlueprintTags"
import {
  BuildRounded,
  TimerRounded,
  BookmarkRounded,
  BookmarkBorderRounded,
} from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  propertyLabel,
  isModifierPositive,
  interpolateModifier,
} from "../../util/statDisplay"

import { formatCraftingTime } from "../../constants/crafting"
import { FRONTEND_URL } from "../../util/constants"
import { GAME_DATA_PATHS } from "../../routes/paths"
import {
  blueprintItemName,
  blueprintSeoText,
  buildBlueprintHead,
} from "../../seo/gameDataHeads"
import { SeoHead } from "../../seo/SeoHead"

import {
  BlueprintIngredientRows,
  BlueprintMissionSources,
  BlueprintProductStatsPanel,
} from "./BlueprintDetailCraft"
import {
  BlueprintDisassemblePanel,
  BlueprintOrgOwnersPanel,
} from "./BlueprintDetailTabs"

export function BlueprintDetail() {
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
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
              aria-label={
                data.user_owns
                  ? t("blueprintsUi.detail.removeFromOwned")
                  : t("blueprintsUi.detail.markAsOwned")
              }
              title={
                data.user_owns
                  ? t("blueprintsUi.detail.removeFromOwned")
                  : t("blueprintsUi.detail.markAsOwned")
              }
            >
              {data.user_owns ? <BookmarkRounded /> : <BookmarkBorderRounded />}
            </IconButton>
          </Stack>

          {/* Missions section */}
          {data.missions_rewarding?.length > 0 && (
            <BlueprintMissionSources
              missions_rewarding={data.missions_rewarding}
              missionsExpanded={missionsExpanded}
              setMissionsExpanded={setMissionsExpanded}
            />
          )}

          {!data.missions_rewarding?.length && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("blueprintsUi.detail.noMissionSources")}
            </Typography>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* Product Stats — base vs crafted */}
          {Object.keys(itemAttrs).length > 0 && combinedModifiers.size > 0 && (
            <BlueprintProductStatsPanel
              itemAttrs={itemAttrs}
              combinedModifiers={combinedModifiers}
            />
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
              <BlueprintIngredientRows
                ingredients={ingredients}
                qualities={qualities}
                qualityRanges={qualityRanges}
                setQuality={setQuality}
                modsBySlot={modsBySlot}
                craftQty={craftQty}
              />

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
          {tab === 1 && (
            <BlueprintDisassemblePanel
              ingredients={ingredients}
              craftQty={craftQty}
              setCraftQty={setCraftQty}
            />
          )}

          {/* Org Owners tab */}
          {tab === 2 && spectrumId && (
            <BlueprintOrgOwnersPanel orgOwners={orgOwners} />
          )}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
