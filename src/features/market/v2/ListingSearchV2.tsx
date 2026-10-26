import React, { useMemo, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Fade,
  TextField,
  MenuItem,
  Typography,
  Autocomplete,
  InputAdornment,
  IconButton,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useIsMobile, useBreakpointDown } from "../../../hooks/layout/useBreakpoint";
import { useTheme } from "@mui/material/styles";
import { isAfter, subDays } from "date-fns";
import { useNavigate, useSearchParams, Link as RouterLink, useLocation } from "react-router-dom";
import { ExtendedTheme, cardFadeGradient } from "../../../hooks/styles/Theme";
import { FALLBACK_IMAGE_URL, FRONTEND_URL } from "../../../util/constants";
import { Helmet } from "@unhead/react/helmet";
import { SeoHead } from "../../../seo/SeoHead";
import { buildMarketSearchHead } from "../../../seo/hubHeads";
import { UnderlineLink } from "../../../components/typography/UnderlineLink";
import { MarketListingRating } from "../../../components/rating/ListingRating";
import { HideOnScroll, MarketNavArea } from "../components/MarketNavArea";
import { useGetCategoriesQuery, useSearchListingsQuery, useSearchResourcesQuery } from "../../../store/api/v2/market";
import type { ListingSearchResult, SearchListingsApiArg } from "../../../store/api/v2/market";
import { formatPriceRange } from "../../../util/formatPrice";
import { UnifiedSearchBar, marketParamsToTokens, marketTokensToParams, type SearchToken } from "../../../components/game-data/UnifiedSearchBar";
import { QualityFilter } from "../../../components/market/v2/QualityFilter";
import { QualityBandSelect } from "../../../components/game-data/QualityBandSelect";
import { getQualityMode } from "../../../util/qualityMode";
import { LanguageFilter } from "../../../components/search/LanguageFilter";
import { ListingWrapper } from "../components/listings/ListingWrapper";
import { ListingSkeleton } from "../../../components/skeletons";
import { ListingPagination } from "../components/listings/ListingPagination";
import { EmptyListings } from "../../../components/empty-states";
import { useMarketSidebarExp } from "../hooks/MarketSidebar";
import { ViewModeToggle, useViewMode } from "../../../hooks/market/useViewMode";
import { ListingTableV2 } from "./components/ListingTableV2";
import { useDrawerOpen } from "../../../hooks/layout/Drawer";
import { BottomSheet } from "../../../components/mobile/BottomSheet";
import { useMarketSidebar } from "../hooks/MarketSidebar";
import { AddShoppingCartRounded } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useTranslation } from "react-i18next";
import { useCartDrawer } from "../hooks/AddToCartContext";
import { AdCard } from "../../../components/ads/AdCard";
import type { AdConfig } from "../../../components/ads/types";
import { MARKET_ADS } from "../../../components/ads/adConfig";
import { formatMarketUrl } from "../domain/urls";
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths";
import { useFeatureFlag } from "../../../hooks/market/useFeatureFlag";
import { useAutoApplySearchParams, type AutoApplySearchParams } from "../hooks/useAutoApplySearchParams";
import { GroupedListingGrid } from "./redesign/GroupedListingGrid";

/**
 * ListingSearchV2 - Main search/browse page for V2 listings
 * 
 * Reuses V1 layout components (MarketNavArea) for visual parity.
 * Uses RTK Query hook (useSearchListingsQuery) with URL-based filter state.
 * Adds QualityFilter component for quality tier filtering.
 * Maintains identical styling to V1 (Grid spacing={1}, card heights, typography).
 */
export function ListingSearchV2() {
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const showMobileSidebar = useBreakpointDown("lg");
  const isMobile = useIsMobile();
  const marketSidebarOpen = useMarketSidebarExp();
  const [drawerOpen] = useDrawerOpen();
  const [viewMode, setViewMode] = useViewMode();
  const { flags } = useFeatureFlag();

  // Read filter state from URL params
  const [searchParams, setSearchParams] = useSearchParams();

  // Unified search bar
  const marketSearchTokens = React.useMemo(() => marketParamsToTokens(searchParams), [searchParams])
  const handleMarketTokensChange = (tokens: SearchToken[]) => {
    const tokenParams = marketTokensToParams(tokens)
    const params = new URLSearchParams(searchParams)
    for (const key of ["query", "q", "type", "has_photos", "in_stock", "bulk_discount"]) params.delete(key)
    for (const [k, v] of Object.entries(tokenParams)) params.set(k, v)
    setSearchParams(params, { replace: true })
  }
  
  // Parse URL params to API format (supports both V2 and V1 param names)
  const searchQuery = useMemo(() => {
    const text = searchParams.get("text") || searchParams.get("query") || undefined;
    const gameItemId = searchParams.get("game_item_id") || undefined;
    const qualityTierMin = searchParams.get("quality_tier_min");
    const qualityTierMax = searchParams.get("quality_tier_max");
    const qualityValueMin = searchParams.get("quality_value_min");
    const qualityValueMax = searchParams.get("quality_value_max");
    const priceMin = searchParams.get("price_min") || searchParams.get("minCost");
    const priceMax = searchParams.get("price_max") || searchParams.get("maxCost");
    const page = searchParams.get("page") || searchParams.get("index");
    const pageSize = searchParams.get("page_size");
    const sortBy = (searchParams.get("sort_by") || searchParams.get("sort")) as SearchListingsApiArg["sortBy"];
    const sortOrder = searchParams.get("sort_order") as "asc" | "desc" | undefined;
    const itemType = searchParams.get("item_type") || searchParams.get("type") || undefined;
    const quantityMin = searchParams.get("quantity_min") || searchParams.get("quantityAvailable");
    const status = (searchParams.get("status") || searchParams.get("statuses") || undefined) as "active" | "sold" | "expired" | "cancelled" | undefined;
    const shopSlug = searchParams.get("shop_slug") || searchParams.get("shop") || undefined;

    return {
      text,
      gameItemId,
      qualityTierMin: qualityTierMin ? Number(qualityTierMin) : undefined,
      qualityTierMax: qualityTierMax ? Number(qualityTierMax) : undefined,
      qualityValueMin: qualityValueMin ? Number(qualityValueMin) : undefined,
      qualityValueMax: qualityValueMax ? Number(qualityValueMax) : undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : (isMobile ? 12 : 48),
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      itemType,
      quantityMin: quantityMin ? Number(quantityMin) : 1,
      status,
      languageCodes: searchParams.get('language_codes') || undefined,
      pickupMethod: (searchParams.get('pickup_method') || undefined) as "delivery" | "pickup" | "any" | undefined,
      shopSlug,
      inStock: searchParams.get('in_stock') === 'true' ? true : undefined,
      hasPhotos: searchParams.get('has_photos') === 'true' ? true : undefined,
      bulkDiscount: searchParams.get('bulk_discount') === 'true' ? true : undefined,
    };
  }, [searchParams, isMobile]);

  // Fetch listings using RTK Query
  const {
    data: results,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchListingsQuery(searchQuery);

  const { listings = [], total = 0, page: currentPage = 1, page_size: currentPageSize = 48 } = results || {};

  // Dynamic SEO head based on active filters (shared with the edge bridge)
  const seoHead = useMemo(
    () => buildMarketSearchHead({ text: searchQuery.text, itemType: searchQuery.itemType, total }, FRONTEND_URL),
    [searchQuery.text, searchQuery.itemType, total],
  )

  // Grid breakpoints - match V1 exactly
  const gridBreakpoints = useMemo(() => {
    const sidebarInLayout = !showMobileSidebar;
    const base = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 };
    if (!sidebarInLayout || drawerOpen) return base;
    return { xs: 6, sm: 4, md: 4, lg: 2.4, xl: 2, xxl: 12 / 7, xxxl: 12 / 8 };
  }, [showMobileSidebar, drawerOpen]);

  // Pagination handlers
  const ref = useRef<HTMLDivElement>(null);

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(newPage + 1)); // Convert 0-based to 1-based
      setSearchParams(params);
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }
    },
    [searchParams, setSearchParams],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams);
      params.set("page_size", event.target.value);
      params.set("page", "1"); // Reset to first page
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  return (
    <>
      <SeoHead head={seoHead} />
      <Helmet>
        {currentPage > 1 && (
          <link rel="prev" href={`${FRONTEND_URL}/market?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage - 1) })}`} />
        )}
        {currentPage * currentPageSize < total && (
          <link rel="next" href={`${FRONTEND_URL}/market?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(currentPage + 1) })}`} />
        )}
      </Helmet>
      {/* Mobile/Tablet: Use bottom sheet for filters */}
      {showMobileSidebar && <MarketSidebarV2 />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0, px: { xs: 0, sm: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={{ xs: 1, sm: theme.layoutSpacing.layout }}>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <UnifiedSearchBar tokens={marketSearchTokens} onChange={handleMarketTokensChange}
                      mode="market" placeholder="Search items, categories..." />
                  </Box>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ px: { xs: 0 } }}>
                {viewMode === "list" ? (
                  <ListingTableV2 listings={listings} />
                ) : flags.market_v2_redesign ? (
                  <GroupedListingGrid
                    listings={listings}
                    loading={isLoading || isFetching}
                    error={!!error}
                    onRetry={refetch}
                    gridBreakpoints={gridBreakpoints}
                    marketSidebarOpen={marketSidebarOpen}
                    ref={ref}
                  />
                ) : (
                  <ListingGrid
                    listings={listings}
                    loading={isLoading || isFetching}
                    error={!!error}
                    onRetry={refetch}
                    gridBreakpoints={gridBreakpoints}
                    marketSidebarOpen={marketSidebarOpen}
                    ref={ref}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <ListingPagination
                  count={total}
                  page={currentPage - 1} // Convert 1-based to 0-based
                  rowsPerPage={currentPageSize}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              {/* Desktop: Persistent sidebar */}
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  height: "fit-content",
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <MarketSearchAreaV2 />
              </Paper>

              {/* Main content area – minWidth: 0 so flex child can shrink and grid gets full width */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ mb: 1.5, display: "flex", gap: 1, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <UnifiedSearchBar
                      tokens={marketSearchTokens}
                      onChange={handleMarketTokensChange}
                      mode="market"
                      placeholder="Search items, categories, sellers..."
                    />
                  </Box>
                  <ViewModeToggle mode={viewMode} onChange={setViewMode} />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={12} sx={{ px: 0 }}>
                    {viewMode === "list" ? (
                      <ListingTableV2 listings={listings} />
                    ) : flags.market_v2_redesign ? (
                      <GroupedListingGrid
                        listings={listings}
                        loading={isLoading || isFetching}
                        error={!!error}
                        onRetry={refetch}
                        gridBreakpoints={gridBreakpoints}
                        marketSidebarOpen={marketSidebarOpen}
                        ref={ref}
                      />
                    ) : (
                      <ListingGrid
                        listings={listings}
                        loading={isLoading || isFetching}
                        error={!!error}
                        onRetry={refetch}
                        gridBreakpoints={gridBreakpoints}
                        marketSidebarOpen={marketSidebarOpen}
                        ref={ref}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Divider light />
                  </Grid>

                  <Grid item xs={12}>
                    <ListingPagination
                      count={total}
                      page={currentPage - 1} // Convert 1-based to 0-based
                      rowsPerPage={currentPageSize}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  );
}

/**
 * MarketSearchAreaV2 - V2 filter sidebar content with QualityFilter
 *
 * Filters auto-apply (no Search button): text and number inputs after the
 * user pauses typing, selects / sorting / picked options immediately. See
 * useAutoApplySearchParams for the debounce, history and no-op rules.
 */
export function MarketSearchAreaV2({ manageMode }: { manageMode?: boolean } = {}) {
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const filters = useAutoApplySearchParams();

  const viewMode = useMemo(() => {
    if (location.pathname.startsWith('/bulk')) return 'bulk';
    if (location.pathname.startsWith('/buyorders')) return 'buyorders';
    return 'market';
  }, [location.pathname]);

  const sortBy = filters.applied("sort_by");
  const sortOrder = filters.applied("sort_order");
  const languageCodes = filters.applied("language_codes").split(",").filter(Boolean);

  // Suggestions follow the applied (debounced) search text, so they load
  // together with the results instead of on every keystroke.
  const appliedText = filters.applied("text");
  const { data: suggestions } = useSearchListingsQuery(
    { text: appliedText, pageSize: 5 },
    { skip: appliedText.length < 2 }
  );
  const autocompleteOptions = useMemo(
    () => suggestions?.listings?.map(l => l.title) ?? [],
    [suggestions],
  );

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
              color="secondary"
            >
              <MenuItem value="">{t("MarketSearchArea.allStatuses", "All")}</MenuItem>
              <MenuItem value="active">{t("MarketSearchArea.active", "Active")}</MenuItem>
              <MenuItem value="inactive">{t("MarketSearchArea.inactive", "Inactive")}</MenuItem>
              <MenuItem value="cancelled">{t("MarketSearchArea.archived", "Archived")}</MenuItem>
            </TextField>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newValue) => {
                if (newValue === 'market') navigate(MARKET_PATHS.search);
                else if (newValue === 'buyorders') navigate(MARKET_PATHS.buyOrders);
              }}
              fullWidth
              size="small"
              color="secondary"
              sx={{
                "& .MuiToggleButton-root": {
                  color: "text.primary",
                  "&.Mui-selected": {
                    color: "secondary.main",
                  },
                },
              }}
            >
              <ToggleButton value="market">{t('market.listings', 'Listings')}</ToggleButton>
              <ToggleButton value="buyorders">{t('market.buyOrders', 'Buy Orders')}</ToggleButton>
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
              if (reason === "input") filters.setDebounced("text", value);
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
                color="secondary"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton size="small" onClick={() => filters.flush()}>
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
              const [field = "", order = ""] = e.target.value ? e.target.value.split(":") : [];
              filters.setNow({ sort_by: field, sort_order: order });
            }}
            color="secondary"
          >
            <MenuItem value="">{t("MarketSearchArea.sortNone", "None")}</MenuItem>
            <MenuItem value="price:asc">{t("MarketSearchArea.sortPriceLow", "Price: Low to High")}</MenuItem>
            <MenuItem value="price:desc">{t("MarketSearchArea.sortPriceHigh", "Price: High to Low")}</MenuItem>
            <MenuItem value="created_at:desc">{t("MarketSearchArea.sortNewest", "Date: Newest First")}</MenuItem>
            <MenuItem value="created_at:asc">{t("MarketSearchArea.sortOldest", "Date: Oldest First")}</MenuItem>
            <MenuItem value="quality:desc">{t("MarketSearchArea.sortQualityHigh", "Quality: High to Low")}</MenuItem>
            <MenuItem value="quality:asc">{t("MarketSearchArea.sortQualityLow", "Quality: Low to High")}</MenuItem>
            <MenuItem value="shop_rating:desc">{t("MarketSearchArea.sortRatingHigh", "Rating: High to Low")}</MenuItem>
            <MenuItem value="shop_rating:asc">{t("MarketSearchArea.sortRatingLow", "Rating: Low to High")}</MenuItem>
            <MenuItem value="updated_at:desc">{t("MarketSearchArea.sortUpdated", "Recently Updated")}</MenuItem>
            <MenuItem value="quantity:desc">{t("MarketSearchArea.sortQuantityHigh", "Quantity: High to Low")}</MenuItem>
            <MenuItem value="quantity:asc">{t("MarketSearchArea.sortQuantityLow", "Quantity: Low to High")}</MenuItem>
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
            color="secondary"
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
            color={"secondary"}
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
            color={"secondary"}
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
            onChange={(codes) => filters.setNow({ language_codes: codes.join(",") })}
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
            <MenuItem value="delivery">{t("market.delivery", "Delivery")}</MenuItem>
            <MenuItem value="pickup">{t("market.pickup", "Pickup")}</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * ItemTypeFilter - free-solo Autocomplete for the `item_type` filter.
 *
 * Options are the known item types (game item subcategories, grouped by
 * category). Users can also type their own value: the listings search matches
 * a broad category name (case-insensitive, partial) to all of its
 * subcategories, otherwise the exact subcategory. Picking an option / Enter
 * apply immediately; typed text is debounced like the search field.
 */
export function ItemTypeFilter({ filters }: { filters: AutoApplySearchParams }) {
  const { t } = useTranslation();
  const { data: categories } = useGetCategoriesQuery();

  const { options, categoryOf } = useMemo(() => {
    const categoryOf = new Map<string, string>();
    for (const c of categories ?? []) {
      if (c.subcategory && !categoryOf.has(c.subcategory)) {
        categoryOf.set(c.subcategory, c.category);
      }
    }
    // groupBy needs options ordered by group
    const options = [...categoryOf.keys()].sort((a, b) =>
      (categoryOf.get(a) ?? "").localeCompare(categoryOf.get(b) ?? ""),
    );
    return { options, categoryOf };
  }, [categories]);

  const applied = filters.applied("item_type");

  return (
    <Autocomplete
      freeSolo
      options={options}
      groupBy={(option) => categoryOf.get(option) ?? ""}
      value={applied || null}
      inputValue={filters.value("item_type")}
      onInputChange={(_, value, reason) => {
        if (reason === "input") filters.setDebounced("item_type", value);
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
          color="secondary"
        />
      )}
    />
  );
}

/**
 * MarketSidebarV2 - V2 mobile sidebar with bottom sheet
 */
export function MarketSidebarV2() {
  const [open, setOpen] = useMarketSidebar();
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();

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
  );
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
function QualityFilterWrapper({ filters }: { filters: AutoApplySearchParams }) {
  const theme = useTheme<ExtendedTheme>();
  const [searchParams] = useSearchParams();

  const itemType = filters.applied("item_type");
  const qualityMode = getQualityMode(itemType || undefined);

  const toNumber = (v: string) => (v ? Number(v) : null);
  const toParam = (v: number | null) => (v === null ? "" : String(v));

  // --- Tier state (quality_tier_min / quality_tier_max) ---
  const minTier = toNumber(filters.applied("quality_tier_min"));
  const maxTier = toNumber(filters.applied("quality_tier_max"));
  const handleMinTierChange = (tier: number | null) =>
    filters.setNow({ quality_tier_min: toParam(tier) });
  const handleMaxTierChange = (tier: number | null) =>
    filters.setNow({ quality_tier_max: toParam(tier) });

  // --- Value state (quality_value_min / quality_value_max) ---
  const valueMin = toNumber(filters.applied("quality_value_min"));
  const valueMax = toNumber(filters.applied("quality_value_max"));
  const handleValueMinChange = (value: number | null) =>
    filters.setNow({ quality_value_min: toParam(value) });
  const handleValueMaxChange = (value: number | null) =>
    filters.setNow({ quality_value_max: toParam(value) });

  // --- Fetch quality bands when a specific game item is selected ---
  const gameItemId = searchParams.get("game_item_id") || undefined;
  // We fetch the resource by text search when we have a game_item_id and the item
  // is a commodity.  The search text comes from the main text field as a fallback.
  const text = searchParams.get("text") || searchParams.get("query") || undefined;
  const { data: resourceData } = useSearchResourcesQuery(
    { text: text, pageSize: 1 },
    { skip: qualityMode !== "value" || !gameItemId },
  );
  const qualityBands = resourceData?.resources?.[0]?.quality_bands;

  // --- Commodity / value mode ---
  if (qualityMode === "value") {
    return (
      <Box>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{ mb: theme.layoutSpacing?.text ?? 1 }}
        >
          Quality Value
        </Typography>
        {qualityBands && qualityBands.length > 0 ? (
          <Grid container spacing={theme.layoutSpacing?.layout ?? 1}>
            <Grid item xs={6}>
              <QualityBandSelect
                bands={qualityBands}
                value={valueMin}
                onChange={handleValueMinChange}
                label="Min Value"
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
                label="Max Value"
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
                color="secondary"
                label="Min Value"
                {...filters.bindText("quality_value_min")}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 1000 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                size="small"
                color="secondary"
                label="Max Value"
                {...filters.bindText("quality_value_max")}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 1000 }}
              />
            </Grid>
          </Grid>
        )}
      </Box>
    );
  }

  // --- No quality concept for this item type ---
  if (qualityMode === "none" && itemType) {
    return null;
  }

  // --- Tier mode (default when no item type is set, or for tier-based types) ---
  return (
    <QualityFilter
      minTier={minTier}
      maxTier={maxTier}
      onMinTierChange={handleMinTierChange}
      onMaxTierChange={handleMaxTierChange}
    />
  );
}

/**
 * ListingGrid - Grid display for V2 listings with loading and empty states
 */
export interface ListingGridProps {
  listings: ListingSearchResult[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  gridBreakpoints: Record<string, number>;
  marketSidebarOpen: boolean;
}

type ListingOrAd = ListingSearchResult | { _isAd: true; ad: AdConfig };

const ListingGrid = React.forwardRef<HTMLDivElement, ListingGridProps>(
  ({ listings, loading, error, onRetry, gridBreakpoints, marketSidebarOpen }, ref) => {
    const listingsWithAds = useMemo((): ListingOrAd[] => {
      if (!listings.length || listings.length < 10) return listings;
      const ads = MARKET_ADS || [];
      if (ads.length === 0) return listings;
      const result: ListingOrAd[] = [...listings];
      const adFrequency = 24;
      let adIndex = 0;
      for (let i = 12; i < result.length; i += adFrequency + 1) {
        result.splice(i, 0, { _isAd: true, ad: ads[adIndex % ads.length] });
        adIndex++;
      }
      return result;
    }, [listings]);

    if (loading) {
      return (
        <Grid container spacing={1}>
          {new Array(16).fill(undefined).map((_, i) => (
            <Grid item {...gridBreakpoints} key={i}>
              <ListingSkeleton index={i} sidebarOpen={marketSidebarOpen} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (listings.length === 0) {
      return (
        <Grid item xs={12}>
          <EmptyListings
            isSearchResult={true}
            isError={error}
            onRetry={onRetry}
            showCreateAction={false}
          />
        </Grid>
      );
    }

    return (
      <>
        <div ref={ref} style={{ position: "absolute", top: 0 }} />
        <Grid container spacing={1}>
          {listingsWithAds.map((item, index) => (
            <Grid item {...gridBreakpoints} key={'_isAd' in item ? `ad-${index}` : item.listing_id}>
              {'_isAd' in item
                ? <AdCard ad={item.ad} index={index} />
                : <ListingCardV2 listing={item} index={index} />
              }
            </Grid>
          ))}
        </Grid>
      </>
    );
  }
);

ListingGrid.displayName = "ListingGrid";

/**
 * ListingCardV2 - V2 listing card using native V2 ListingSearchResult fields.
 * 
 * Does NOT transform to V1 types. Uses CardContent with V1-matching typography
 * (h6 for price, body2 for title, caption for seller) and quality tier badges.
 */
interface ListingCardV2Props {
  listing: ListingSearchResult;
  index: number;
}

/** Quality tier color: 1=grey, 2=green, 3=blue, 4=purple, 5=gold */
function qualityColor(tier: number): string {
  switch (tier) {
    case 1: return "#757575"
    case 2: return "#4caf50"
    case 3: return "#2196f3"
    case 4: return "#9c27b0"
    case 5: return "#ff9800"
    default: return "#757575"
  }
}

/** Quality value (0-1000) to color */
function qualityValueColor(value: number): string {
  if (value >= 800) return "#ff9800"  // gold
  if (value >= 600) return "#9c27b0"  // purple
  if (value >= 400) return "#2196f3"  // blue
  if (value >= 200) return "#4caf50"  // green
  return "#757575"                     // grey
}

/** Format quality display — prefers value (0-1000) over tier (1-5) */
function qualityChipProps(listing: ListingSearchResult): { label: string; color: string } | null {
  if (listing.quality_value_min != null) {
    const min = listing.quality_value_min
    const max = listing.quality_value_max ?? min
    const label = min === max ? `${min}` : `${min}–${max}`
    return { label, color: qualityValueColor(max) }
  }
  if (listing.quality_tier_min != null) {
    const min = listing.quality_tier_min
    const max = listing.quality_tier_max ?? min
    const label = min === max ? `Q${min}` : `Q${min}–${max}`
    return { label, color: qualityColor(max) }
  }
  return null
}

/** Shared visual style for the small overlay chips on a listing card. */
export const CARD_CHIP_SX = {
  textTransform: "uppercase" as const,
  fontWeight: "bold" as const,
  fontSize: "0.65rem",
  height: 18,
} as const

/**
 * Absolute-positioned flex column for one card corner. Stacking chips in a
 * container (instead of pinning each chip with its own top/left and manually
 * offsetting for siblings) means any combination of chips lays out without
 * overlapping.
 */
export function cardChipStackSx(corner: "top-left" | "top-right") {
  return {
    position: "absolute" as const,
    top: 4,
    ...(corner === "top-left" ? { left: 4 } : { right: 4 }),
    zIndex: 5,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: corner === "top-left" ? "flex-start" : "flex-end",
    gap: 0.5,
    // Never cover the card's own click target.
    pointerEvents: "none" as const,
    maxWidth: "calc(50% - 8px)",
  }
}

export function ListingCardV2({ listing, index }: ListingCardV2Props) {
  const theme = useTheme<ExtendedTheme>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { openAddToCart } = useCartDrawer();

  const priceDisplay = formatPriceRange(listing.price_min, listing.price_max);

  const isNew = isAfter(new Date(listing.created_at), subDays(new Date(), 3));

  return (
    <Fade
      in={true}
      timeout={500}
      style={{ transitionDelay: `${50 + 50 * index}ms` }}
    >
      <ListingWrapper useFixedWidth={false}>
        <RouterLink
          to={formatMarketUrl(listing)}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <CardActionArea
            sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
          >
            <Card sx={{ height: 300, position: "relative" }}>
              {/* Corner chip stacks. Each corner is a flex column so chips can
                  never overlap regardless of which combination is present —
                  previously quality and NEW were both pinned to top-left for
                  out-of-stock listings, and internal/bulk shared bottom-right
                  via hand-computed offsets. */}
              <Box sx={cardChipStackSx("top-left")}>
                {isNew && (
                  <Chip
                    label={t("market.new", "NEW")}
                    color="secondary"
                    size="small"
                    sx={CARD_CHIP_SX}
                  />
                )}
                {listing.has_bulk_discount && (
                  <Chip
                    label={t("market.bulkDiscount", "BULK DISCOUNT")}
                    color="info"
                    size="small"
                    sx={CARD_CHIP_SX}
                  />
                )}
              </Box>
              <Box sx={cardChipStackSx("top-right")}>
                {(() => {
                  const qc = qualityChipProps(listing)
                  return (
                    qc && (
                      <Chip
                        label={qc.label}
                        size="small"
                        sx={{
                          ...CARD_CHIP_SX,
                          textTransform: "none",
                          bgcolor: qc.color,
                          color: "#fff",
                        }}
                      />
                    )
                  )
                })()}
                {listing.quantity_available === 0 && (
                  <Chip
                    label={t("market.outOfStock", "OUT OF STOCK")}
                    color="error"
                    size="small"
                    sx={CARD_CHIP_SX}
                  />
                )}
                {listing.visibility === "private" && (
                  <Chip
                    label={t("market.internalListing")}
                    color="warning"
                    size="small"
                    sx={CARD_CHIP_SX}
                  />
                )}
              </Box>
              <CardMedia
                component="img"
                loading="lazy"
                image={listing.photo || FALLBACK_IMAGE_URL}
                sx={{
                  width: "100%",
                  objectFit: "cover",
                  ...(theme.palette.mode === "dark"
                    ? { height: "100%", aspectRatio: "16/9" }
                    : { height: 180, aspectRatio: "16/9" }),
                  overflow: "hidden",
                }}
                alt={`Image of ${listing.title}`}
              />
              <Box
                sx={{
                  ...(theme.palette.mode === "light" ? { display: "none" } : {}),
                  position: "absolute",
                  zIndex: 3,
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  borderRadius: theme.spacing(theme.borderRadius.topLevel),
                  background: cardFadeGradient(theme, 50, 60),
                }}
              />
              <CardContent
                sx={{
                  ...(theme.palette.mode === "dark"
                    ? { position: "absolute", bottom: 0, zIndex: 4 }
                    : {}),
                  maxWidth: "100%",
                  padding: "8px 12px !important",
                }}
              >
                <Typography
                  variant="h6"
                  component="p"
                  color="primary"
                  fontWeight="bold"
                  noWrap
                  sx={{ fontSize: "0.95rem", mb: 0.5 }}
                >
                  {priceDisplay}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: "0.75rem",
                    lineHeight: 1.3,
                    maxHeight: 36,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    mb: 0.5,
                  }}
                >
                  {listing.title}
                </Typography>
                <Box sx={{ mb: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.25,
                      flexWrap: "wrap",
                    }}
                  >
                    <UnderlineLink
                      component="span"
                      display="inline"
                      noWrap
                      variant="caption"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(SHOP_PATHS.profile(listing.shop_slug));
                      }}
                      sx={{
                        overflowX: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {listing.shop_name}
                    </UnderlineLink>
                  </Box>
                  <Box
                    sx={{
                      fontSize: "0.7rem",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      mt: 0,
                      mb: 0,
                    }}
                  >
                    <MarketListingRating
                      avg_rating={listing.shop_rating}
                      rating_count={listing.shop_rating_count ?? null}
                      total_rating={0}
                      rating_streak={null}
                      total_orders={null}
                      total_assignments={null}
                      response_rate={null}
                      badge_ids={listing.shop_badge_ids}
                      display_limit={3}
                      showBadges={true}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </CardActionArea>
        </RouterLink>
        {listing.quantity_available > 0 && (
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => { e.stopPropagation(); openAddToCart(listing.listing_id); }}
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              zIndex: 5,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "primary.main", color: "primary.contrastText" },
            }}
            aria-label="Add to cart"
          >
            <AddShoppingCartRounded fontSize="small" />
          </IconButton>
        )}
      </ListingWrapper>
    </Fade>
  );
}
