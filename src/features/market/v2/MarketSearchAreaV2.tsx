import { useMemo } from "react"
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Autocomplete,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useNavigate, useLocation } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
import { LanguageFilter } from "../../../components/search/LanguageFilter"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { useMarketSidebar } from "../hooks/MarketSidebar"
import SearchIcon from "@mui/icons-material/SearchRounded"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"
import { MARKET_PATHS } from "../../../routes/paths"
import { useAutoApplySearchParams } from "../hooks/useAutoApplySearchParams"
import { BUY_ORDER_SORT_FIELDS } from "./buyOrderSort"
import { ItemTypeFilter, QualityFilterWrapper } from "./MarketSearchFilters"

/** Options for the sidebar's "Sort By" select, as `<sort_by>:<sort_order>`. */
export const SORT_OPTIONS: ReadonlyArray<{
  value: string
  label: (t: TFunction) => string
}> = [
  {
    value: "price:asc",
    label: (t) => t("MarketSearchArea.sortPriceLow", "Price: Low to High"),
  },
  {
    value: "price:desc",
    label: (t) => t("MarketSearchArea.sortPriceHigh", "Price: High to Low"),
  },
  {
    value: "created_at:desc",
    label: (t) => t("MarketSearchArea.sortNewest", "Date: Newest First"),
  },
  {
    value: "created_at:asc",
    label: (t) => t("MarketSearchArea.sortOldest", "Date: Oldest First"),
  },
  {
    value: "quality:desc",
    label: (t) => t("MarketSearchArea.sortQualityHigh", "Quality: High to Low"),
  },
  {
    value: "quality:asc",
    label: (t) => t("MarketSearchArea.sortQualityLow", "Quality: Low to High"),
  },
  {
    value: "shop_rating:desc",
    label: (t) => t("MarketSearchArea.sortRatingHigh", "Rating: High to Low"),
  },
  {
    value: "shop_rating:asc",
    label: (t) => t("MarketSearchArea.sortRatingLow", "Rating: Low to High"),
  },
  {
    value: "updated_at:desc",
    label: (t) => t("MarketSearchArea.sortUpdated", "Recently Updated"),
  },
  {
    value: "quantity:desc",
    label: (t) =>
      t("MarketSearchArea.sortQuantityHigh", "Quantity: High to Low"),
  },
  {
    value: "quantity:asc",
    label: (t) =>
      t("MarketSearchArea.sortQuantityLow", "Quantity: Low to High"),
  },
]

/**
 * MarketSearchAreaV2 - V2 filter sidebar content with QualityFilter
 *
 * Filters auto-apply (no Search button): text and number inputs after the
 * user pauses typing, selects / sorting / picked options immediately. See
 * useAutoApplySearchParams for the debounce, history and no-op rules.
 */
export function MarketSearchAreaV2({
  manageMode,
}: { manageMode?: boolean } = {}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const filters = useAutoApplySearchParams()

  const viewMode = useMemo(() => {
    if (location.pathname.startsWith("/bulk")) return "bulk"
    if (location.pathname.startsWith("/buyorders")) return "buyorders"
    return "market"
  }, [location.pathname])

  const sortBy = filters.applied("sort_by")
  const sortOrder = filters.applied("sort_order")
  const languageCodes = filters
    .applied("language_codes")
    .split(",")
    .filter(Boolean)

  // Suggestions follow the applied (debounced) search text, so they load
  // together with the results instead of on every keystroke.
  const appliedText = filters.applied("text")
  const { data: suggestions } = useSearchListingsQuery(
    { text: appliedText, pageSize: 5 },
    { skip: appliedText.length < 2 },
  )
  const autocompleteOptions = useMemo(
    () => suggestions?.listings?.map((l) => l.title) ?? [],
    [suggestions],
  )

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        display: "flex",
        padding: theme.spacing(2),
        borderColor: theme.palette.outline.main,
      }}
    >
      <Grid container spacing={theme.layoutSpacing.layout}>
        {manageMode ? (
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              size="small"
              label={t("MarketSearchArea.status", "Status")}
              value={filters.applied("status")}
              onChange={(e) => filters.setNow({ status: e.target.value })}
            >
              <MenuItem value="">
                {t("MarketSearchArea.allStatuses", "All")}
              </MenuItem>
              <MenuItem value="active">
                {t("MarketSearchArea.active", "Active")}
              </MenuItem>
              <MenuItem value="inactive">
                {t("MarketSearchArea.inactive", "Inactive")}
              </MenuItem>
              <MenuItem value="cancelled">
                {t("MarketSearchArea.archived", "Archived")}
              </MenuItem>
            </TextField>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newValue) => {
                if (newValue === "market") navigate(MARKET_PATHS.search)
                else if (newValue === "buyorders")
                  navigate(MARKET_PATHS.buyOrders)
              }}
              fullWidth
              size="small"
            >
              <ToggleButton value="market">
                {t("market.listings", "Listings")}
              </ToggleButton>
              <ToggleButton value="buyorders">
                {t("market.buyOrders", "Buy Orders")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        )}

        <Grid item xs={12}>
          <Autocomplete
            freeSolo
            options={autocompleteOptions}
            value={appliedText || null}
            inputValue={filters.value("text")}
            onInputChange={(_, value, reason) => {
              if (reason === "input") filters.setDebounced("text", value)
            }}
            // Picking a suggestion, Enter (freeSolo "createOption") and the clear button
            onChange={(_, value) => filters.flush({ text: value ?? "" })}
            onBlur={() => filters.flush()}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size="small"
                label={t("MarketSearchArea.search", "Search")}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        size="small"
                        onClick={() => filters.flush()}
                        aria-label={t(
                          "market.applySearchNow",
                          "Apply search now",
                        )}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Sorting */}
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.sorting", "Sorting")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            size="small"
            label={t("MarketSearchArea.sort", "Sort By")}
            value={sortBy ? `${sortBy}:${sortOrder || "desc"}` : ""}
            onChange={(e) => {
              const [field = "", order = ""] = e.target.value
                ? e.target.value.split(":")
                : []
              filters.setNow({ sort_by: field, sort_order: order })
            }}
          >
            <MenuItem value="">
              {t("MarketSearchArea.sortNone", "None")}
            </MenuItem>
            {SORT_OPTIONS.filter(
              // Buy orders only support some sort keys (see buyOrderSort.ts)
              (o) =>
                viewMode !== "buyorders" ||
                o.value.split(":")[0] in BUY_ORDER_SORT_FIELDS,
            ).map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label(t)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Filtering */}
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.filtering", "Filtering")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <ItemTypeFilter filters={filters} />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={t("MarketSearchArea.quantityMin", "Min Quantity")}
            {...filters.bindText("quantity_min")}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("MarketSearchArea.minCost", "Min Price")}
            {...filters.bindText("price_min")}
            size={"small"}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("MarketSearchArea.maxCost", "Max Price")}
            {...filters.bindText("price_max")}
            size={"small"}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">{`aUEC`}</InputAdornment>
              ),
              inputMode: "numeric",
            }}
          />
        </Grid>

        {/* Quality Filter - V2 specific */}
        <Grid item xs={12}>
          <QualityFilterWrapper filters={filters} />
        </Grid>

        <Grid item xs={12}>
          <LanguageFilter
            selectedLanguages={languageCodes}
            onChange={(codes) =>
              filters.setNow({ language_codes: codes.join(",") })
            }
          />
        </Grid>

        {/* Pickup Method Filter */}
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("market.pickupMethod", "Pickup Method")}
            value={filters.applied("pickup_method")}
            onChange={(e) => filters.setNow({ pickup_method: e.target.value })}
          >
            <MenuItem value="">{t("market.anyPickup", "Any")}</MenuItem>
            <MenuItem value="delivery">
              {t("market.delivery", "Delivery")}
            </MenuItem>
            <MenuItem value="pickup">{t("market.pickup", "Pickup")}</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Box>
  )
}

/**
 * MarketSidebarV2 - V2 mobile sidebar with bottom sheet
 */
export function MarketSidebarV2() {
  const [open, setOpen] = useMarketSidebar()
  const { t } = useTranslation()

  return (
    <>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("market.filters", "Filters")}
        snapPoints={["half", "75", "full"]}
        defaultSnap="75"
      >
        <MarketSearchAreaV2 />
      </BottomSheet>
    </>
  )
}
