/**
 * Blueprint Browser Component
 *
 * Search and filter blueprints with comprehensive features:
 * - Text search with debouncing
 * - Category, rarity, tier filters
 * - Grid/list view toggle
 * - Pagination
 * - Integration with useSearchBlueprintsQuery RTK Query hook
 *
 * Task 12.1 - Create BlueprintBrowser component
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 43.10
 */

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useLocalStorageState } from "../../hooks/storage/useLocalStorageState"
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material"
import { useBreakpointDown } from "../../hooks/layout/useBreakpoint"
import { ViewModuleRounded, ViewListRounded } from "@mui/icons-material"
import {
  useSearchBlueprintsQuery,
  useGetBlueprintCategoriesQuery,
  useAddBlueprintToInventoryMutation,
  useRemoveBlueprintFromInventoryMutation,
  type BlueprintSearchResult,
} from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { BlueprintCard } from "../../components/game-data/BlueprintCard"
import {
  CardGridSkeleton,
  TableSkeleton,
} from "../../components/game-data/GameDataSkeletons"
import { BLUEPRINT_CARD_GRID } from "../../components/game-data/cardGrids"
import { UnifiedSearchBar } from "../../components/game-data/UnifiedSearchBar"
import { useTranslation } from "react-i18next"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { VersionSelector } from "../../components/game-data/VersionSelector"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { GAME_DATA_PATHS } from "../../routes/paths"

import { useShoppingList } from "../../features/wishlists/hooks/WishlistContext"
import { useGetUserProfileQuery } from "../../features/profile/api/profileApi"
import { blueprintsSeoText } from "../../seo/hubHeads"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"

import { BlueprintResultsTable } from "./BlueprintResultsTable"
import { BlueprintBrowserFilters } from "./BlueprintBrowserFilters"
import { useBlueprintFilterParams } from "./useBlueprintFilterParams"
import { CollectionProgressCard } from "./CollectionProgressCard"

type ViewMode = "grid" | "list"
const VIEW_MODES: readonly ViewMode[] = ["grid", "list"]

export function BlueprintBrowser() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: profile } = useGetUserProfileQuery()
  const isLoggedIn = !!profile

  // View mode state
  const [viewMode, setViewMode] = useLocalStorageState<ViewMode>(
    "bp-view",
    "grid",
    VIEW_MODES,
  )

  // Search and filter state — persisted to URL params
  const [searchParams, setSearchParams] = useSearchParams()

  const {
    searchText,
    category,
    subcategory,
    rarity,
    tier,
    craftingStation,
    ownedOnly,
    hasMissionSource,
    setSearchText,
    setCategory,
    setSubcategory,
    setTier,
    setOwnedOnly,
    setHasMissionSource,
    source,
    setSource,
    hideUnsourceable,
    setHideUnsourceable,
    manufacturer,
    setManufacturer,
    manufacturerOptions,
    ingredientName,
    setIngredientName,
    searchTokens,
    handleTokensChange,
  } = useBlueprintFilterParams(searchParams, setSearchParams)
  const isMobile = useBreakpointDown("lg")
  const [page, setPage] = useState(1)
  const [allBlueprints, setAllBlueprints] = useState<BlueprintSearchResult[]>(
    [],
  )

  // Debounce search text for performance (Requirement 19.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Reset on filter change
  const filterKey = searchParams.toString()
  useEffect(() => {
    setPage(1)
    setAllBlueprints([])
  }, [filterKey])

  // Query blueprints with filters
  const {
    data,
    isLoading,
    isFetching,
    error,
    currentData: pageCurrentData,
  } = useSearchBlueprintsQuery(
    {
      text: debouncedSearch || undefined,
      itemCategory: category || undefined,
      itemSubcategory: subcategory || undefined,
      rarity: rarity || undefined,
      tier: tier || undefined,
      craftingStationType: craftingStation || undefined,
      userOwnedOnly: (isLoggedIn && ownedOnly) || undefined,
      source: source || undefined,
      manufacturer: manufacturer || undefined,
      ingredientName: ingredientName || undefined,
      // "Hide Unsourceable" (on by default) filters server-side, so every page
      // is full and `total` counts what is shown.
      sourceable: hideUnsourceable || undefined,
      // "Has Mission Source" filters server-side too (mission_count > 0).
      hasMissionSource: hasMissionSource || undefined,
      page,
      pageSize: 40,
    },
    { refetchOnMountOrArgChange: true },
  )
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching, currentData: pageCurrentData }),
  )

  // Accumulate results
  useEffect(() => {
    if (data?.blueprints) {
      setAllBlueprints((prev) =>
        page === 1 ? data.blueprints : [...prev, ...data.blueprints],
      )
    }
  }, [data, page])

  // The first page renders straight from the query (before the accumulating
  // effect runs), so the first render — and a prerendered page — has it.
  const shownBlueprints =
    allBlueprints.length === 0 && page === 1 && data?.blueprints
      ? data.blueprints
      : allBlueprints

  const hasMore = data ? page * data.page_size < data.total : false
  const loadMore = useCallback(() => setPage((p) => p + 1), [])
  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isFetching,
    onLoadMore: loadMore,
  })

  // Query categories for filter options
  const { data: categories } = useGetBlueprintCategoriesQuery({})
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(
    null,
  )

  // Auto-open modal if URL has a blueprint ID (e.g., /blueprints/:id on desktop)
  const urlParams = useParams<{ slug?: string }>()
  React.useEffect(() => {
    if (urlParams.slug && !isMobile) setSelectedBlueprintId(urlParams.slug)
  }, [urlParams.slug, isMobile])

  const handleBlueprintClick = (
    blueprintId: string,
    blueprintCode?: string,
  ) => {
    const urlSlug = blueprintCode || blueprintId
    const params = searchParams.toString()
    const qs = params ? `?${params}` : ""
    navigate(`${GAME_DATA_PATHS.blueprint(urlSlug)}${qs}`)
    if (!isMobile) setSelectedBlueprintId(urlSlug)
  }

  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()
  const { addToShoppingList } = useShoppingList()
  const handleBookmarkToggle = async (
    blueprintId: string,
    shouldOwn: boolean,
  ) => {
    try {
      if (shouldOwn) await addToInventory({ blueprintId, body: {} }).unwrap()
      else await removeFromInventory({ blueprintId }).unwrap()
      setAllBlueprints((prev) =>
        prev.map((bp) =>
          bp.blueprint_id === blueprintId
            ? { ...bp, user_owns: shouldOwn }
            : bp,
        ),
      )
    } catch {
      /* user not logged in or error */
    }
  }

  const { title: pageTitle, description: pageDescription } = useMemo(
    () => blueprintsSeoText(category, data?.total),
    [category, data?.total],
  )

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
    setPage(1)
  }

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  // Get unique categories and subcategories
  const uniqueCategories = Array.from(
    new Set(categories?.map((c) => c.category) || []),
  ).sort()

  const subcategoriesForCategory =
    categories
      ?.filter((c) => c.category === category && c.subcategory)
      .map((c) => c.subcategory!)
      .sort() || []

  const filtersContent = (
    <BlueprintBrowserFilters
      searchText={searchText}
      setSearchText={setSearchText}
      category={category}
      setCategory={setCategory}
      subcategory={subcategory}
      setSubcategory={setSubcategory}
      uniqueCategories={uniqueCategories}
      subcategoriesForCategory={subcategoriesForCategory}
      tier={tier}
      setTier={setTier}
      isLoggedIn={isLoggedIn}
      ownedOnly={ownedOnly}
      setOwnedOnly={setOwnedOnly}
      hasMissionSource={hasMissionSource}
      setHasMissionSource={setHasMissionSource}
      hideUnsourceable={hideUnsourceable}
      setHideUnsourceable={setHideUnsourceable}
      source={source}
      setSource={setSource}
      manufacturer={manufacturer}
      setManufacturer={setManufacturer}
      manufacturerOptions={manufacturerOptions}
      ingredientName={ingredientName}
      setIngredientName={setIngredientName}
      handleResetFilters={handleResetFilters}
    />
  )

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      headerTitle={t("blueprints.browser.header", "Blueprint Browser")}
      sidebarOpen={true}
      maxWidth="xl"
      headerActions={<VersionSelector compact width={220} />}
    >
      <Grid item xs={12}>
        {/* Collection progress — shown on inventory page */}
        {isLoggedIn && searchParams.get("inventory") === "true" && (
          <CollectionProgressCard />
        )}
        <FilterSidebarLayout
          filters={filtersContent}
          filterTitle={t("blueprintsUi.browser.filters")}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              mode="blueprints"
              extraOptions={manufacturerOptions}
              placeholder={t("blueprintsUi.browser.searchBarPlaceholder")}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {data ? data.total : ""}
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton
                value="grid"
                aria-label={t("ui.viewMode.grid", "Grid view")}
              >
                <ViewModuleRounded />
              </ToggleButton>
              <ToggleButton
                value="list"
                aria-label={t("ui.viewMode.list", "List view")}
              >
                <ViewListRounded />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Loading State */}
          {/* Grid cards: icon row, name, ingredient chips, actions (~270px) */}
          {isLoading &&
            (viewMode === "grid" ? (
              <CardGridSkeleton shape={BLUEPRINT_CARD_GRID} count={12} />
            ) : (
              <TableSkeleton />
            ))}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("blueprintsUi.browser.loadError")}
            </Alert>
          )}

          {/* Results */}
          {data && (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <Grid container spacing={BLUEPRINT_CARD_GRID.spacing}>
                  {shownBlueprints.map((blueprint) => (
                    <Grid
                      item
                      {...BLUEPRINT_CARD_GRID.item}
                      key={blueprint.blueprint_id}
                    >
                      <BlueprintCard
                        blueprint={blueprint}
                        viewMode="grid"
                        onClick={handleBlueprintClick}
                        onBookmarkToggle={handleBookmarkToggle}
                        onWishlistAdd={(id) => addToShoppingList(id)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <BlueprintResultsTable
                  blueprints={shownBlueprints}
                  onBlueprintClick={handleBlueprintClick}
                />
              )}

              {shownBlueprints.length === 0 && !isFetching && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 6,
                  }}
                >
                  <Typography color="text.secondary">
                    {t("blueprintsUi.browser.noResults")}
                  </Typography>
                </Box>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} />
              {isFetching && page > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
      <BlueprintDetailModal
        blueprintId={selectedBlueprintId}
        open={!!selectedBlueprintId}
        onClose={() => {
          setSelectedBlueprintId(null)
          navigate(`${GAME_DATA_PATHS.blueprints}?${searchParams.toString()}`, {
            replace: true,
          })
        }}
      />
    </StandardPageLayout>
  )
}
