import { useMemo } from "react"
import { Box, Grid, TextField, Typography, Autocomplete } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useSearchParams } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetCategoriesQuery,
  useSearchResourcesQuery,
} from "../../../store/api/v2/market"
import { QualityFilter } from "../../../components/market/v2/QualityFilter"
import { QualityBandSelect } from "../../../components/game-data/QualityBandSelect"
import { getQualityMode } from "../../../util/qualityMode"
import { useTranslation } from "react-i18next"
import { type AutoApplySearchParams } from "../hooks/useAutoApplySearchParams"
import { useStartupGateOpen } from "../../../util/startupDeferral"

/**
 * ItemTypeFilter - free-solo Autocomplete for the `item_type` filter.
 *
 * Options are the known item types (game item subcategories, grouped by
 * category). Users can also type their own value: the listings search matches
 * a broad category name (case-insensitive, partial) to all of its
 * subcategories, otherwise the exact subcategory. Picking an option / Enter
 * apply immediately; typed text is debounced like the search field.
 */
export function ItemTypeFilter({
  filters,
}: {
  filters: AutoApplySearchParams
}) {
  const { t } = useTranslation()
  // Only the dropdown's options: on the first page load they wait for the
  // startup gate (util/startupDeferral.ts) instead of competing with the
  // results request. The field itself renders the same without them.
  const startupDone = useStartupGateOpen()
  const { data: categories } = useGetCategoriesQuery(undefined, {
    skip: !startupDone,
  })

  const { options, categoryOf } = useMemo(() => {
    const categoryOf = new Map<string, string>()
    for (const c of categories ?? []) {
      if (c.subcategory && !categoryOf.has(c.subcategory)) {
        categoryOf.set(c.subcategory, c.category)
      }
    }
    // groupBy needs options ordered by group
    const options = [...categoryOf.keys()].sort((a, b) =>
      (categoryOf.get(a) ?? "").localeCompare(categoryOf.get(b) ?? ""),
    )
    return { options, categoryOf }
  }, [categories])

  const applied = filters.applied("item_type")

  return (
    <Autocomplete
      freeSolo
      options={options}
      groupBy={(option) => categoryOf.get(option) ?? ""}
      value={applied || null}
      inputValue={filters.value("item_type")}
      onInputChange={(_, value, reason) => {
        if (reason === "input") filters.setDebounced("item_type", value)
      }}
      // Picking an option, Enter (freeSolo "createOption") and the clear button
      onChange={(_, value) => filters.flush({ item_type: value ?? "" })}
      onBlur={() => filters.flush()}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          size="small"
          label={t("MarketSearchArea.itemType", "Item Type")}
        />
      )}
    />
  )
}

/**
 * QualityFilterWrapper - Wrapper component for QualityFilter with URL state management
 *
 * Switches between tier-based (1-5) and value-based (0-1000) quality filtering
 * depending on the current item_type filter.
 *
 * - Tier mode: shown for armor, weapons, clothing types — uses QualityFilter dropdowns
 * - Value mode: shown when item_type is "commodity" — uses QualityBandSelect if a
 *   game_item_id is present (so we can fetch resource-specific quality bands), or
 *   plain numeric min/max inputs otherwise
 * - None mode: hidden for item types that have no quality concept
 *
 * When no item_type is set the filter defaults to tier mode so users can still
 * filter the mixed result set by quality tier.
 */
export function QualityFilterWrapper({
  filters,
}: {
  filters: AutoApplySearchParams
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [searchParams] = useSearchParams()

  const itemType = filters.applied("item_type")
  const qualityMode = getQualityMode(itemType || undefined)

  const toNumber = (v: string) => (v ? Number(v) : null)
  const toParam = (v: number | null) => (v === null ? "" : String(v))

  // --- Tier state (quality_tier_min / quality_tier_max) ---
  const minTier = toNumber(filters.applied("quality_tier_min"))
  const maxTier = toNumber(filters.applied("quality_tier_max"))
  const handleMinTierChange = (tier: number | null) =>
    filters.setNow({ quality_tier_min: toParam(tier) })
  const handleMaxTierChange = (tier: number | null) =>
    filters.setNow({ quality_tier_max: toParam(tier) })

  // --- Value state (quality_value_min / quality_value_max) ---
  const valueMin = toNumber(filters.applied("quality_value_min"))
  const valueMax = toNumber(filters.applied("quality_value_max"))
  const handleValueMinChange = (value: number | null) =>
    filters.setNow({ quality_value_min: toParam(value) })
  const handleValueMaxChange = (value: number | null) =>
    filters.setNow({ quality_value_max: toParam(value) })

  // --- Fetch quality bands when a specific game item is selected ---
  const gameItemId = searchParams.get("game_item_id") || undefined
  // We fetch the resource by text search when we have a game_item_id and the item
  // is a commodity.  The search text comes from the main text field as a fallback.
  const text =
    searchParams.get("text") || searchParams.get("query") || undefined
  const { data: resourceData } = useSearchResourcesQuery(
    { text: text, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemId },
  )
  const qualityBands = resourceData?.resources?.[0]?.quality_bands

  // --- Commodity / value mode ---
  if (qualityMode === "value") {
    return (
      <Box>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ mb: theme.layoutSpacing?.text ?? 1 }}
        >
          {t("CreateListingV2.qualityValue")}
        </Typography>
        {qualityBands && qualityBands.length > 0 ? (
          <Grid container spacing={theme.layoutSpacing?.layout ?? 1}>
            <Grid item xs={6}>
              <QualityBandSelect
                bands={qualityBands}
                value={valueMin}
                onChange={handleValueMinChange}
                label={t("marketV2.minValue")}
                allowAny
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <QualityBandSelect
                bands={qualityBands}
                value={valueMax}
                onChange={handleValueMaxChange}
                label={t("marketV2.maxValue")}
                allowAny
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={theme.layoutSpacing?.layout ?? 1}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label={t("marketV2.minValue")}
                {...filters.bindText("quality_value_min")}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  min: 0,
                  max: 1000,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                label={t("marketV2.maxValue")}
                {...filters.bindText("quality_value_max")}
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  min: 0,
                  max: 1000,
                }}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    )
  }

  // --- No quality concept for this item type ---
  if (qualityMode === "none" && itemType) {
    return null
  }

  // --- Tier mode (default when no item type is set, or for tier-based types) ---
  return (
    <QualityFilter
      minTier={minTier}
      maxTier={maxTier}
      onMinTierChange={handleMinTierChange}
      onMaxTierChange={handleMaxTierChange}
    />
  )
}
