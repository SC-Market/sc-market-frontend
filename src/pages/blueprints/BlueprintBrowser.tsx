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

import React, { useState, useEffect, useCallback } from "react"
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Stack,
} from "@mui/material"
import { ViewModule, ViewList } from "@mui/icons-material"
import { useSearchBlueprintsQuery, useGetBlueprintCategoriesQuery } from "../../store/api/v2/market"
import { useNavigate } from "react-router-dom"
import { useDebounce } from "../../hooks/useDebounce"
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll"
import { BlueprintCard } from "../../components/game-data/BlueprintCard"
import { formatCategoryName } from "../../util/categoryDisplay"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { BlueprintDetailModal } from "../../components/game-data/BlueprintDetailModal"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

type ViewMode = "grid" | "list"

/**
 * BlueprintBrowser Component
 * 
 * Features:
 * - Text search with partial matching (19.1, 43.10)
 * - Category filter with hierarchical support (19.2, 19.3)
 * - Rarity filter (19.1)
 * - Tier filter (19.1)
 * - Grid/list view toggle (43.10)
 * - Pagination (19.6)
 * - RTK Query integration (Task requirement)
 * - Debounced search for performance
 * - Responsive grid layout
 * - Material-UI components for consistency
 */
export function BlueprintBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  
  // Search and filter state
  const [searchText, setSearchText] = useState("")
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [rarity, setRarity] = useState("")
  const [tier, setTier] = useState<number | "">("")
  const [craftingStation, setCraftingStation] = useState("")
  const [ownedOnly, setOwnedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [allBlueprints, setAllBlueprints] = useState<any[]>([])

  // Debounce search text for performance (Requirement 19.6: <200ms response)
  const debouncedSearch = useDebounce(searchText, 300)

  // Reset on filter change
  const filterKey = JSON.stringify({ debouncedSearch, category, subcategory, rarity, tier, craftingStation, ownedOnly })
  useEffect(() => { setPage(1); setAllBlueprints([]) }, [filterKey])

  // Query blueprints with filters
  const { data, isLoading, isFetching, error } = useSearchBlueprintsQuery({
    text: debouncedSearch || undefined,
    itemCategory: category || undefined,
    itemSubcategory: subcategory || undefined,
    rarity: rarity || undefined,
    tier: tier || undefined,
    craftingStationType: craftingStation || undefined,
    userOwnedOnly: ownedOnly || undefined,
    page,
    pageSize: 20,
  })

  // Accumulate results
  useEffect(() => {
    if (data?.blueprints) {
      setAllBlueprints(prev => page === 1 ? data.blueprints : [...prev, ...data.blueprints])
    }
  }, [data, page])

  const hasMore = data ? page * data.page_size < data.total : false
  const loadMore = useCallback(() => setPage(p => p + 1), [])
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading: isFetching, onLoadMore: loadMore })

  // Query categories for filter options
  const { data: categories } = useGetBlueprintCategoriesQuery({})
  const isMobile = theme.breakpoints.values.md > window.innerWidth
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string | null>(null)

  const handleBlueprintClick = (blueprintId: string) => {
    navigate(`/blueprints/${blueprintId}`)
  }

  const handleResetFilters = () => {
    setSearchText("")
    setCategory("")
    setSubcategory("")
    setRarity("")
    setTier("")
    setCraftingStation("")
    setOwnedOnly(false)
    setPage(1)
  }

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  // Get unique categories and subcategories
  const uniqueCategories = Array.from(
    new Set(categories?.map((c) => c.category) || [])
  ).sort()

  const subcategoriesForCategory = categories
    ?.filter((c) => c.category === category && c.subcategory)
    .map((c) => c.subcategory!)
    .sort() || []

  return (
    <StandardPageLayout
      title={t("blueprints.browser.title", "Blueprint Browser")}
      headerTitle={t("blueprints.browser.header", "Blueprint Browser")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        {/* Header Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {t("blueprints.browser.description", "Search and filter blueprints to find crafting recipes")}
          </Typography>

          {/* View Mode Toggle (Requirement 43.10) */}
          <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <ViewModule />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewList />
          </ToggleButton>
          </ToggleButtonGroup>
        </Box>

      {/* Filters (Requirements 19.1-19.5) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Search Text (Requirement 19.1) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Search blueprints"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by blueprint or item name..."
                helperText="Partial name matching supported"
              />
            </Grid>

            {/* Category Filter (Requirement 19.2, 19.3) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setSubcategory("") // Reset subcategory when category changes
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {uniqueCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subcategory Filter (Requirement 19.2, 19.3) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" disabled={!category || subcategoriesForCategory.length === 0}>
                <InputLabel>Subcategory</InputLabel>
                <Select
                  value={subcategory}
                  label="Subcategory"
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <MenuItem value="">All Subcategories</MenuItem>
                  {subcategoriesForCategory.map((subcat) => (
                    <MenuItem key={subcat} value={subcat}>
                      {subcat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Rarity Filter (Requirement 19.1) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Rarity</InputLabel>
                <Select
                  value={rarity}
                  label="Rarity"
                  onChange={(e) => setRarity(e.target.value)}
                >
                  <MenuItem value="">All Rarities</MenuItem>
                  <MenuItem value="Common">Common</MenuItem>
                  <MenuItem value="Uncommon">Uncommon</MenuItem>
                  <MenuItem value="Rare">Rare</MenuItem>
                  <MenuItem value="Epic">Epic</MenuItem>
                  <MenuItem value="Legendary">Legendary</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Tier Filter (Requirement 19.1) */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Tier</InputLabel>
                <Select
                  value={tier}
                  label="Tier"
                  onChange={(e) => setTier(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <MenuItem value="">All Tiers</MenuItem>
                  <MenuItem value={1}>Tier 1</MenuItem>
                  <MenuItem value={2}>Tier 2</MenuItem>
                  <MenuItem value={3}>Tier 3</MenuItem>
                  <MenuItem value={4}>Tier 4</MenuItem>
                  <MenuItem value={5}>Tier 5</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Crafting Station</InputLabel>
                <Select
                  value={craftingStation}
                  label="Crafting Station"
                  onChange={(e) => setCraftingStation(e.target.value)}
                >
                  <MenuItem value="">All Stations</MenuItem>
                  <MenuItem value="Weapons Bench">Weapons Bench</MenuItem>
                  <MenuItem value="Armor Bench">Armor Bench</MenuItem>
                  <MenuItem value="Component Bench">Component Bench</MenuItem>
                  <MenuItem value="Vehicle Bench">Vehicle Bench</MenuItem>
                  <MenuItem value="Electronics Bench">Electronics Bench</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={ownedOnly}
                    onChange={(e) => setOwnedOnly(e.target.checked)}
                    size="small"
                  />
                }
                label="Owned Only"
              />
            </Grid>

            {/* Reset Button */}
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={handleResetFilters}
              >
                Reset all filters
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load blueprints. Please try again.
        </Alert>
      )}

      {/* Results */}
      {data && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {data.total} blueprints
          </Typography>

          {/* Grid View (Requirement 43.10) */}
          {viewMode === "grid" && (
            <Grid container spacing={2}>
              {allBlueprints.map((blueprint) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={blueprint.blueprint_id}>
                  <BlueprintCard
                    blueprint={blueprint}
                    viewMode="grid"
                    onClick={handleBlueprintClick}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* List View (Requirement 43.10) */}
          {viewMode === "list" && (
            <Paper>
              <Table size="small" sx={{ "& td, & th": { py: 0.5, px: 1 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell align="center">Ingredients</TableCell>
                    <TableCell align="center">Missions</TableCell>
                    <TableCell align="right">Craft Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allBlueprints.map((bp) => (
                    <TableRow
                      key={bp.blueprint_id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleBlueprintClick(bp.blueprint_id)}
                    >
                      <TableCell sx={{ width: 40 }}>
                        <Avatar
                          src={bp.output_item_icon}
                          variant="rounded"
                          sx={{ width: 28, height: 28, fontSize: "0.6rem", bgcolor: "primary.main" }}
                          imgProps={{ style: { objectFit: "contain" } }}
                        >
                          {(bp.output_item_name || "?").slice(0, 2).toUpperCase()}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 240 }}>
                          {bp.output_item_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {formatCategoryName(bp.item_category)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="nowrap">
                          {bp.rarity && <Chip label={bp.rarity} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
                          {bp.tier && <Chip label={`T${bp.tier}`} size="small" color="secondary" sx={{ height: 18, fontSize: "0.65rem" }} />}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">{bp.ingredient_count}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {bp.mission_count > 0
                          ? <Chip label={bp.mission_count} size="small" color="info" sx={{ height: 18, fontSize: "0.65rem", minWidth: 24 }} />
                          : <Typography variant="caption" color="text.disabled">—</Typography>}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption">
                          {bp.crafting_time_seconds
                            ? bp.crafting_time_seconds >= 60
                              ? `${Math.floor(bp.crafting_time_seconds / 60)}m${bp.crafting_time_seconds % 60 ? ` ${bp.crafting_time_seconds % 60}s` : ""}`
                              : `${bp.crafting_time_seconds}s`
                            : "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          {allBlueprints.length === 0 && !isFetching && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 6 }}>
              <Typography color="text.secondary">
                No blueprints found. Try adjusting your filters.
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
      </Grid>
      <BlueprintDetailModal
        blueprintId={selectedBlueprintId}
        open={!!selectedBlueprintId}
        onClose={() => setSelectedBlueprintId(null)}
      />
    </StandardPageLayout>
  )
}
