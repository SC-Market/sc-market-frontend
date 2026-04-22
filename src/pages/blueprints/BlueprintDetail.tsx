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
import { useGetBlueprintDetailQuery, useGetOrgBlueprintOwnersQuery } from "../../store/api/v2/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getCommodityColor } from "../../util/gameIcons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"

function formatQty(qty: number): string {
  const r = Math.round(qty * 100) / 100
  return `${(r / 100).toFixed(2)} SCU`
}

function formatTime(s: number): string {
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${s}s`
}

/** Linear interpolation of modifier value at a given quality */
function interpolateModifier(qv: number, startQ: number, endQ: number, modStart: number, modEnd: number): number {
  const t = Math.max(0, Math.min(1, (qv - startQ) / (endQ - startQ)))
  return modStart + t * (modEnd - modStart)
}

const PROPERTY_LABELS: Record<string, string> = {
  damagemitigation: "Damage Mitigation",
  gpp_armor_damagemitigation: "Damage Mitigation",
  mintemp: "Min Temp",
  gpp_armor_mintemp: "Min Temp",
  maxtemp: "Max Temp",
  gpp_armor_maxtemp: "Max Temp",
  emreduction: "EM Reduction",
  irreduction: "IR Reduction",
  durability: "Durability",
  weight: "Weight",
}

function propertyLabel(prop: string): string {
  const lower = prop.toLowerCase()
  if (PROPERTY_LABELS[lower]) return PROPERTY_LABELS[lower]
  // Strip common prefixes
  const stripped = lower.replace(/^gpp_armor_/, "").replace(/^gpp_/, "")
  if (PROPERTY_LABELS[stripped]) return PROPERTY_LABELS[stripped]
  return stripped.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, s => s.toUpperCase())
}

export function BlueprintDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: id! },
    { skip: !id },
  )
  const bp = data?.blueprint
  const outputItem = data?.output_item
  const itemName = outputItem?.name || bp?.blueprint_name || "Blueprint"
  const ingredients = data?.ingredients || []
  const slotModifiers = data?.slot_modifiers || []
  const [currentOrg] = useCurrentOrg()
  const spectrumId = currentOrg?.spectrum_id
  const [tab, setTab] = useState(0)

  const { data: orgOwners } = useGetOrgBlueprintOwnersQuery(
    { blueprintId: id!, spectrumId: spectrumId! },
    { skip: !id || !spectrumId },
  )

  // Group slot modifiers by slot_name
  const modsBySlot = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const m of slotModifiers) {
      if (!map.has(m.slot_name)) map.set(m.slot_name, [])
      map.get(m.slot_name)!.push(m)
    }
    return map
  }, [slotModifiers])

  // Quality state per ingredient
  const [qualities, setQualities] = useState<number[]>([])
  React.useEffect(() => {
    if (ingredients.length && qualities.length !== ingredients.length) {
      setQualities(ingredients.map(() => 500))
    }
  }, [ingredients.length])

  const setQuality = (idx: number, v: number) =>
    setQualities(prev => prev.map((q, i) => i === idx ? Math.max(0, Math.min(1000, v)) : q))

  const setAllQualities = (v: number) => setQualities(prev => prev.map(() => v))

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
      error={error ? "not_found" : undefined}
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
              sx={{ bgcolor: "primary.main" }}
            />
            <Box>
              <Typography variant="h5" fontWeight={700}>{itemName}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" />}
                {bp.tier && <Chip label={`Tier ${bp.tier}`} size="small" color="secondary" />}
                {bp.item_category && <Chip label={formatCategoryName(bp.item_category)} size="small" variant="outlined" />}
              </Stack>
            </Box>
          </Stack>

          {/* Missions section */}
          {data.missions_rewarding?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                🎯 Missions ({data.missions_rewarding.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {data.missions_rewarding.slice(0, 8).map((m: any) => (
                  <Chip
                    key={m.mission_id}
                    label={m.mission_name}
                    size="small"
                    sx={{ height: 22, cursor: "pointer" }}
                    onClick={() => navigate(`/missions/${m.mission_id}`)}
                  />
                ))}
                {data.missions_rewarding.length > 8 && (
                  <Chip label={`+${data.missions_rewarding.length - 8} more`} size="small" variant="outlined" sx={{ height: 22 }} />
                )}
              </Box>
            </Box>
          )}

          {!data.missions_rewarding?.length && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No known mission sources
            </Typography>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* Tabs */}
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Craft" />
            {spectrumId && <Tab label="Org Owners" />}
          </Tabs>

          {tab === 0 && (<>

          {/* Quality Presets */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Quality Presets</Typography>
            <ButtonGroup size="small" variant="outlined">
              <Button onClick={() => setAllQualities(0)}>Min</Button>
              <Button onClick={() => setAllQualities(500)}>Base 50%</Button>
              <Button onClick={() => setAllQualities(1000)}>Max</Button>
            </ButtonGroup>
            <Box sx={{ flex: 1 }} />
            <Chip
              label={`Output Quality: ${outputQuality}`}
              color={outputQuality >= 800 ? "success" : outputQuality >= 400 ? "primary" : "default"}
            />
          </Stack>

          {/* Ingredients with inline sliders */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>⚒ Craft</Typography>
          <Stack spacing={2} sx={{ mb: 2 }}>
            {ingredients.map((ing: any, idx: number) => {
              const qv = qualities[idx] ?? 500
              const color = getCommodityColor(ing.game_item?.sub_type) || "#616161"
              return (
                <Box key={idx} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                  {/* Ingredient header */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <GameItemAvatar
                      name={ing.game_item?.name}
                      iconUrl={ing.game_item?.icon_url}
                      subType={ing.game_item?.sub_type}
                      itemType={ing.game_item?.type}
                      size={28}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{ing.game_item?.name || "Unknown"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatQty(ing.quantity_required)}
                        {ing.min_quality_tier ? ` (min T${ing.min_quality_tier})` : " (min 0)"}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Quality slider + input */}
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>Quality</Typography>
                    <Slider
                      size="small"
                      min={0} max={1000} value={qv}
                      onChange={(_, v) => setQuality(idx, v as number)}
                      sx={{
                        flex: 1,
                        color,
                        "& .MuiSlider-thumb": { width: 14, height: 14 },
                      }}
                    />
                    <TextField
                      size="small" type="number" value={qv}
                      onChange={e => setQuality(idx, +e.target.value || 0)}
                      inputProps={{ min: 0, max: 1000 }}
                      sx={{ width: 75 }}
                    />
                  </Stack>

                  {/* Quality info line */}
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                    Quality: 0–1000 · Base: 500
                  </Typography>

                  {/* Stat effects from slot modifiers */}
                  {(modsBySlot.get(ing.slot_name || ing.game_item?.name) || []).map((mod: any, mi: number) => {
                    const factor = interpolateModifier(qv, mod.start_quality, mod.end_quality, mod.modifier_at_start, mod.modifier_at_end)
                    const pctChange = (factor - 1) * 100
                    return (
                      <Stack key={mi} direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>
                          {propertyLabel(mod.property)}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color={pctChange >= 0 ? "success.main" : "error.main"}>
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
              ⏱ Craft Time: {formatTime(bp.crafting_time_seconds)}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            🔧 Disassemble: 15s · Returns 50% of materials
          </Typography>

          </>)}

          {/* Org Owners tab */}
          {tab === 1 && spectrumId && (
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
