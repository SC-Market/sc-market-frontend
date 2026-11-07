import {
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Button,
  Autocomplete,
} from "@mui/material"
import { RestartAltRounded } from "@mui/icons-material"
import { type SearchToken } from "../../components/game-data/UnifiedSearchBar"
import { useTranslation } from "react-i18next"

/** Sidebar filters of the blueprint browser. */
export function BlueprintBrowserFilters({
  searchText,
  setSearchText,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  uniqueCategories,
  subcategoriesForCategory,
  tier,
  setTier,
  isLoggedIn,
  ownedOnly,
  setOwnedOnly,
  hasMissionSource,
  setHasMissionSource,
  hideUnsourceable,
  setHideUnsourceable,
  source,
  setSource,
  manufacturer,
  setManufacturer,
  manufacturerOptions,
  ingredientName,
  setIngredientName,
  handleResetFilters,
}: {
  searchText: string
  setSearchText: (v: string) => void
  category: string
  setCategory: (v: string) => void
  subcategory: string
  setSubcategory: (v: string) => void
  uniqueCategories: string[]
  subcategoriesForCategory: string[]
  tier: number | ""
  setTier: (v: number | "") => void
  isLoggedIn: boolean
  ownedOnly: boolean
  setOwnedOnly: (v: boolean) => void
  hasMissionSource: boolean
  setHasMissionSource: (v: boolean) => void
  hideUnsourceable: boolean
  setHideUnsourceable: (v: boolean) => void
  source: string
  setSource: (v: string) => void
  manufacturer: string
  setManufacturer: (v: string) => void
  manufacturerOptions: SearchToken[]
  ingredientName: string
  setIngredientName: (v: string) => void
  handleResetFilters: () => void
}) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1.5}>
      <TextField
        fullWidth
        size="small"
        label={t("blueprintsUi.browser.search")}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder={t("blueprintsUi.browser.searchPlaceholder")}
      />
      <FormControl fullWidth size="small">
        <InputLabel id="blueprint-browser-category-label">
          {t("blueprintsUi.browser.category")}
        </InputLabel>
        <Select
          labelId="blueprint-browser-category-label"
          value={category}
          label={t("blueprintsUi.browser.category")}
          onChange={(e) => {
            setCategory(e.target.value)
            setSubcategory("")
          }}
        >
          <MenuItem value="">{t("common.all")}</MenuItem>
          {uniqueCategories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {subcategoriesForCategory.length > 0 && (
        <FormControl fullWidth size="small">
          <InputLabel id="blueprint-browser-subcategory-label">
            {t("blueprintsUi.browser.subcategory")}
          </InputLabel>
          <Select
            labelId="blueprint-browser-subcategory-label"
            value={subcategory}
            label={t("blueprintsUi.browser.subcategory")}
            onChange={(e) => setSubcategory(e.target.value)}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            {subcategoriesForCategory.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControl fullWidth size="small">
        <InputLabel id="blueprint-browser-tier-label">
          {t("blueprintsUi.browser.tier")}
        </InputLabel>
        <Select
          labelId="blueprint-browser-tier-label"
          value={tier}
          label={t("blueprintsUi.browser.tier")}
          onChange={(e) =>
            setTier(e.target.value === "" ? "" : Number(e.target.value))
          }
        >
          <MenuItem value="">{t("common.all")}</MenuItem>
          {[1, 2, 3, 4, 5].map((n) => (
            <MenuItem key={n} value={n}>
              {t("blueprintsUi.tierN", { tier: n })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {isLoggedIn && (
        <FormControlLabel
          control={
            <Checkbox
              checked={ownedOnly}
              onChange={(e) => setOwnedOnly(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2">
              {t("blueprintsUi.browser.ownedOnly")}
            </Typography>
          }
          sx={{ ml: 0 }}
        />
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={hasMissionSource}
            onChange={(e) => setHasMissionSource(e.target.checked)}
            size="small"
          />
        }
        label={
          <Typography variant="body2">
            {t("blueprintsUi.browser.hasMissionSource")}
          </Typography>
        }
        sx={{ ml: 0 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={hideUnsourceable}
            onChange={(e) => setHideUnsourceable(e.target.checked)}
            size="small"
          />
        }
        label={
          <Typography variant="body2">
            {t("blueprintsUi.browser.hideUnsourceable")}
          </Typography>
        }
        sx={{ ml: 0 }}
      />
      <FormControl fullWidth size="small">
        <InputLabel id="blueprint-browser-source-label">
          {t("blueprintsUi.browser.source")}
        </InputLabel>
        <Select
          labelId="blueprint-browser-source-label"
          value={source}
          label={t("blueprintsUi.browser.source")}
          onChange={(e) => setSource(e.target.value)}
        >
          <MenuItem value="">{t("common.all")}</MenuItem>
          <MenuItem value="default">
            {t("blueprintsUi.browser.sourceDefault")}
          </MenuItem>
          <MenuItem value="mission_reward">
            {t("blueprintsUi.browser.sourceMissionReward")}
          </MenuItem>
        </Select>
      </FormControl>
      <Autocomplete
        fullWidth
        size="small"
        options={manufacturerOptions}
        value={
          manufacturerOptions.find((o) => o.value === manufacturer) ?? null
        }
        onChange={(_, option) => setManufacturer(option?.value ?? "")}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(o, v) => o.value === v.value}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("blueprintsUi.browser.manufacturer")}
            placeholder={t("blueprintsUi.browser.manufacturerPlaceholder")}
          />
        )}
      />
      <TextField
        fullWidth
        size="small"
        label={t("blueprintsUi.browser.ingredient")}
        value={ingredientName}
        onChange={(e) => setIngredientName(e.target.value)}
        placeholder={t("blueprintsUi.browser.ingredientPlaceholder")}
      />
      <Button
        size="small"
        startIcon={<RestartAltRounded />}
        onClick={handleResetFilters}
        sx={{ textTransform: "none" }}
      >
        {t("blueprintsUi.browser.resetFilters")}
      </Button>
    </Stack>
  )
}
