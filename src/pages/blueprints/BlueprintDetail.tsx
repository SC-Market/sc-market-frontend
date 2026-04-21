/**
 * BlueprintDetail — standalone page with Overview (includes recipe) + Calculator tabs
 */

import React, { useState } from "react"
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from "@mui/material"
import {
  useGetBlueprintDetailQuery,
  useCalculateQualityMutation,
} from "../../store/api/v2/market"
import type { CraftingInputMaterial } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { formatCategoryName } from "../../util/categoryDisplay"

function initials(name: string | undefined): string {
  if (!name) return "?"
  return name.split(/[\s_-]+/).map(w => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
}

const TIER_COLORS: Record<number, "default" | "warning" | "info" | "primary" | "secondary"> = {
  1: "default", 2: "warning", 3: "info", 4: "primary", 5: "secondary",
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
        <>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, px: 2 }}>
            <Avatar
              src={outputItem?.icon_url || bp.icon_url}
              variant="rounded"
              sx={{ width: 56, height: 56, fontSize: "1.2rem", bgcolor: "primary.main" }}
              imgProps={{ style: { objectFit: "contain" } }}
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

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Calculator" disabled={!data.ingredients?.length} />
          </Tabs>

          <Box sx={{ px: 2 }}>
            {tab === 0 && <OverviewTab data={data} itemName={itemName} />}
            {tab === 1 && <CalculatorTab data={data} />}
          </Box>
        </>
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
        <Typography variant="body2"><strong>Output:</strong> {itemName} ×{bp.output_quantity || 1}{(bp.output_quantity || 1) >= 100 ? ` (${((bp.output_quantity || 1) / 100).toFixed(2)} SCU)` : " units"}</Typography>
        {bp.crafting_station_type && (
          <Typography variant="body2"><strong>Station:</strong> {bp.crafting_station_type}</Typography>
        )}
      </Box>

      {/* Ingredients */}
      {data.ingredients?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Ingredients ({data.ingredients.length})</Typography>
          <Stack spacing={0.75}>
            {data.ingredients.map((ing: any, i: number) => (
              <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Avatar
                  src={ing.game_item?.icon_url}
                  variant="rounded"
                  sx={{ width: 28, height: 28, fontSize: "0.6rem", bgcolor: "secondary.main" }}
                  imgProps={{ style: { objectFit: "contain" } }}
                >
                  {initials(ing.game_item?.name)}
                </Avatar>
                <Typography variant="body2" sx={{ flex: 1 }}>{ing.game_item?.name || "Unknown"}</Typography>
                {ing.min_quality_tier && (
                  <Chip label={`T${ing.min_quality_tier}+`} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
                )}
                <Typography variant="body2" color="text.secondary">×{ing.quantity_required}{ing.quantity_required >= 100 ? ` (${(ing.quantity_required / 100).toFixed(2)} SCU)` : " cSCU"}</Typography>
              </Box>
            ))}
          </Stack>
        </>
      )}

      {/* Missions that reward this */}
      {data.missions_rewarding?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">Rewarded by missions ({data.missions_rewarding.length})</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {data.missions_rewarding.map((m: any) => (
              <Chip key={m.mission_id} label={m.mission_name} size="small" sx={{ height: 22 }} />
            ))}
          </Box>
        </>
      )}
    </Stack>
  )
}

function CalculatorTab({ data }: { data: any }) {
  const [calculateQuality, { data: result, isLoading, error }] = useCalculateQualityMutation()

  const [materials, setMaterials] = useState(() =>
    (data.ingredients || []).map((ing: any) => ({
      game_item_id: ing.game_item?.game_item_id || ing.ingredient_id,
      name: ing.game_item?.name || "Unknown",
      quantity: ing.quantity_required,
      quality_tier: ing.recommended_quality_tier || ing.min_quality_tier || 1,
      quality_value: 500,
    }))
  )

  const updateMaterial = (idx: number, field: string, value: any) => {
    setMaterials((prev: any[]) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const handleCalculate = () => {
    const input_materials: CraftingInputMaterial[] = materials.map((m: any) => ({
      game_item_id: m.game_item_id,
      quantity: m.quantity,
      quality_tier: m.quality_tier,
      quality_value: m.quality_value,
    }))
    calculateQuality({ calculateQualityRequest: { blueprint_id: data.blueprint.blueprint_id, input_materials } })
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Adjust material quality to predict output quality
      </Typography>

      {materials.map((mat: any, idx: number) => (
        <Stack key={mat.game_item_id} direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 100, flex: 1 }} noWrap>{mat.name}</Typography>
          <TextField
            size="small" type="number" label="Qty"
            value={mat.quantity} sx={{ width: 65 }}
            onChange={e => updateMaterial(idx, "quantity", Math.max(1, +e.target.value || 1))}
          />
          <FormControl size="small" sx={{ width: 80 }}>
            <InputLabel>Tier</InputLabel>
            <Select value={mat.quality_tier} label="Tier"
              onChange={e => updateMaterial(idx, "quality_tier", e.target.value)}>
              {[1,2,3,4,5].map(n => <MenuItem key={n} value={n}>T{n}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ width: 90 }}>
            <TextField
              size="small" type="number" label="Quality"
              value={mat.quality_value} fullWidth
              onChange={(e) => updateMaterial(idx, "quality_value", Math.max(0, Math.min(1000, +e.target.value || 0)))}
              inputProps={{ min: 0, max: 1000 }}
            />
          </Box>
        </Stack>
      ))}

      <Button variant="contained" size="small" onClick={handleCalculate} disabled={isLoading || !materials.length}>
        {isLoading ? <CircularProgress size={20} /> : "Calculate"}
      </Button>

      {error && <Alert severity="error">Calculation failed.</Alert>}

      {result && (
        <>
          <Divider />
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">Predicted Output:</Typography>
            <Chip label={`Tier ${result.output_quality_tier}`} color={TIER_COLORS[result.output_quality_tier] || "default"} />
            <Typography>Quality: {result.output_quality_value.toFixed(1)}</Typography>
          </Stack>
          <Typography variant="body2">
            Success: {result.success_probability.toFixed(1)}%
          </Typography>
        </>
      )}
    </Stack>
  )
}
