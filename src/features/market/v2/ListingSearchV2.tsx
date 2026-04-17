import React, { useMemo, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  useMediaQuery,
  Fade,
  Button,
  TextField,
  MenuItem,
  Typography,
  Autocomplete,
  InputAdornment,
  IconButton,
  CardContent,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { HideOnScroll, MarketNavArea } from "../components/MarketNavArea";
import { useSearchListingsQuery } from "../../../store/api/v2/market";
import type { ListingSearchResult } from "../../../store/api/v2/market";
import { QualityFilter } from "../../../components/market/v2/QualityFilter";
import { ListingWrapper } from "../components/listings/ListingCard";
import { ListingSkeleton } from "../../../components/skeletons";
import { ListingPagination } from "../components/listings/ListingPagination";
import { EmptyListings } from "../../../components/empty-states";
import { useMarketSidebarExp } from "../hooks/MarketSidebar";
import { useDrawerOpen } from "../../../hooks/layout/Drawer";
import { BottomSheet } from "../../../components/mobile/BottomSheet";
import { useMarketSidebar } from "../hooks/MarketSidebar";
import { SearchRounded } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useBottomNavHeight } from "../../../hooks/layout/useBottomNavHeight";
import { useTranslation } from "react-i18next";

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
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const marketSidebarOpen = useMarketSidebarExp();
  const [drawerOpen] = useDrawerOpen();

  // Read filter state from URL params
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse URL params to API format
  const searchQuery = useMemo(() => {
    const text = searchParams.get("text") || undefined;
    const gameItemId = searchParams.get("game_item_id") || undefined;
    const qualityTierMin = searchParams.get("quality_tier_min");
    const qualityTierMax = searchParams.get("quality_tier_max");
    const priceMin = searchParams.get("price_min");
    const priceMax = searchParams.get("price_max");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("page_size");
    const sortBy = searchParams.get("sort_by") as "created_at" | "price" | "quality" | "seller_rating" | undefined;
    const sortOrder = searchParams.get("sort_order") as "asc" | "desc" | undefined;

    return {
      text,
      gameItemId,
      qualityTierMin: qualityTierMin ? Number(qualityTierMin) : undefined,
      qualityTierMax: qualityTierMax ? Number(qualityTierMax) : undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : (isMobile ? 12 : 48),
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
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
      {/* Mobile/Tablet: Use bottom sheet for filters */}
      {showMobileSidebar && <MarketSidebarV2 />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>

              <Grid item xs={12}>
                <Divider light />
              </Grid>

              <Grid item xs={12}>
                <ListingGrid
                  listings={listings}
                  loading={isLoading || isFetching}
                  error={!!error}
                  onRetry={refetch}
                  gridBreakpoints={gridBreakpoints}
                  marketSidebarOpen={marketSidebarOpen}
                  ref={ref}
                />
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
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <ListingGrid
                      listings={listings}
                      loading={isLoading || isFetching}
                      error={!!error}
                      onRetry={refetch}
                      gridBreakpoints={gridBreakpoints}
                      marketSidebarOpen={marketSidebarOpen}
                      ref={ref}
                    />
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
 * Simplified version of V1 MarketSearchArea with V2-specific filters.
 * Maintains visual parity with V1 styling.
 */
function MarketSearchAreaV2() {
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filter values from URL
  const text = searchParams.get("text") || "";
  const priceMin = searchParams.get("price_min") || "";
  const priceMax = searchParams.get("price_max") || "";
  const sortBy = searchParams.get("sort_by") || "";
  const sortOrder = searchParams.get("sort_order") || "";

  // Update URL params
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1"); // Reset to first page
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const applyFilters = useCallback(() => {
    // Trigger search by updating params (already done by individual handlers)
    // This button is for user convenience
  }, []);

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
        <Grid item xs={12}>
          <Button
            onClick={applyFilters}
            startIcon={<SearchRounded />}
            variant={"contained"}
            fullWidth
          >
            {t("MarketSearchArea.searchBtn", "Search")}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label={t("MarketSearchArea.search", "Search")}
            value={text}
            onChange={(e) => updateParam("text", e.target.value)}
            color="secondary"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
              const val = e.target.value;
              if (!val) {
                updateParam("sort_by", "");
                updateParam("sort_order", "");
              } else {
                const [field, order] = val.split(":");
                const params = new URLSearchParams(searchParams);
                params.set("sort_by", field);
                params.set("sort_order", order);
                params.set("page", "1");
                setSearchParams(params);
              }
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
            <MenuItem value="seller_rating:desc">{t("MarketSearchArea.sortRatingHigh", "Rating: High to Low")}</MenuItem>
            <MenuItem value="seller_rating:asc">{t("MarketSearchArea.sortRatingLow", "Rating: Low to High")}</MenuItem>
          </TextField>
        </Grid>

        {/* Filtering */}
        <Grid item xs={12}>
          <Typography variant={"subtitle2"} fontWeight={"bold"}>
            {t("MarketSearchArea.filtering", "Filtering")}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("MarketSearchArea.minCost", "Min Price")}
            value={priceMin}
            onChange={(e) => updateParam("price_min", e.target.value)}
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
            value={priceMax}
            onChange={(e) => updateParam("price_max", e.target.value)}
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
          <QualityFilterWrapper />
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * MarketSidebarV2 - V2 mobile sidebar with bottom sheet
 */
function MarketSidebarV2() {
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

      {/* Toggle button for mobile */}
      <MarketSideBarToggleButtonV2 />
    </>
  );
}

/**
 * MarketSideBarToggleButtonV2 - Mobile FAB for opening filters
 */
function MarketSideBarToggleButtonV2() {
  const [open, setOpen] = useMarketSidebar();
  const theme = useTheme<ExtendedTheme>();
  const bottomNavHeight = useBottomNavHeight();
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={<FilterListIcon />}
      aria-label={t("market.toggleSidebar", "Toggle Filters")}
      onClick={() => setOpen((value) => !value)}
      sx={{
        position: "fixed",
        bottom: bottomNavHeight + 16,
        right: 24,
        zIndex: theme.zIndex.speedDial,
        borderRadius: 2,
        textTransform: "none",
        boxShadow: theme.shadows[4],
        backgroundColor: theme.palette.background.paper,
        "&:hover": {
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      {t("market.filters", "Filters")}
    </Button>
  );
}

/**
 * QualityFilterWrapper - Wrapper component for QualityFilter with URL state management
 */
function QualityFilterWrapper() {
  const [searchParams, setSearchParams] = useSearchParams();

  const minTier = useMemo(() => {
    const value = searchParams.get("quality_tier_min");
    return value ? Number(value) : null;
  }, [searchParams]);

  const maxTier = useMemo(() => {
    const value = searchParams.get("quality_tier_max");
    return value ? Number(value) : null;
  }, [searchParams]);

  const handleMinTierChange = useCallback(
    (tier: number | null) => {
      const params = new URLSearchParams(searchParams);
      if (tier === null) {
        params.delete("quality_tier_min");
      } else {
        params.set("quality_tier_min", String(tier));
      }
      params.set("page", "1"); // Reset to first page
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleMaxTierChange = useCallback(
    (tier: number | null) => {
      const params = new URLSearchParams(searchParams);
      if (tier === null) {
        params.delete("quality_tier_max");
      } else {
        params.set("quality_tier_max", String(tier));
      }
      params.set("page", "1"); // Reset to first page
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

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
interface ListingGridProps {
  listings: ListingSearchResult[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  gridBreakpoints: Record<string, number>;
  marketSidebarOpen: boolean;
}

const ListingGrid = React.forwardRef<HTMLDivElement, ListingGridProps>(
  ({ listings, loading, error, onRetry, gridBreakpoints, marketSidebarOpen }, ref) => {
    if (loading) {
      return (
        <Grid container spacing={1} sx={{ width: "100%" }}>
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
        <Grid container spacing={1} sx={{ width: "100%" }}>
          {listings.map((listing, index) => (
            <Grid item {...gridBreakpoints} key={listing.listing_id}>
              <ListingCardV2 listing={listing} index={index} />
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

function ListingCardV2({ listing, index }: ListingCardV2Props) {
  const theme = useTheme<ExtendedTheme>();
  const { i18n } = useTranslation();

  const priceDisplay = listing.price_min === listing.price_max
    ? `${listing.price_min.toLocaleString(i18n.language)} aUEC`
    : `${listing.price_min.toLocaleString(i18n.language)} – ${listing.price_max.toLocaleString(i18n.language)} aUEC`;

  return (
    <Fade
      in={true}
      timeout={500}
      style={{ transitionDelay: `${50 + 50 * index}ms` }}
    >
      <ListingWrapper useFixedWidth={false}>
        <RouterLink
          to={`/market/listing/${listing.listing_id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
        <Box
          sx={{
            minHeight: 400,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
            backgroundColor: theme.palette.background.paper,
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            "&:hover": { boxShadow: theme.shadows[4] },
          }}
        >
          <CardContent sx={{ padding: "8px 12px !important", flex: 1 }}>
            <Typography
              variant="h6"
              color="primary"
              fontWeight="bold"
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
            <RouterLink
              to={`/${listing.seller_type === "contractor" ? "contractor" : "user"}/${listing.seller_slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem", lineHeight: 1.2, "&:hover": { textDecoration: "underline" } }}
              >
                {listing.seller_name}
              </Typography>
            </RouterLink>

            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
              {listing.quality_tier_min != null && listing.quality_tier_max != null && (
                <Chip
                  label={
                    listing.quality_tier_min === listing.quality_tier_max
                      ? `Tier ${listing.quality_tier_min}`
                      : `Tier ${listing.quality_tier_min}–${listing.quality_tier_max}`
                  }
                  size="small"
                  color="secondary"
                  sx={{ fontSize: "0.65rem", height: 18, fontWeight: "bold" }}
                />
              )}
              {listing.variant_count > 1 && (
                <Chip
                  label={`${listing.variant_count} variants`}
                  size="small"
                  sx={{ fontSize: "0.65rem", height: 18 }}
                />
              )}
            </Box>
          </CardContent>
        </Box>
        </RouterLink>
      </ListingWrapper>
    </Fade>
  );
}
