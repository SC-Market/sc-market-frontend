/**
 * BlueprintDetail — full-width page with Overview + Calculator tabs
 */

import React, { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Avatar,
  Chip,
  Stack,
  Divider,
  TextField,
  Alert,
  Grid,
  Slider,
} from "@mui/material"
import { useGetBlueprintDetailQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { formatCategoryName } from "../../util/categoryDisplay"
import { getResourceCategoryIcon, getCommodityColor } from "../../util/gameIcons"

function initials(name: string | undefined): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

function ingredientIcon(ing: any): string | undefined {
  return ing.game_item?.icon_url
    || getResourceCategoryIcon(ing.game_item?.sub_type)
    || getResourceCategoryIcon(ing.game_item?.type)
    || undefined
}

function formatQty(qty: number): string {
  const rounded = Math.round(qty * 100) / 100 // avoid FP issues
  if (rounded >= 100) return `${(rounded / 100).toFixed(2)} SCU`
  return `${rounded} cSCU`
}

const TIER_COLORS: Record<number, "default" | "warning" | "info" | "primary" | "secondary"> = {
  1: "default", 2: "warning", 3: "info", 4: "primary", 5: "secondary",
}

/** Derive tier from quality value (frontend-only calculation) */
function qualityToTier(qv: number): number {
  if (qv >= 800) return 5
  if (qv >= 600) return 4
  if (qv >= 400) return 3
  if (qv >= 200) return 2
  return 1
}

/** Simple weighted average quality calculation (frontend approximation) */
function estimateOutputQuality(materials: { quality_value: number; quantity: number }[]): number {
  if (!materials.length) return 0
  const totalQty = materials.reduce((s, m) => s + m.quantity, 0)
  if (totalQty === 0) return 0
  return materials.reduce((s, m) => s + m.quality_value * m.quantity, 0) / totalQty
}

export function BlueprintDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: id! },
    { skip: !id },
  )
  const [tab, setTab] = useState(0)
  const bp = data?.blueprint
  const outputItem = data?.output_item
  const itemName = outputItem?.name || bp?.blueprint_name || "Blueprint"

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
      maxWidth="xl"
    >
      {data && bp && (
        <Grid item xs={12}>
          {/* Header */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <Avatar
              src={outputItem?.icon_url || bp.icon_url}
              variant="rounded"
              sx={{ width: 56, height: 56, fontSize: "1.2rem", bgcolor: "primary.main" }}
              imgProps={{ style: { objectFit: "cover" } }}
            >
              {initials(itemName)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>{itemName}</Typography>
              <Stack direction="row" spacing={0.5}>
                {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" />}
                {bp.tier && <Chip label={`Tier ${bp.tier}`} size="small" color="secondary" />}
                {bp.item_category && <Chip label={formatCategoryName(bp.item_category)} size="small" variant="outlined" />}
              </Stack>
            </Box>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Calculator" disabled={!data.ingredients?.length} />
          </Tabs>

          {tab === 0 && <OverviewTab data={data} itemName={itemName} />}
          {tab === 1 && <CalculatorTab data={data} />}
        </Grid>
      )}
    </StandardPageLayout>
  )
}

function OverviewTab({ data, itemName }: { data: any; itemName: string }) {
  const bp = data.blueprint

  return (
    <Stack spacing={2}>
      {bp.blueprint_description && (
        <Typography variant="body2" color="text.secondary">{bp.blueprint_description}</Typography>
      )}

      <Box>
        <Typography variant="body2"><strong>Crafting time:</strong> {bp.crafting_time_seconds ? `${Math.floor(bp.crafting_time_seconds / 60)}m ${bp.crafting_time_seconds % 60}s` : "Unknown"}</Typography>
        <Typography variant="body2"><strong>Output:</strong> {itemName} ×{bp.output_quantity || 1}</Typography>
        {bp.crafting_station_type && (
          <Typography variant="body2"><strong>Station:</strong> {bp.crafting_station_type}</Typography>
        )}
      </Box>

      {data.ingredients?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Ingredients ({data.ingredients.length})</Typography>
          <Stack spacing={0.75}>
            {data.ingredients.map((ing: any, i: number) => (
              <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Avatar
                  src={ingredientIcon(ing)}
                  variant="rounded"
                  sx={{ width: 28, height: 28, fontSize: "0.6rem", bgcolor: getCommodityColor(ing.game_item?.sub_type) || "secondary.main", p: 0.6 }}
                  imgProps={{ style: { objectFit: "contain" } }}
                >
                  {initials(ing.game_item?.name)}
                </Avatar>
                <Typography variant="body2" sx={{ flex: 1 }}>{ing.game_item?.name || "Unknown"}</Typography>
                <Typography variant="body2" color="text.secondary">{formatQty(ing.quantity_required)}</Typography>
              </Box>
            ))}
          </Stack>
        </>
      )}

      <Divider />
      {data.missions_rewarding?.length > 0 ? (
        <>
          <Typography variant="subtitle2">Mission Sources ({data.missions_rewarding.length})</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {data.missions_rewarding.map((m: any) => (
              <Chip key={m.mission_id} label={m.mission_name} size="small" sx={{ height: 22 }} />
            ))}
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No known mission sources — may be found through loot, purchase, or other means.
        </Typography>
      )}
    </Stack>
  )
}

function CalculatorTab({ data }: { data: any }) {
  const [craftQty, setCraftQty] = useState(1)

  const [qualities, setQualities] = useState<number[]>(() =>
    (data.ingredients || []).map(() => 500)
  )

  const ingredients = data.ingredients || []

  // Live calculation
  const result = useMemo(() => {
    const mats = ingredients.map((ing: any, i: number) => ({
      quality_value: qualities[i] ?? 500,
      quantity: Math.round(ing.quantity_required * craftQty * 100) / 100,
    }))
    const avgQuality = estimateOutputQuality(mats)
    const tier = qualityToTier(avgQuality)
    return { avgQuality, tier }
  }, [qualities, craftQty, ingredients])

  return (
    <Stack spacing={2}>
      {/* Quantity to craft */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Typography variant="body2">Quantity to craft:</Typography>
        <TextField
          size="small" type="number" value={craftQty} sx={{ width: 80 }}
          onChange={e => setCraftQty(Math.max(1, +e.target.value || 1))}
          inputProps={{ min: 1 }}
        />
      </Box>

      {/* Live result */}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
        <Typography variant="subtitle2">Estimated Output:</Typography>
        <Chip label={`Tier ${result.tier}`} color={TIER_COLORS[result.tier] || "default"} size="small" />
        <Typography variant="body2">Quality: <strong>{result.avgQuality.toFixed(0)}</strong> / 1000</Typography>
      </Box>

      <Divider />

      {/* Ingredients with total quantities and quality inputs */}
      <Typography variant="subtitle2">Ingredients (×{craftQty})</Typography>
      <Stack spacing={1.5}>
        {ingredients.map((ing: any, idx: number) => {
          const totalQty = Math.round(ing.quantity_required * craftQty * 100) / 100
          const qv = qualities[idx] ?? 500
          const setQv = (v: number) => setQualities(prev => prev.map((q, i) => i === idx ? Math.max(0, Math.min(1000, v)) : q))
          return (
            <Box key={idx}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                <Avatar
                  src={ingredientIcon(ing)}
                  variant="rounded"
                  sx={{ width: 24, height: 24, fontSize: "0.55rem", bgcolor: getCommodityColor(ing.game_item?.sub_type) || "secondary.main", p: 0.5 }}
                  imgProps={{ style: { objectFit: "contain" } }}
                >
                  {initials(ing.game_item?.name)}
                </Avatar>
                <Typography variant="body2" sx={{ flex: 1 }} noWrap>{ing.game_item?.name || "Unknown"}</Typography>
                <Typography variant="body2" color="text.secondary">{formatQty(totalQty)}</Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", pl: 4 }}>
                <Slider
                  size="small" min={0} max={1000} value={qv}
                  onChange={(_, v) => setQv(v as number)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small" type="number" value={qv} sx={{ width: 80 }}
                  onChange={e => setQv(+e.target.value || 0)}
                  inputProps={{ min: 0, max: 1000 }}
                />
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Stack>
  )
}
