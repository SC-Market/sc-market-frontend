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
import { useGetBlueprintDetailQuery, useGetOrgBlueprintOwnersQuery, useAddBlueprintToInventoryMutation, useRemoveBlueprintFromInventoryMutation, type BlueprintIngredient, type SlotModifier, type MissionRewardingBlueprint } from "../../store/api/v2/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getCommodityColor, getItemCategoryColor } from "../../util/gameIcons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { TrackChangesRounded, BuildRounded, TimerRounded, RecyclingRounded, Bookmark, BookmarkBorder } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { propertyLabel, isModifierPositive, interpolateModifier } from "../../util/statDisplay"

/** Format quantity — values are in SCU, may be string from API */
function formatQty(scu: number | string): string {
  const n = typeof scu === "string" ? parseFloat(scu) : scu
  if (isNaN(n)) return "0.00 SCU"
  return `${n.toFixed(2)} SCU`
}

import { formatCraftingTime } from "../../constants/crafting"

export function BlueprintDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: slug! },
    { skip: !slug },
  )
  const bp = data?.blueprint
  const outputItem = data?.output_item
  const itemName = outputItem?.name || bp?.blueprint_name || "Blueprint"
  const ingredients = data?.ingredients || []
  const slotModifiers = data?.slot_modifiers || []
  const itemAttrs = data?.item_attributes || {}

  const [currentOrg] = useCurrentOrg()
  const spectrumId = currentOrg?.spectrum_id
  const [tab, setTab] = useState(0)
  const [missionsExpanded, setMissionsExpanded] = useState(false)

  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()
  const handleBookmarkToggle = async () => {
    if (!slug) return
    try {
      if (data?.user_owns) await removeFromInventory({ blueprintId: slug }).unwrap()
      else await addToInventory({ blueprintId: slug, body: {} }).unwrap()
    } catch { /* not logged in */ }
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
      setQualities(qualityRanges.map(r => Math.round((r.min + r.max) / 2)))
    }
  }, [ingredients.length])

  const setQuality = (idx: number, v: number) =>
    setQualities(prev => prev.map((q, i) => {
      if (i !== idx) return q
      const r = qualityRanges[i] || { min: 0, max: 1000 }
      return Math.max(r.min, Math.min(r.max, v))
    }))

  const setAllQualities = (mode: "min" | "mid" | "max") => setQualities(
    qualityRanges.map(r => mode === "min" ? r.min : mode === "max" ? r.max : Math.round((r.min + r.max) / 2))
  )

  // Compute combined modifier per property from all slots at current qualities
  const combinedModifiers = useMemo(() => {
    const result = new Map<string, number>()
    for (const mod of slotModifiers) {
      const slotIdx = ingredients.findIndex((ing: BlueprintIngredient) => (ing.slot_name || ing.game_item?.name) === mod.slot_name)
      const qv = qualities[slotIdx] ?? 500
      const factor = interpolateModifier(qv, mod.start_quality, mod.end_quality, mod.modifier_at_start, mod.modifier_at_end)
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

  return (
    <StandardPageLayout
      title={itemName}
      headerTitle={itemName}
      breadcrumbs={[
        { label: "Blueprints", href: "/blueprints" },
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
              <Typography variant="h5" fontWeight={700}>{itemName}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {data.user_owns && <Chip label="OWNED" size="small" color="success" />}
                {bp.rarity && <Chip label={bp.rarity} size="small" sx={{ bgcolor: "info.main", color: "#fff" }} />}
                {bp.tier && <Chip label={`Tier ${bp.tier}`} size="small" sx={{ bgcolor: "warning.main", color: "#fff" }} />}
                {bp.item_category && <Chip label={formatCategoryName(bp.item_category)} size="small" variant="outlined" />}
              </Stack>
            </Box>
            <IconButton
              color={data.user_owns ? "primary" : "default"}
              onClick={handleBookmarkToggle}
              title={data.user_owns ? "Remove from owned" : "Mark as owned"}
            >
              {data.user_owns ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Stack>

          {/* Missions section */}
          {data.missions_rewarding?.length > 0 && (() => {
            const [expanded, setExpanded] = [missionsExpanded, setMissionsExpanded]
            const missions = expanded ? data.missions_rewarding : data.missions_rewarding.slice(0, 8)
            return (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                <TrackChangesRounded sx={{ fontSize: 16, mr: 0.5 }} />Missions ({data.missions_rewarding.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {missions.map((m: MissionRewardingBlueprint) => (
                  <Chip
                    key={m.mission_id}
                    label={m.mission_name}
                    size="small"
                    sx={{ height: 22, cursor: "pointer" }}
                    onClick={() => navigate(`/missions/${m.mission_id}`)}
                  />
                ))}
                {data.missions_rewarding.length > 8 && (
                  <Chip
                    label={expanded ? "Show less" : `+${data.missions_rewarding.length - 8} more`}
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
              No known mission sources
            </Typography>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* Product Stats — base vs crafted */}
          {Object.keys(itemAttrs).length > 0 && combinedModifiers.size > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Product Stats</Typography>
              {Array.from(combinedModifiers.entries()).map(([prop, modifier]) => {
                const baseKey = Object.keys(itemAttrs).find(k => k.toLowerCase().includes(prop.replace(/^gpp_armor_/, "").toLowerCase()))
                const baseVal = baseKey ? parseFloat(itemAttrs[baseKey]) : null
                if (baseVal === null || isNaN(baseVal)) return null
                const modified = baseVal * modifier
                const pctChange = (modifier - 1) * 100
                return (
                  <Stack key={prop} direction="row" spacing={1} alignItems="center" sx={{ py: 0.25 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>{propertyLabel(prop)}</Typography>
                    <Typography variant="caption">×{baseVal.toFixed(2)}</Typography>
                    <Typography variant="caption" color="text.disabled">→</Typography>
                    <Typography variant="caption" fontWeight={600} color={isModifierPositive(prop, modifier) ? "success.main" : modifier === 1 ? "text.secondary" : "error.main"}>
                      ×{modified.toFixed(2)} ({pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}%)
                    </Typography>
                  </Stack>
                )
              })}
            </Box>
          )}

          {/* Tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Craft" />
            <Tab label="Disassemble" />
            {spectrumId && <Tab label="Org Owners" />}
          </Tabs>

          {tab === 0 && (<>

          {/* Craft quantity + Quality Presets on same row */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Quantity</Typography>
              <TextField size="small" type="number" value={craftQty} sx={{ width: 60, display: "block" }}
                onChange={e => setCraftQty(Math.max(1, +e.target.value || 1))} inputProps={{ min: 1 }} />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Quality Presets</Typography>
              <ButtonGroup size="small" variant="outlined" sx={{ display: "block" }}>
                <Button onClick={() => setAllQualities("min")}>Min</Button>
                <Button onClick={() => setAllQualities("mid")}>Base</Button>
                <Button onClick={() => setAllQualities("max")}>Max</Button>
              </ButtonGroup>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Chip label={`Output: ${outputQuality}`} color={outputQuality >= 800 ? "success" : outputQuality >= 400 ? "primary" : "default"} size="small" />
          </Stack>

          {/* Ingredients with inline sliders */}
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}><BuildRounded sx={{ fontSize: 16, mr: 0.5 }} />Craft</Typography>

          {/* Scaling attributes summary */}
          {combinedModifiers.size > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {Array.from(combinedModifiers.entries()).map(([prop, modifier]) => {
                const pct = (modifier - 1) * 100
                return (
                  <Chip
                    key={prop}
                    size="small"
                    label={`${propertyLabel(prop)}: ×${modifier.toFixed(3)} (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`}
                    color={isModifierPositive(prop, modifier) ? "success" : modifier === 1 ? "default" : "error"}
                    variant="outlined"
                    sx={{ height: 22, fontSize: "0.7rem" }}
                  />
                )
              })}
            </Stack>
          )}
          <Stack spacing={1} sx={{ mb: 1 }}>
            {ingredients.map((ing: BlueprintIngredient, idx: number) => {
              const qv = qualities[idx] ?? Math.round((qualityRanges[idx]?.min + qualityRanges[idx]?.max) / 2)
              const qr = qualityRanges[idx] || { min: 0, max: 1000 }
              const color = getCommodityColor(ing.game_item?.sub_type) || "#616161"
              return (
                <Box key={idx} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1 }}>
                  {/* Slot name header */}
                  {ing.slot_display_name && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.25, display: "block" }}>
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
                      <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{ing.game_item?.name || "Unknown"}</Typography>
                      <Typography variant="caption" color="text.secondary" lineHeight={1}>
                        {formatQty(parseFloat(String(ing.quantity_required)) * craftQty)}
                        {craftQty > 1 && ` (${formatQty(ing.quantity_required)} ea)`}
                        {ing.min_quality_tier ? ` · min T${ing.min_quality_tier}` : ""}
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={qr.min} max={qr.max} value={qv}
                      onChange={(_, v) => setQuality(idx, v as number)}
                      sx={{
                        flex: 1,
                        color,
                        "& .MuiSlider-thumb": { width: 12, height: 12 },
                      }}
                    />
                    <TextField
                      size="small" type="number" value={qv}
                      onChange={e => setQuality(idx, +e.target.value || 0)}
                      inputProps={{ min: qr.min, max: qr.max }}
                      sx={{ width: 70, "& input": { py: 0.5, fontSize: "0.8rem" } }}
                    />
                  </Stack>

                  {/* Stat effects from slot modifiers */}
                  {(modsBySlot.get(ing.slot_name || ing.game_item?.name) || []).map((mod: SlotModifier, mi: number) => {
                    const factor = interpolateModifier(qv, mod.start_quality, mod.end_quality, mod.modifier_at_start, mod.modifier_at_end)
                    const pctChange = (factor - 1) * 100
                    return (
                      <Stack key={mi} direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                          {propertyLabel(mod.property)}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color={isModifierPositive(mod.property, factor) ? "success.main" : factor === 1 ? "text.secondary" : "error.main"}>
                          ×{factor.toFixed(3)} {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(2)}%
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          Factor: ×{mod.modifier_at_start}–{mod.modifier_at_end}
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
              <TimerRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />Craft Time: {formatCraftingTime(bp.crafting_time_seconds)}
            </Typography>
          )}

          </>)}

          {/* Disassemble tab */}
          {tab === 1 && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">Efficiency</Typography>
                  <Typography variant="body1" fontWeight={600}>50%</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Time per item</Typography>
                  <Typography variant="body1" fontWeight={600}><TimerRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />15s</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Quantity</Typography>
                  <TextField size="small" type="number" value={craftQty} sx={{ width: 60, "& input": { py: 0.5, fontSize: "0.8rem" } }}
                    onChange={e => setCraftQty(Math.max(1, +e.target.value || 1))} inputProps={{ min: 1 }} />
                </Box>
                {craftQty > 1 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total time</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatCraftingTime(15 * craftQty)}</Typography>
                  </Box>
                )}
              </Stack>
              <Divider />
              <Typography variant="subtitle2">Recovered Materials{craftQty > 1 && ` (×${craftQty})`}</Typography>
              <Stack spacing={0.75}>
                {ingredients.map((ing: BlueprintIngredient, i: number) => {
                  const recovered = parseFloat(String(ing.quantity_required)) * 0.5 * craftQty
                  return (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <GameItemAvatar name={ing.game_item?.name} iconUrl={ing.game_item?.icon_url} subType={ing.game_item?.sub_type} itemType={ing.game_item?.type} size={28} />
                      <Typography variant="body2" sx={{ flex: 1 }}>{ing.game_item?.name || "Unknown"}</Typography>
                      <Typography variant="body2" fontWeight={600}>{recovered.toFixed(2)} SCU</Typography>
                    </Stack>
                  )
                })}
              </Stack>
            </Stack>
          )}

          {/* Org Owners tab */}
          {tab === 2 && spectrumId && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Org members who own this blueprint
              </Typography>
              {orgOwners?.members.length ? (
                <Stack spacing={0.75}>
                  {orgOwners.members.map((m) => (
                    <Stack key={m.user_id} direction="row" spacing={1} alignItems="center"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/user/${m.username}`)}
                    >
                      <Avatar src={m.avatar} sx={{ width: 32, height: 32, fontSize: "0.65rem" }}>
                        {m.display_name.slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {m.display_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{m.username}
                          {m.acquisition_date && ` · Acquired ${new Date(m.acquisition_date).toLocaleDateString()}`}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No org members have marked this blueprint as owned yet.
                </Typography>
              )}
            </Box>
          )}
        </Grid>
      )}
    </StandardPageLayout>
  )
}
