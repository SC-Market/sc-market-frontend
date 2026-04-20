import React, { useState, useMemo } from "react"
import {
  Grid,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material"
import { Add, Delete } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useSearchBlueprintsQuery } from "../../store/blueprintsApi"
import {
  useCalculateQualityMutation,
  CraftingInputMaterial,
  CalculateQualityResponse,
} from "../../store/craftingApi"
import { useDebounce } from "../../hooks/useDebounce"
import { useSearchParams } from "react-router-dom"

const TIER_COLORS: Record<number, string> = {
  1: "default",
  2: "success",
  3: "info",
  4: "secondary",
  5: "warning",
}

interface MaterialInput {
  id: number
  game_item_id: string
  quality_tier: number
  quality_value: number
  quantity: number
}

export function CraftingCalculator() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [searchParams] = useSearchParams()
  const prefillBlueprintId = searchParams.get("blueprint_id")

  const [searchText, setSearchText] = useState("")
  const [selectedBlueprint, setSelectedBlueprint] = useState<{
    blueprint_id: string
    blueprint_name: string
  } | null>(prefillBlueprintId ? { blueprint_id: prefillBlueprintId, blueprint_name: "" } : null)
  const [materials, setMaterials] = useState<MaterialInput[]>([
    { id: 1, game_item_id: "", quality_tier: 1, quality_value: 50, quantity: 1 },
  ])
  const [nextId, setNextId] = useState(2)

  const debouncedSearch = useDebounce(searchText, 300)
  const { data: blueprintData, isLoading: blueprintsLoading } =
    useSearchBlueprintsQuery(
      { text: debouncedSearch || undefined, page_size: 20 },
      { skip: !debouncedSearch },
    )
  const [calculateQuality, { data: result, isLoading: calculating, error }] =
    useCalculateQualityMutation()

  const blueprintOptions = useMemo(
    () => blueprintData?.blueprints ?? [],
    [blueprintData],
  )

  const addMaterial = () => {
    setMaterials((prev) => [
      ...prev,
      { id: nextId, game_item_id: "", quality_tier: 1, quality_value: 50, quantity: 1 },
    ])
    setNextId((n) => n + 1)
  }

  const removeMaterial = (id: number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
  }

  const updateMaterial = (id: number, field: keyof MaterialInput, value: any) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    )
  }

  const handleCalculate = () => {
    if (!selectedBlueprint) return
    const input_materials: CraftingInputMaterial[] = materials.map((m) => ({
      game_item_id: m.game_item_id || `material-${m.id}`,
      quantity: m.quantity,
      quality_tier: m.quality_tier,
      quality_value: m.quality_value,
    }))
    calculateQuality({
      blueprint_id: selectedBlueprint.blueprint_id,
      input_materials,
    })
  }

  return (
    <StandardPageLayout
      title={t("crafting.calculator_title", "Crafting Calculator")}
      headerTitle={t("crafting.calculator_title", "Crafting Calculator")}
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12} container spacing={theme.layoutSpacing?.layout ?? 2}>
        {/* Blueprint Selector */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("crafting.select_blueprint", "Select Blueprint")}
            </Typography>
            <Autocomplete size="small"
              options={blueprintOptions}
              getOptionLabel={(o) => o.blueprint_name}
              loading={blueprintsLoading}
              value={
                blueprintOptions.find(
                  (o) => o.blueprint_id === selectedBlueprint?.blueprint_id,
                ) ?? null
              }
              onInputChange={(_, val) => setSearchText(val)}
              onChange={(_, val) =>
                setSelectedBlueprint(
                  val
                    ? { blueprint_id: val.blueprint_id, blueprint_name: val.blueprint_name }
                    : null,
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("crafting.blueprint", "Blueprint")}
                  placeholder={t("crafting.search_blueprints", "Search blueprints...")}
                />
              )}
            />
          </Paper>
        </Grid>

        {/* Material Inputs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">
                {t("crafting.materials", "Materials")}
              </Typography>
              <Button startIcon={<Add />} onClick={addMaterial} size="small">
                {t("crafting.add_material", "Add Material")}
              </Button>
            </Box>
            {materials.map((mat, idx) => (
              <Grid container spacing={2} key={mat.id} sx={{ mb: 1 }} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t("crafting.material_id", "Material ID")}
                    value={mat.game_item_id}
                    onChange={(e) => updateMaterial(mat.id, "game_item_id", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t("crafting.quality_tier", "Tier")}</InputLabel>
                    <Select
                      value={mat.quality_tier}
                      label={t("crafting.quality_tier", "Tier")}
                      onChange={(e) => updateMaterial(mat.id, "quality_tier", e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((tier) => (
                        <MenuItem key={tier} value={tier}>
                          {t("crafting.tier_n", `Tier ${tier}`, { n: tier })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    {t("crafting.quality_value", "Quality")}: {mat.quality_value}
                  </Typography>
                  <Slider
                    value={mat.quality_value}
                    min={0}
                    max={100}
                    onChange={(_, val) => updateMaterial(mat.id, "quality_value", val)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={t("crafting.quantity", "Qty")}
                    value={mat.quantity}
                    onChange={(e) =>
                      updateMaterial(mat.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <IconButton
                    onClick={() => removeMaterial(mat.id)}
                    disabled={materials.length <= 1}
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Paper>
        </Grid>

        {/* Calculate Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleCalculate}
            disabled={!selectedBlueprint || calculating}
            fullWidth
          >
            {calculating ? (
              <CircularProgress size={24} />
            ) : (
              t("crafting.calculate", "Calculate Quality")
            )}
          </Button>
        </Grid>

        {/* Error */}
        {error && (
          <Grid item xs={12}>
            <Alert severity="error">
              {t("crafting.calc_error", "Calculation failed. Please try again.")}
            </Alert>
          </Grid>
        )}

        {/* Results */}
        {result && <ResultsPanel result={result} />}
      </Grid>
    </StandardPageLayout>
  )
}

function ResultsPanel({ result }: { result: CalculateQualityResponse }) {
  const { t } = useTranslation()

  return (
    <>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("crafting.output_quality", "Output Quality")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              label={`Tier ${result.output_quality_tier}`}
              color={TIER_COLORS[result.output_quality_tier] as any}
            />
            <Typography variant="h5">{result.output_quality_value}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t("crafting.output_quantity", "Output Quantity")}: {result.output_quantity}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("crafting.probabilities", "Probabilities")}
          </Typography>
          <Typography>
            {t("crafting.success_probability", "Success")}: {result.success_probability.toFixed(1)}%
          </Typography>
          <Typography>
            {t("crafting.critical_success", "Critical Success")}: {result.critical_success_chance.toFixed(1)}%
          </Typography>
        </Paper>
      </Grid>

      {result.calculation_breakdown?.quality_contributions?.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("crafting.breakdown", "Calculation Breakdown")}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("crafting.material", "Material")}</TableCell>
                    <TableCell align="right">{t("crafting.quality_tier", "Tier")}</TableCell>
                    <TableCell align="right">{t("crafting.quality_value", "Quality")}</TableCell>
                    <TableCell align="right">{t("crafting.weight", "Weight")}</TableCell>
                    <TableCell align="right">{t("crafting.contribution", "Contribution")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.calculation_breakdown.quality_contributions.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>{c.material_name}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={c.quality_tier}
                          size="small"
                          color={TIER_COLORS[c.quality_tier] as any}
                        />
                      </TableCell>
                      <TableCell align="right">{c.quality_value}</TableCell>
                      <TableCell align="right">{c.weight.toFixed(2)}</TableCell>
                      <TableCell align="right">{c.contribution.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      )}
    </>
  )
}
