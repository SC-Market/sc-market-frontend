import { useState, useMemo } from "react"
import {
  Grid,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Box,
  Stack,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import {
  useSearchBlueprintsQuery,
  useSearchItemsQuery,
  useCalculateQualityMutation,
  useGetInventorySummaryQuery,
  useFindCraftableBlueprintsMutation,
  type CraftingInputMaterial,
} from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"
import { useSearchParams } from "react-router-dom"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import {
  CraftableResultsList,
  CraftingResultPanel,
} from "./CraftingResultPanels"
import { MaterialInput, MaterialRow } from "./CraftingMaterialRow"

export function CraftingCalculator() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const prefillBlueprintId = searchParams.get("blueprint_id")
  const [mode, setMode] = useState<"craft" | "discover">(
    prefillBlueprintId ? "craft" : "craft",
  )
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
  } | null>(
    prefillBlueprintId
      ? { blueprint_id: prefillBlueprintId, output_item_name: "" }
      : null,
  )

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
    setMaterials((prev) => [
      ...prev,
      {
        id: nextId,
        game_item_id: itemId,
        game_item_name: itemName,
        quality_value: 500,
        quantity: 1,
      },
    ])
    setNextId((n) => n + 1)
    setMatSearch("")
  }

  const removeMaterial = (id: number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id))
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
    setNextId((n) => n + imported.length)
  }

  // "What Can I Craft?" discovery
  const [findCraftable, { data: craftableResults, isLoading: discovering }] =
    useFindCraftableBlueprintsMutation()
  const [ownedOnly, setOwnedOnly] = useState(false)

  const updateMaterial = (
    id: number,
    field: keyof MaterialInput,
    value: string | number,
  ) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    )
  }

  // Calculate
  const [calculateQuality, { data: result, isLoading: calculating, error }] =
    useCalculateQualityMutation()

  const handleCalculate = () => {
    if (!selectedBlueprint || !materials.length) return
    const input_materials: CraftingInputMaterial[] = materials.map((m) => ({
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
        materials: materials.map((m) => ({
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
              <Button
                variant={mode === "craft" ? "contained" : "outlined"}
                size="small"
                onClick={() => setMode("craft")}
              >
                {t("craftingUi.craftCalculator")}
              </Button>
              <Button
                variant={mode === "discover" ? "contained" : "outlined"}
                size="small"
                onClick={() => setMode("discover")}
              >
                {t("craftingUi.whatCanICraft")}
              </Button>
            </Stack>
          </Grid>

          {/* Blueprint Selector — only in craft mode */}
          {mode === "craft" && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("craftingUi.whatToCraft")}
                </Typography>
                <Autocomplete
                  size="small"
                  options={bpOptions}
                  getOptionLabel={(o) => o.output_item_name || o.blueprint_name}
                  loading={bpLoading}
                  onInputChange={(_, val) => setBpSearch(val)}
                  onChange={(_, val) =>
                    setSelectedBlueprint(
                      val
                        ? {
                            blueprint_id: val.blueprint_id,
                            output_item_name: val.output_item_name,
                          }
                        : null,
                    )
                  }
                  renderOption={(props, option) => (
                    <li {...props} key={option.blueprint_id}>
                      <Box>
                        <Typography variant="body2">
                          {option.output_item_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.rarity && `${option.rarity} · `}
                          {option.item_category || ""}
                        </Typography>
                      </Box>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("craftingUi.searchByItemName")}
                      placeholder={t("craftingUi.searchByItemPlaceholder")}
                    />
                  )}
                />
              </Paper>
            </Grid>
          )}

          {/* Materials */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">
                  {t("craftingUi.materials")}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={importFromInventory}
                  disabled={!inventoryData?.materials?.length}
                >
                  {spectrumId
                    ? t("craftingUi.importFromInventoryOrg")
                    : t("craftingUi.importFromInventory")}
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
                  <TextField
                    {...params}
                    label={t("craftingUi.addMaterial")}
                    placeholder={t("craftingUi.searchResources")}
                  />
                )}
                sx={{ mb: 2 }}
              />

              {/* Material rows */}
              {materials.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("craftingUi.noMaterials")}
                </Typography>
              )}

              <Stack spacing={2}>
                {materials.map((mat) => (
                  <MaterialRow
                    key={mat.id}
                    mat={mat}
                    result={result}
                    onUpdate={(field, value) =>
                      updateMaterial(mat.id, field, value)
                    }
                    onRemove={() => removeMaterial(mat.id)}
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Calculate */}
          <Grid item xs={12}>
            {mode === "craft" ? (
              <Button
                variant="contained"
                onClick={handleCalculate}
                disabled={
                  calculating || !selectedBlueprint || !materials.length
                }
                startIcon={
                  calculating ? <CircularProgress size={20} /> : undefined
                }
              >
                {t("craftingUi.calculate")}
              </Button>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="contained"
                  onClick={handleDiscover}
                  disabled={discovering || !materials.length}
                  startIcon={
                    discovering ? <CircularProgress size={20} /> : undefined
                  }
                >
                  {t("craftingUi.findCraftable")}
                </Button>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={ownedOnly}
                      onChange={(e) => setOwnedOnly(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("craftingUi.ownedOnly")}
                    </Typography>
                  }
                  sx={{ ml: 0 }}
                />
              </Stack>
            )}
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">
                {t("craftingUi.calculationFailed")}
              </Alert>
            </Grid>
          )}

          {result && <CraftingResultPanel result={result} />}
          {/* Craftable Results — discover mode */}
          {mode === "discover" &&
            craftableResults &&
            craftableResults.length > 0 && (
              <CraftableResultsList craftableResults={craftableResults} />
            )}

          {mode === "discover" &&
            craftableResults &&
            craftableResults.length === 0 &&
            !discovering && (
              <Grid item xs={12}>
                <Alert severity="info">{t("craftingUi.noCraftable")}</Alert>
              </Grid>
            )}
        </Grid>
      </Grid>{" "}
    </StandardPageLayout>
  )
}
