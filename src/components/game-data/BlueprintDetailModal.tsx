/**
 * BlueprintDetailModal — renders the same content as BlueprintDetail page inside a dialog.
 */

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Slider,
  TextField,
  ButtonGroup,
  Button,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material"
import { Close, BuildRounded, TimerRounded, RecyclingRounded, TrackChangesRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useGetBlueprintDetailQuery, useGetOrgBlueprintOwnersQuery } from "../../store/api/v2/market"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getCommodityColor, getItemCategoryColor } from "../../util/gameIcons"
import { GameItemAvatar } from "./GameItemAvatar"

function formatQty(scu: number): string {
  return `${scu.toFixed(2)} SCU`
}

function formatTime(s: number): string {
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${s}s`
}

function interpolateModifier(qv: number, startQ: number, endQ: number, modStart: number, modEnd: number): number {
  const t = Math.max(0, Math.min(1, (qv - startQ) / (endQ - startQ)))
  return modStart + t * (modEnd - modStart)
}

const PROPERTY_LABELS: Record<string, string> = {
  damagemitigation: "Damage Mitigation", gpp_armor_damagemitigation: "Damage Mitigation",
  mintemp: "Min Temp", gpp_armor_mintemp: "Min Temp",
  maxtemp: "Max Temp", gpp_armor_maxtemp: "Max Temp",
}

function propertyLabel(prop: string): string {
  const lower = prop.toLowerCase()
  return PROPERTY_LABELS[lower] || PROPERTY_LABELS[lower.replace(/^gpp_armor_/, "")] || lower.replace(/^gpp_armor_/, "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, s => s.toUpperCase())
}

interface Props {
  blueprintId: string | null
  open: boolean
  onClose: () => void
}

export function BlueprintDetailModal({ blueprintId, open, onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: blueprintId! },
    { skip: !blueprintId },
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

  const { data: orgOwners } = useGetOrgBlueprintOwnersQuery(
    { blueprintId: blueprintId!, spectrumId: spectrumId! },
    { skip: !blueprintId || !spectrumId },
  )

  React.useEffect(() => { setTab(0) }, [blueprintId])

  // Quality state
  const [qualities, setQualities] = useState<number[]>([])
  const [craftQty, setCraftQty] = useState(1)
  React.useEffect(() => {
    if (ingredients.length && qualities.length !== ingredients.length)
      setQualities(ingredients.map(() => 500))
  }, [ingredients.length])

  const setQuality = (idx: number, v: number) =>
    setQualities(prev => prev.map((q, i) => i === idx ? Math.max(0, Math.min(1000, v)) : q))
  const setAllQualities = (v: number) => setQualities(prev => prev.map(() => v))

  const combinedModifiers = useMemo(() => {
    const result = new Map<string, number>()
    for (const mod of slotModifiers) {
      const slotIdx = ingredients.findIndex((ing: any) => (ing.slot_name || ing.game_item?.name) === mod.slot_name)
      const qv = qualities[slotIdx] ?? 500
      const factor = interpolateModifier(qv, mod.start_quality, mod.end_quality, mod.modifier_at_start, mod.modifier_at_end)
      result.set(mod.property, (result.get(mod.property) || 1) * factor)
    }
    return result
  }, [slotModifiers, qualities, ingredients])


  const modsBySlot = useMemo(() => {
    const map = new Map<string, any[]>()
    for (const m of slotModifiers) { if (!map.has(m.slot_name)) map.set(m.slot_name, []); map.get(m.slot_name)!.push(m) }
    return map
  }, [slotModifiers])

  const outputQuality = useMemo(() => {
    if (!ingredients.length || !qualities.length) return 500
    return Math.round(ingredients.reduce((s: number, _: any, i: number) => s + (qualities[i] ?? 500), 0) / ingredients.length)
  }, [qualities, ingredients])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <GameItemAvatar name={itemName} iconUrl={outputItem?.icon_url || bp?.icon_url} size={36} useCommodityColor={false} sx={{ bgcolor: getItemCategoryColor(bp?.item_category) }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>{itemName}</Typography>
            <Stack direction="row" spacing={0.5}>
              {bp?.rarity && <Chip label={bp.rarity} size="small" color="primary" />}
              {bp?.tier && <Chip label={`Tier ${bp.tier}`} size="small" color="secondary" />}
              {bp?.item_category && <Chip label={formatCategoryName(bp.item_category)} size="small" variant="outlined" />}
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
        <Tab label="Craft" />
        <Tab label="Disassemble" />
        {spectrumId && <Tab label="Org Owners" />}
      </Tabs>

      <DialogContent sx={{ minHeight: 300 }}>
        {isLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">Failed to load blueprint.</Alert>}

        {data && tab === 0 && (
          <Stack spacing={2}>
            {/* Product Stats */}
            {Object.keys(itemAttrs).length > 0 && combinedModifiers.size > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Product Stats</Typography>
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
                      <Typography variant="caption" fontWeight={600} color={pctChange >= 0 ? "success.main" : "error.main"}>×{modified.toFixed(2)} ({pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}%)</Typography>
                    </Stack>
                  )
                })}
                <Divider sx={{ mt: 1 }} />
              </Box>
            )}

            {/* Missions */}
            {data.missions_rewarding?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  <TrackChangesRounded sx={{ fontSize: 16, mr: 0.5 }} />Missions ({data.missions_rewarding.length})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {data.missions_rewarding.slice(0, 8).map((m: any) => (
                    <Chip key={m.mission_id} label={m.mission_name} size="small" sx={{ height: 22, cursor: "pointer" }}
                      onClick={() => { onClose(); navigate(`/missions/${m.mission_id}`) }} />
                  ))}
                  {data.missions_rewarding.length > 8 && <Chip label={`+${data.missions_rewarding.length - 8}`} size="small" variant="outlined" sx={{ height: 22 }} />}
                </Box>
              </Box>
            )}

            <Divider />

            {/* Craft quantity */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">Quantity to craft:</Typography>
              <TextField size="small" type="number" value={craftQty} sx={{ width: 70 }}
                onChange={e => setCraftQty(Math.max(1, +e.target.value || 1))} inputProps={{ min: 1 }} />
            </Stack>

            {/* Quality Presets */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">Quality Presets</Typography>
              <ButtonGroup size="small" variant="outlined">
                <Button onClick={() => setAllQualities(0)}>Min</Button>
                <Button onClick={() => setAllQualities(500)}>Base</Button>
                <Button onClick={() => setAllQualities(1000)}>Max</Button>
              </ButtonGroup>
              <Box sx={{ flex: 1 }} />
              <Chip label={`Output: ${outputQuality}`} color={outputQuality >= 800 ? "success" : outputQuality >= 400 ? "primary" : "default"} size="small" />
            </Stack>

            {/* Ingredients */}
            <Typography variant="subtitle2"><BuildRounded sx={{ fontSize: 16, mr: 0.5 }} />Craft</Typography>
            {ingredients.map((ing: any, idx: number) => {
              const qv = qualities[idx] ?? 500
              const color = getCommodityColor(ing.game_item?.sub_type) || "#616161"
              return (
                <Box key={idx} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <GameItemAvatar name={ing.game_item?.name} iconUrl={ing.game_item?.icon_url} subType={ing.game_item?.sub_type} itemType={ing.game_item?.type} size={28} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{ing.game_item?.name || "Unknown"}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatQty(ing.quantity_required * craftQty)}{craftQty > 1 && ` (${formatQty(ing.quantity_required)} each)`}{ing.min_quality_tier ? ` · min T${ing.min_quality_tier}` : ""}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>Quality</Typography>
                    <Slider size="small" min={0} max={1000} value={qv} onChange={(_, v) => setQuality(idx, v as number)} sx={{ flex: 1, color, "& .MuiSlider-thumb": { width: 14, height: 14 } }} />
                    <TextField size="small" type="number" value={qv} onChange={e => setQuality(idx, +e.target.value || 0)} inputProps={{ min: 0, max: 1000 }} sx={{ width: 75 }} />
                  </Stack>
                  {(modsBySlot.get(ing.slot_name || ing.game_item?.name) || []).map((mod: any, mi: number) => {
                    const factor = interpolateModifier(qv, mod.start_quality, mod.end_quality, mod.modifier_at_start, mod.modifier_at_end)
                    const pct = (factor - 1) * 100
                    return (
                      <Stack key={mi} direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{propertyLabel(mod.property)}</Typography>
                        <Typography variant="caption" fontWeight={600} color={pct >= 0 ? "success.main" : "error.main"}>×{factor.toFixed(3)} {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</Typography>
                        <Typography variant="caption" color="text.disabled">Factor: ×{mod.modifier_at_start}–{mod.modifier_at_end}</Typography>
                      </Stack>
                    )
                  })}
                </Box>
              )
            })}

            {bp?.crafting_time_seconds && (
              <Typography variant="body2" color="text.secondary"><TimerRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />Craft Time: {formatTime(bp.crafting_time_seconds)}</Typography>
            )}
          </Stack>
        )}

        {/* Disassemble tab */}
        {data && tab === 1 && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Efficiency</Typography>
                <Typography variant="body1" fontWeight={600}>50%</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Time</Typography>
                <Typography variant="body1" fontWeight={600}><TimerRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />15s</Typography>
              </Box>
            </Stack>
            <Divider />
            <Typography variant="subtitle2">Recovered Materials</Typography>
            <Stack spacing={0.75}>
              {ingredients.map((ing: any, i: number) => {
                const recovered = ing.quantity_required * 0.5
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
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Org members who own this blueprint</Typography>
            {orgOwners?.members.length ? (
              <Stack spacing={0.75}>
                {orgOwners.members.map((m) => (
                  <Stack key={m.user_id} direction="row" spacing={1} alignItems="center" sx={{ cursor: "pointer" }} onClick={() => { onClose(); navigate(`/user/${m.username}`) }}>
                    <Avatar src={m.avatar} sx={{ width: 32, height: 32, fontSize: "0.65rem" }}>{m.display_name.slice(0, 2).toUpperCase()}</Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="primary">{m.display_name}</Typography>
                      <Typography variant="caption" color="text.secondary">@{m.username}{m.acquisition_date && ` · ${new Date(m.acquisition_date).toLocaleDateString()}`}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No org members have marked this blueprint as owned yet.</Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}
