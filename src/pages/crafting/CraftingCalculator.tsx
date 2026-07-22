import React, { useState, useMemo } from "react"
import {
  Grid,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Box,
  Slider,
  Stack,
  Divider,
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useSearchBlueprintsQuery,
  useSearchItemsQuery,
  useSearchResourcesQuery,
  useCalculateQualityMutation,
  useGetInventorySummaryQuery,
  useFindCraftableBlueprintsMutation,
  type CraftingInputMaterial,
  type QualityBand,
} from "../../store/api/v2/market"
import { QualityBandSelect } from "../../components/game-data/QualityBandSelect"
import { useDebounce } from "../../hooks/useDebounce"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { GAME_DATA_PATHS } from "../../routes/paths"

const TIER_COLORS: Record<number, "default" | "success" | "info" | "secondary" | "warning"> = {
  1: "default", 2: "success", 3: "info", 4: "secondary", 5: "warning",
}

interface MaterialInput {
  id: number
  game_item_id: string
  game_item_name: string
  quality_value: number
  quantity: number
}

/**
 * Per-material quality input: shows QualityBandSelect when the resource has
 * discrete quality bands, otherwise falls back to the free-range slider.
 */
function MaterialQualityInput({
  materialName,
  value,
  onChange,
}: {
  materialName: string
  value: number
  onChange: (val: number) => void
}) {
  const { data: resourceData } = useSearchResourcesQuery(
    { text: materialName, pageSize: 5 },
    { skip: !materialName },
  )

  // Match by exact name (case-insensitive) to get quality bands
  const bands: QualityBand[] = useMemo(() => {
    if (!resourceData?.resources?.length) return []
    const match = resourceData.resources.find(
      (r) => r.resource_name.toLowerCase() === materialName.toLowerCase(),
    )
    return match?.quality_bands ?? []
  }, [resourceData, materialName])

  if (bands.length > 0) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>
          Quality
        </Typography>
        <QualityBandSelect
          bands={bands}
          value={value}
          onChange={(val) => onChange(val ?? 500)}
          label="Quality"
          allowAny={false}
          size="small"
          fullWidth
        />
      </Stack>
    )
  }

  // Fallback: free-range slider for materials without quality bands
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>
        Quality
      </Typography>
      <Slider
        value={value}
        onChange={(_, val) => onChange(val as number)}
        min={0} max={1000} step={1}
        size="small"
        sx={{ flex: 1 }}
        color={value >= 600 ? "success" : value >= 300 ? "primary" : "warning"}
      />
      <TextField
        size="small" type="number"
        value={value} sx={{ width: 80 }}
        onChange={e => onChange(Math.max(0, Math.min(1000, +e.target.value || 0)))}
        inputProps={{ min: 0, max: 1000 }}
      />
    </Stack>
  )
}

export function CraftingCalculator() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const prefillBlueprintId = searchParams.get("blueprint_id")
  const [mode, setMode] = useState<"craft" | "discover">(prefillBlueprintId ? "craft" : "craft")
  const { data: craftingProfile } = useGetUserProfileQuery()
  const spectrumId = craftingProfile?.contractors?.[0]?.spectrum_id

  // Blueprint search — by product name
  const [bpSearch, setBpSearch] = useState("")
  const debouncedBpSearch = useDebounce(bpSearch, 300)
  const { data: bpData, isLoading: bpLoading } = useSearchBlueprintsQuery(
    { text: debouncedBpSearch || undefined, pageSize: 20 },
    { skip: !debouncedBpSearch },
  )
  const bpOptions = useMemo(() => bpData?.blueprints ?? [], [bpData])

  const [selectedBlueprint, setSelectedBlueprint] = useState<{
    blueprint_id: string
    output_item_name: string
  } | null>(prefillBlueprintId ? { blueprint_id: prefillBlueprintId, output_item_name: "" } : null)

  // Material search
  const [matSearch, setMatSearch] = useState("")
  const debouncedMatSearch = useDebounce(matSearch, 300)
  const { data: itemData } = useSearchItemsQuery(
    { text: debouncedMatSearch, pageSize: 10 },
    { skip: debouncedMatSearch.length < 2 },
  )
  const itemOptions = useMemo(() => itemData?.items ?? [], [itemData])

  // Materials list
  const [materials, setMaterials] = useState<MaterialInput[]>([])
  const [nextId, setNextId] = useState(1)

  const addMaterial = (itemId: string, itemName: string) => {
    setMaterials(prev => [...prev, {
      id: nextId,
      game_item_id: itemId,
      game_item_name: itemName,
      quality_value: 500,
      quantity: 1,
    }])
    setNextId(n => n + 1)
    setMatSearch("")
  }

  const removeMaterial = (id: number) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

  // Inventory import
  const { data: inventoryData } = useGetInventorySummaryQuery(
    { spectrumId: spectrumId || undefined },
    { skip: false },
  )

  const importFromInventory = () => {
    if (!inventoryData?.materials?.length) return
    const imported: MaterialInput[] = inventoryData.materials.map((m, i) => ({
      id: nextId + i,
      game_item_id: m.game_item_id,
      game_item_name: m.game_item_name,
      quality_value: m.avg_quality_value ?? 500,
      quantity: m.total_quantity,
    }))
    setMaterials(imported)
    setNextId(n => n + imported.length)
  }

  // "What Can I Craft?" discovery
  const [findCraftable, { data: craftableResults, isLoading: discovering }] = useFindCraftableBlueprintsMutation()
  const [ownedOnly, setOwnedOnly] = useState(false)

  const updateMaterial = (id: number, field: keyof MaterialInput, value: string | number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  // Calculate
  const [calculateQuality, { data: result, isLoading: calculating, error }] = useCalculateQualityMutation()

  const handleCalculate = () => {
    if (!selectedBlueprint || !materials.length) return
    const input_materials: CraftingInputMaterial[] = materials.map(m => ({
      game_item_id: m.game_item_id,
      quantity: m.quantity,
      quality_value: m.quality_value,
    }))
    calculateQuality({
      calculateQualityRequest: {
        blueprint_id: selectedBlueprint.blueprint_id,
        input_materials,
      },
    })
  }

  const handleDiscover = () => {
    if (!materials.length) return
    findCraftable({
      body: {
        materials: materials.map(m => ({
          game_item_id: m.game_item_id,
          quantity_scu: m.quantity,
          quality_value: m.quality_value,
        })),
        owned_only: ownedOnly || undefined,
      },
    })
  }

  return (
    <StandardPageLayout
      title={t("crafting.calculator_title", "Crafting Calculator")}
      headerTitle={t("crafting.calculator_title", "Crafting Calculator")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
      <Grid container spacing={2}>
        {/* Mode tabs */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant={mode === "craft" ? "contained" : "outlined"} size="small" onClick={() => setMode("craft")}>
              Craft Calculator
            </Button>
            <Button variant={mode === "discover" ? "contained" : "outlined"} size="small" onClick={() => setMode("discover")}>
              What Can I Craft?
            </Button>
          </Stack>
        </Grid>

        {/* Blueprint Selector — only in craft mode */}
        {mode === "craft" && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>What do you want to craft?</Typography>
            <Autocomplete
              size="small"
              options={bpOptions}
              getOptionLabel={(o) => o.output_item_name || o.blueprint_name}
              loading={bpLoading}
              onInputChange={(_, val) => setBpSearch(val)}
              onChange={(_, val) =>
                setSelectedBlueprint(val ? { blueprint_id: val.blueprint_id, output_item_name: val.output_item_name } : null)
              }
              renderOption={(props, option) => (
                <li {...props} key={option.blueprint_id}>
                  <Box>
                    <Typography variant="body2">{option.output_item_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.rarity && `${option.rarity} · `}{option.item_category || ""}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Search by item name" placeholder="e.g. Behringer LMG" />
              )}
            />
          </Paper>
        </Grid>
        )}

        {/* Materials */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Materials</Typography>
              <Button size="small" variant="outlined" onClick={importFromInventory}
                disabled={!inventoryData?.materials?.length}>
                Import from Inventory{spectrumId ? " (+ Org)" : ""}
              </Button>
            </Stack>

            {/* Add material autocomplete */}
            <Autocomplete
              size="small"
              options={itemOptions}
              getOptionLabel={(o) => o.name}
              inputValue={matSearch}
              onInputChange={(_, val) => setMatSearch(val)}
              onChange={(_, val) => {
                if (val) addMaterial(val.id, val.name)
              }}
              value={null}
              blurOnSelect
              renderInput={(params) => (
                <TextField {...params} label="Add material" placeholder="Search resources..." />
              )}
              sx={{ mb: 2 }}
            />

            {/* Material rows */}
            {materials.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Search and add materials above
              </Typography>
            )}

            <Stack spacing={2}>
              {materials.map((mat) => {
                // Find this material's contribution from the result (if calculated)
                const contrib = result?.calculation_breakdown?.quality_contributions?.find(
                  (c) => c.material_name === mat.game_item_name
                )
                return (
                  <Paper key={mat.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {mat.game_item_name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small" type="number" label="Qty"
                          value={mat.quantity} sx={{ width: 65 }}
                          onChange={e => updateMaterial(mat.id, "quantity", Math.max(1, +e.target.value || 1))}
                          inputProps={{ min: 1 }}
                        />
                        <IconButton size="small" onClick={() => removeMaterial(mat.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Quality input — band select when available, slider fallback */}
                    <MaterialQualityInput
                      materialName={mat.game_item_name}
                      value={mat.quality_value}
                      onChange={(val) => updateMaterial(mat.id, "quality_value", val)}
                    />

                    {/* Per-material contribution (shown after calculation) */}
                    {contrib && (
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Weight: {(contrib.weight * 100).toFixed(0)}%
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          color={contrib.quality_value >= result!.output_quality_value ? "success.main" : "error.main"}
                        >
                          Contribution: {contrib.contribution.toFixed(1)}
                          {contrib.quality_value >= result!.output_quality_value ? " ↑" : " ↓"}
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                )
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Calculate */}
        <Grid item xs={12}>
          {mode === "craft" ? (
            <Button
              variant="contained"
              onClick={handleCalculate}
              disabled={calculating || !selectedBlueprint || !materials.length}
              startIcon={calculating ? <CircularProgress size={20} /> : undefined}
            >
              Calculate Output Quality
            </Button>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                onClick={handleDiscover}
                disabled={discovering || !materials.length}
                startIcon={discovering ? <CircularProgress size={20} /> : undefined}
              >
                Find Craftable Items
              </Button>
              <FormControlLabel
                control={<Checkbox size="small" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} />}
                label={<Typography variant="body2">Owned BPs only</Typography>}
                sx={{ ml: 0 }}
              />
            </Stack>
          )}
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">Calculation failed. Check your inputs.</Alert>
          </Grid>
        )}

        {result && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Estimated Output</Typography>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  label={`Tier ${result.output_quality_tier}`}
                  color={TIER_COLORS[result.output_quality_tier] || "default"}
                />
                <Typography>Quality: <strong>{result.output_quality_value.toFixed(0)}</strong> / 1000</Typography>
                {result.output_quantity > 1 && (
                  <Typography>Output: <strong>{result.output_quantity}×</strong></Typography>
                )}
                <Typography>Success: <strong>{result.success_probability.toFixed(1)}%</strong></Typography>
                {result.critical_success_chance > 0 && (
                  <Typography color="warning.main">Crit: <strong>{result.critical_success_chance.toFixed(1)}%</strong></Typography>
                )}
              </Stack>

              {/* Stats impact table — shows when backend provides stat data */}
              {/* TODO: Backend needs to return base_stats and predicted_stats per output item */}
              {/* Example structure:
                  Stat          Base    Crafted   Diff
                  Fire Rate     650 RPM 689 RPM   +6.00%
                  Damage        28      29.4      +5.00%
              */}

              {/* Per-material quality impact */}
              {result.calculation_breakdown?.quality_contributions?.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>Quality Impact by Material</Typography>
                  <Stack spacing={0.5}>
                    {result.calculation_breakdown.quality_contributions.map((c, i) => {
                      const avgQuality = result.output_quality_value
                      const delta = c.contribution - (avgQuality * c.weight)
                      const isPositive = delta >= 0
                      return (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ flex: 1, minWidth: 100 }} noWrap>
                            {c.material_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Q{c.quality_value.toFixed(0)} × {(c.weight * 100).toFixed(0)}%
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={isPositive ? "success.main" : "error.main"}
                          >
                            {isPositive ? "+" : ""}{delta.toFixed(1)}
                          </Typography>
                        </Stack>
                      )
                    })}
                  </Stack>
                </>
              )}

              {/* Cost breakdown */}
              {result.estimated_cost && result.estimated_cost.total_cost > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Typography variant="body2">
                      Materials: <strong>{result.estimated_cost.material_cost.toLocaleString()} aUEC</strong>
                    </Typography>
                    {result.estimated_cost.crafting_station_fee ? (
                      <Typography variant="body2">
                        Station fee: <strong>{result.estimated_cost.crafting_station_fee.toLocaleString()} aUEC</strong>
                      </Typography>
                    ) : null}
                    <Typography variant="body2" fontWeight="bold">
                      Total: {result.estimated_cost.total_cost.toLocaleString()} aUEC
                    </Typography>
                  </Stack>
                </>
              )}
            </Paper>
          </Grid>
        )}
        {/* Craftable Results — discover mode */}
        {mode === "discover" && craftableResults && craftableResults.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Craftable Items ({craftableResults.length})
              </Typography>
              <Stack spacing={1}>
                {craftableResults.map((bp) => (
                  <Paper key={bp.blueprint_id} variant="outlined" sx={{ p: 1.5, cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                    onClick={() => navigate(GAME_DATA_PATHS.blueprint(bp.blueprint_name))}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {bp.output_item_icon && <Box component="img" src={bp.output_item_icon} sx={{ width: 32, height: 32, objectFit: "contain" }} />}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{bp.output_item_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bp.item_category}{bp.crafting_time_seconds ? ` · ${Math.round(bp.crafting_time_seconds / 60)}m` : ""}
                        </Typography>
                      </Box>
                      <Chip label={`×${bp.max_craftable}`} size="small" color="success" sx={{ fontWeight: 700 }} />
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                      {bp.ingredients.map((ing, i) => (
                        <Chip key={i} size="small" variant="outlined"
                          label={`${ing.name}: ${ing.quantity_required.toFixed(2)} / ${ing.available_quantity.toFixed(2)}`}
                          color={ing.available_quantity >= ing.quantity_required ? "success" : "error"}
                          sx={{ height: 20, fontSize: "0.65rem" }} />
                      ))}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        )}

        {mode === "discover" && craftableResults && craftableResults.length === 0 && !discovering && (
          <Grid item xs={12}>
            <Alert severity="info">No blueprints can be crafted with these materials.</Alert>
          </Grid>
        )}

      </Grid>
      </Grid>    </StandardPageLayout>
  )
}
