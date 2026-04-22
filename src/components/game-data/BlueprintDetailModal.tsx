/**
 * BlueprintDetailModal - Tabbed modal for blueprint details on desktop
 * Tabs: Overview, Ingredients, Calculator
 */

import React, { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Box,
  Typography,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Divider,
} from "@mui/material"
import { Close } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetBlueprintDetailQuery,
  useGetBlueprintMissionsQuery,
  useCalculateQualityMutation,
  type CraftingInputMaterial,
} from "../../store/api/v2/market"
import { RarityBadge } from "../game-data/RarityBadge"

interface BlueprintDetailModalProps {
  blueprintId: string | null
  open: boolean
  onClose: () => void
}

const TIER_COLORS: Record<number, "default" | "success" | "info" | "primary" | "secondary" | "warning"> = {
  1: "warning", 2: "default", 3: "info", 4: "primary", 5: "secondary",
}

export function BlueprintDetailModal({ blueprintId, open, onClose }: BlueprintDetailModalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState(0)

  const { data, isLoading, error } = useGetBlueprintDetailQuery(
    { blueprintId: blueprintId! },
    { skip: !blueprintId },
  )

  // Reset tab when modal opens with new blueprint
  React.useEffect(() => { setTab(0) }, [blueprintId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" noWrap sx={{ flex: 1 }}>
          {data?.output_item?.name || data?.blueprint.blueprint_name || t("blueprints.detail", "Blueprint Detail")}
        </Typography>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
        <Tab label={t("blueprints.overview", "Overview")} />
        <Tab label={t("blueprints.ingredients", "Ingredients")} />
        <Tab label={t("crafting.calculator", "Calculator")} />
      </Tabs>
      <DialogContent sx={{ minHeight: 400 }}>
        {isLoading && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error">{t("blueprints.loadError", "Failed to load blueprint.")}</Alert>}
        {data && tab === 0 && <OverviewTab data={data} />}
        {data && tab === 1 && <IngredientsTab data={data} />}
        {data && tab === 2 && <CalculatorTab data={data} />}
      </DialogContent>
    </Dialog>
  )
}

function OverviewTab({ data }: { data: any }) {
  const { t } = useTranslation()
  const bp = data.blueprint

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
        {bp.rarity && <RarityBadge rarity={bp.rarity} />}
        {bp.tier && <Chip label={`Tier ${bp.tier}`} size="small" color={TIER_COLORS[bp.tier] || "default"} />}
        {bp.item_category && <Chip label={bp.item_category} size="small" variant="outlined" />}
        {bp.item_subcategory && <Chip label={bp.item_subcategory} size="small" variant="outlined" />}
      </Stack>

      {bp.blueprint_description && (
        <Typography variant="body2" color="text.secondary">{bp.blueprint_description}</Typography>
      )}

      <Divider />

      <Typography variant="subtitle2">{t("blueprints.outputItem", "Output Item")}</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography>{data.output_item?.name || bp.output_item_name}</Typography>
        <Chip label={`×${bp.output_quantity || 1}`} size="small" />
      </Stack>

      {bp.crafting_station_type && (
        <>
          <Typography variant="subtitle2">{t("blueprints.craftingStation", "Crafting Station")}</Typography>
          <Typography variant="body2">{bp.crafting_station_type}</Typography>
        </>
      )}

      {bp.crafting_time_seconds && (
        <>
          <Typography variant="subtitle2">{t("blueprints.craftingTime", "Crafting Time")}</Typography>
          <Typography variant="body2">
            {bp.crafting_time_seconds >= 60
              ? `${Math.floor(bp.crafting_time_seconds / 60)}m ${bp.crafting_time_seconds % 60}s`
              : `${bp.crafting_time_seconds}s`}
          </Typography>
        </>
      )}

      {data.crafting_recipe && (
        <>
          <Typography variant="subtitle2">{t("blueprints.qualityRange", "Output Quality Range")}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Tier ${data.crafting_recipe.min_output_quality_tier}`} size="small" color={TIER_COLORS[data.crafting_recipe.min_output_quality_tier]} />
            <Typography variant="body2">—</Typography>
            <Chip label={`Tier ${data.crafting_recipe.max_output_quality_tier}`} size="small" color={TIER_COLORS[data.crafting_recipe.max_output_quality_tier]} />
          </Stack>
        </>
      )}

      {data.missions_rewarding?.length > 0 && (
        <>
          <Divider />
          <Typography variant="subtitle2">{t("blueprints.rewardedBy", "Mission Sources")} ({data.missions_rewarding.length})</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {data.missions_rewarding.map((m: any) => {
              const pct = m.drop_probability >= 1 ? m.drop_probability : (m.drop_probability || 0) * 100
              return (
                <Chip
                  key={m.mission_id}
                  label={`${m.mission_name}${pct >= 100 ? "" : ` (${pct.toFixed(0)}%)`}`}
                  size="small"
                  sx={{ height: 22, cursor: "pointer" }}
                  onClick={() => { window.location.href = `/missions/${m.mission_id}` }}
                />
              )
            })}
          </Box>
        </>
      )}
    </Stack>
  )
}

function IngredientsTab({ data }: { data: any }) {
  const { t } = useTranslation()

  if (!data.ingredients?.length) {
    return <Typography color="text.secondary">{t("blueprints.noIngredients", "No ingredients listed.")}</Typography>
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("blueprints.material", "Material")}</TableCell>
            <TableCell align="right">{t("blueprints.qtyRequired", "Qty Required")}</TableCell>
            <TableCell align="right">{t("blueprints.minTier", "Min Tier")}</TableCell>
            <TableCell align="right">{t("blueprints.recTier", "Rec. Tier")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.ingredients.map((ing: any) => (
            <TableRow key={ing.ingredient_id || ing.ingredient_game_item_id}>
              <TableCell>{ing.ingredient_name || ing.ingredient_game_item_id}</TableCell>
              <TableCell align="right">{ing.quantity_required}</TableCell>
              <TableCell align="right">
                {ing.min_quality_tier ? <Chip label={`T${ing.min_quality_tier}`} size="small" color={TIER_COLORS[ing.min_quality_tier]} /> : "—"}
              </TableCell>
              <TableCell align="right">
                {ing.recommended_quality_tier ? <Chip label={`T${ing.recommended_quality_tier}`} size="small" color={TIER_COLORS[ing.recommended_quality_tier]} /> : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function CalculatorTab({ data }: { data: any }) {
  const { t } = useTranslation()
  const [calculateQuality, { data: result, isLoading, error }] = useCalculateQualityMutation()

  const [materials, setMaterials] = useState<Array<{
    game_item_id: string
    name: string
    quantity: number
    quality_tier: number
    quality_value: number
  }>>(() =>
    (data.ingredients || []).map((ing: any) => ({
      game_item_id: ing.ingredient_game_item_id,
      name: ing.ingredient_name || ing.ingredient_game_item_id,
      quantity: ing.quantity_required,
      quality_tier: ing.recommended_quality_tier || ing.min_quality_tier || 1,
      quality_value: 50,
    }))
  )

  const updateMaterial = (idx: number, field: string, value: any) => {
    setMaterials(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  const handleCalculate = () => {
    const input_materials: CraftingInputMaterial[] = materials.map(m => ({
      game_item_id: m.game_item_id,
      quantity: m.quantity,
      quality_tier: m.quality_tier,
      quality_value: m.quality_value,
    }))
    calculateQuality({ calculateQualityRequest: { blueprint_id: data.blueprint.blueprint_id, input_materials } })
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">{t("crafting.adjustMaterials", "Adjust material quality to see predicted output")}</Typography>

      {materials.map((mat, idx) => (
        <Stack key={mat.game_item_id} direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ minWidth: 120, flex: 1 }} noWrap>{mat.name}</Typography>
          <TextField
            size="small" type="number" label={t("crafting.qty", "Qty")}
            value={mat.quantity} sx={{ width: 70 }}
            onChange={e => updateMaterial(idx, "quantity", Math.max(1, +e.target.value || 1))}
          />
          <FormControl size="small" sx={{ width: 90 }}>
            <InputLabel>{t("crafting.tier", "Tier")}</InputLabel>
            <Select value={mat.quality_tier} label={t("crafting.tier", "Tier")}
              onChange={e => updateMaterial(idx, "quality_tier", e.target.value)}>
              {[1,2,3,4,5].map(n => <MenuItem key={n} value={n}>T{n}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ width: 100 }}>
            <Typography variant="caption" color="text.secondary">Q: {mat.quality_value}</Typography>
            <Slider size="small" min={0} max={100} value={mat.quality_value}
              onChange={(_, v) => updateMaterial(idx, "quality_value", v)} />
          </Box>
        </Stack>
      ))}

      <Button variant="contained" size="small" onClick={handleCalculate} disabled={isLoading || !materials.length}>
        {isLoading ? <CircularProgress size={20} /> : t("crafting.calculate", "Calculate")}
      </Button>

      {error && <Alert severity="error">{t("crafting.calcError", "Calculation failed.")}</Alert>}

      {result && (
        <>
          <Divider />
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">{t("crafting.predictedOutput", "Predicted Output")}:</Typography>
            <Chip label={`Tier ${result.output_quality_tier}`} color={TIER_COLORS[result.output_quality_tier]} />
            <Typography>Quality: {result.output_quality_value.toFixed(1)}</Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2">
              {t("crafting.successRate", "Success")}: {result.success_probability.toFixed(1)}%
            </Typography>
            <Typography variant="body2">
              {t("crafting.criticalRate", "Critical")}: {result.critical_success_chance.toFixed(1)}%
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  )
}
