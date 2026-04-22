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
} from "@mui/material"
import { useGetBlueprintDetailQuery } from "../../store/api/v2/market"
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

function qualityToFactor(qv: number, min: number, max: number, base: number): number {
  // Linear interpolation: quality 0 → min factor, base → 1.0, 1000 → max factor
  if (qv <= base) return min + (1.0 - min) * (qv / base)
  return 1.0 + (max - 1.0) * ((qv - base) / (1000 - base))
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

          <Divider sx={{ mb: 2 }} />

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
        </Grid>
      )}
    </StandardPageLayout>
  )
}
