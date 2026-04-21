import React, { useState, useMemo } from "react"
import {
  Grid,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Box,
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
  useCalculateQualityMutation,
  type CraftingInputMaterial,
} from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"
import { useSearchParams } from "react-router-dom"

const TIER_COLORS: Record<number, "default" | "success" | "info" | "secondary" | "warning"> = {
  1: "default", 2: "success", 3: "info", 4: "secondary", 5: "warning",
}

interface MaterialInput {
  id: number
  game_item_id: string
  game_item_name: string
  quality_tier: number
  quality_value: number
  quantity: number
}

export function CraftingCalculator() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [searchParams] = useSearchParams()
  const prefillBlueprintId = searchParams.get("blueprint_id")

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
      quality_tier: 1,
      quality_value: 500,
      quantity: 1,
    }])
    setNextId(n => n + 1)
    setMatSearch("")
  }

  const removeMaterial = (id: number) => {
    setMaterials(prev => prev.filter(m => m.id !== id))
  }

  const updateMaterial = (id: number, field: keyof MaterialInput, value: any) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  // Calculate
  const [calculateQuality, { data: result, isLoading: calculating, error }] = useCalculateQualityMutation()

  const handleCalculate = () => {
    if (!selectedBlueprint || !materials.length) return
    const input_materials: CraftingInputMaterial[] = materials.map(m => ({
      game_item_id: m.game_item_id,
      quantity: m.quantity,
      quality_tier: m.quality_tier,
      quality_value: m.quality_value,
    }))
    calculateQuality({
      calculateQualityRequest: {
        blueprint_id: selectedBlueprint.blueprint_id,
        input_materials,
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
      <Grid item xs={12} container spacing={2}>
        {/* Blueprint Selector — search by product name */}
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

        {/* Materials */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Materials</Typography>

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

            <Stack spacing={1}>
              {materials.map((mat) => (
                <Stack key={mat.id} direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 100 }} noWrap>
                    {mat.game_item_name}
                  </Typography>
                  <TextField
                    size="small" type="number" label="Qty"
                    value={mat.quantity} sx={{ width: 65 }}
                    onChange={e => updateMaterial(mat.id, "quantity", Math.max(1, +e.target.value || 1))}
                    inputProps={{ min: 1 }}
                  />
                  <FormControl size="small" sx={{ width: 80 }}>
                    <InputLabel>Tier</InputLabel>
                    <Select value={mat.quality_tier} label="Tier"
                      onChange={e => updateMaterial(mat.id, "quality_tier", e.target.value)}>
                      {[1,2,3,4,5].map(n => <MenuItem key={n} value={n}>T{n}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small" type="number" label="Quality"
                    value={mat.quality_value} sx={{ width: 90 }}
                    onChange={e => updateMaterial(mat.id, "quality_value", Math.max(0, Math.min(1000, +e.target.value || 0)))}
                    inputProps={{ min: 0, max: 1000 }}
                  />
                  <IconButton size="small" onClick={() => removeMaterial(mat.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Calculate */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleCalculate}
            disabled={calculating || !selectedBlueprint || !materials.length}
            startIcon={calculating ? <CircularProgress size={20} /> : undefined}
          >
            Calculate Output Quality
          </Button>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">Calculation failed. Check your inputs.</Alert>
          </Grid>
        )}

        {result && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Predicted Output</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={`Tier ${result.output_quality_tier}`}
                  color={TIER_COLORS[result.output_quality_tier] || "default"}
                />
                <Typography>Quality: <strong>{result.output_quality_value.toFixed(1)}</strong> / 1000</Typography>
                <Typography>Success: <strong>{result.success_probability.toFixed(1)}%</strong></Typography>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>
    </StandardPageLayout>
  )
}
